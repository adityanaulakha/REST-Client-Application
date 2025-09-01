const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MikroORM } = require('@mikro-orm/core');
const config = require('./mikro-orm.config');
const { RequestHistory } = require('./entities/RequestHistory');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// serve stored response files
app.use('/storage', express.static(path.join(__dirname, 'storage')));


let orm;
// initialize ORM before starting server
const init = async () => {
	orm = await MikroORM.init(config);
	await orm.getSchemaGenerator().updateSchema();
};

init().catch((e) => {
	console.error('ORM init failed', e);
	process.exit(1);
});


// Proxy endpoint for HTTP requests
app.post('/api/relay', async (req, res) => {
	const { method, url, headers, body } = req.body;
	const em = orm.em.fork();
	// Basic URL validation and optional allowlist to reduce SSRF risk
	let parsed;
	try {
		parsed = new URL(url);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			return res.status(400).json({ error: 'only http(s) protocol is allowed' });
		}
	} catch (e) {
		return res.status(400).json({ error: 'invalid url' });
	}

	const allowlist = process.env.ALLOWED_HOSTS; // comma-separated hostnames (optional)
	if (allowlist) {
		const hosts = allowlist.split(',').map(s => s.trim()).filter(Boolean);
		const hostname = parsed.hostname;
		const ok = hosts.some(h => hostname === h || hostname.endsWith(`.${h}`));
		if (!ok) return res.status(403).json({ error: 'target host not allowed' });
	}

	try {
		const response = await axios({ method, url, headers, data: body, responseType: 'arraybuffer' });

		// if response is large, offload to disk instead of storing in DB
		const MAX_INLINE = parseInt(process.env.MAX_INLINE_RESPONSE || '200000'); // bytes
		let respBody = null;
		let respFile = null;
		if (response.data && response.data.byteLength > MAX_INLINE) {
			// store to storage folder
			const storageDir = path.join(__dirname, 'storage');
			if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
			const fileName = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.bin`;
			const filePath = path.join(storageDir, fileName);
			fs.writeFileSync(filePath, Buffer.from(response.data));
			respFile = fileName;
		} else {
			// try to parse as JSON, otherwise store raw buffer converted to string
			try { respBody = JSON.parse(Buffer.from(response.data).toString()); } catch (e) { respBody = Buffer.from(response.data).toString(); }
		}

		const history = em.create(RequestHistory, {
			method,
			url,
			headers,
			body,
			responseStatus: response.status,
			responseBody: respBody,
			responseHeaders: response.headers,
			responseFile: respFile,
		});
		await em.persistAndFlush(history);

		res.json({ status: response.status, data: respBody, headers: response.headers, file: respFile });
	} catch (err) {
		// capture more information when available
		const respStatus = err.response ? err.response.status : 500;
		const respBody = err.response ? err.response.data : err.message;
		const history = em.create(RequestHistory, {
			method,
			url,
			headers,
			body,
			responseStatus: respStatus,
			responseBody: respBody,
		});
		await em.persistAndFlush(history);

		res.status(respStatus || 500).json({ error: err.message, details: respBody });
	}
});


// History endpoint with pagination
app.get('/api/history', async (req, res) => {
	const em = orm.em.fork();
	const limit = Math.min(parseInt(req.query.limit) || 10, 100);
	const methodFilter = req.query.method;
	const q = req.query.q; // substring search in url
	const cursor = req.query.cursor; // optional cursor in format <createdAt>::<id>

	const where = {};
	if (methodFilter) where.method = methodFilter;
	if (q) where.url = { $like: `%${q}%` };

	// cursor pagination: fetch items with createdAt < cursor.createdAt OR (createdAt == cursor.createdAt && id < cursor.id)
	if (cursor) {
		const [createdAtStr, idStr] = cursor.split('::');
		const createdAt = new Date(createdAtStr);
		const id = parseInt(idStr);
		// mikro-orm doesn't support complex OR easily in find, so use raw qb
		const qb = em.createQueryBuilder(RequestHistory, 'h')
			.select('*')
			.where('h.created_at < ? OR (h.created_at = ? AND h.id < ?)', [createdAt.toISOString(), createdAt.toISOString(), id])
			.orderBy({ created_at: 'DESC', id: 'DESC' })
			.limit(limit);
		if (methodFilter) qb.andWhere('h.method = ?', [methodFilter]);
		if (q) qb.andWhere('h.url LIKE ?', [`%${q}%`]);
		const items = await qb.execute('all');
		// next cursor
		const last = items[items.length - 1];
		const nextCursor = last ? `${new Date(last.created_at).toISOString()}::${last.id}` : null;
		return res.json({ items, nextCursor });
	}

	// fallback offset pagination
	const page = parseInt(req.query.page) || 1;
	const [items, count] = await em.findAndCount(RequestHistory, where, {
		limit,
		offset: (page - 1) * limit,
		orderBy: { createdAt: 'DESC' },
	});
	res.json({ items, total: count, page, totalPages: Math.ceil(count / limit) });
});

// single history item
app.get('/api/history/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	if (!id) return res.status(400).json({ error: 'invalid id' });
	const em = orm.em.fork();
	const item = await em.findOne(RequestHistory, { id });
	if (!item) return res.status(404).json({ error: 'not found' });
	res.json(item);
});


// ensure ORM initialized before listening
const startServer = () => {
	app.listen(4000, () => console.log('Server running at http://localhost:4000'));
};

// wait until ORM is set
const waitForOrm = setInterval(() => {
	if (orm) {
		clearInterval(waitForOrm);
		startServer();
	}
}, 50);