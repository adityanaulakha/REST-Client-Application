import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import localforage from 'localforage';


export default function HistoryPanel({ onLoadHistory }) {
	const [history, setHistory] = useState([]);
	const [cursor, setCursor] = useState(null);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const cacheKey = 'history-pages-v1';
	const [q, setQ] = useState('');
	const [methodFilter, setMethodFilter] = useState('');
	const containerRef = useRef(null);

	const fetchCursor = useCallback(async (c, m, qstr) => {
		// c = null -> initial
		let qp = c ? `?cursor=${encodeURIComponent(c)}&limit=10` : `?limit=10`;
		if (m) qp += `&method=${encodeURIComponent(m)}`;
		if (qstr) qp += `&q=${encodeURIComponent(qstr)}`;
		const res = await axios.get(`http://localhost:4000/api/history${qp}`);
		return res.data;
	}, []);

	useEffect(() => {
		// try hydrate from localforage then load
		let mounted = true;
		localforage.getItem(cacheKey).then((v) => {
			if (!mounted) return;
			if (v && Array.isArray(v)) setHistory(v);
			loadHistory();
		}).catch(() => loadHistory());
		return () => { mounted = false };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Reload when filters change
	useEffect(() => {
		if (methodFilter !== '' || q !== '') {
			loadHistory();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [methodFilter, q]);

	const loadHistory = async () => {
		if (!hasMore || loading) return;
		setLoading(true);
		try {
			const data = await fetchCursor(cursor, methodFilter, q);
			const items = data.items || [];
			
			// Deduplicate items by ID to prevent React key conflicts
			setHistory((h) => {
				const existingIds = new Set(h.map(item => item.id));
				const newItems = items.filter(item => !existingIds.has(item.id));
				return [...h, ...newItems];
			});
			
			// persist to cache with deduplication
			try { 
				const cachedItems = await localforage.getItem(cacheKey) || [];
				const existingIds = new Set(cachedItems.map(item => item.id));
				const newItems = items.filter(item => !existingIds.has(item.id));
				await localforage.setItem(cacheKey, [...cachedItems, ...newItems]); 
			} catch (e) { }
			
			if (data.nextCursor) {
				setCursor(data.nextCursor);
			} else {
				setHasMore(false);
			}
		} finally {
			setLoading(false);
		}
	};

	const clearCacheAndReload = async () => {
		await localforage.removeItem(cacheKey);
		setHistory([]);
		setCursor(null);
		setHasMore(true);
		setLoading(false);
		setQ('');
		setMethodFilter('');
		// Trigger fresh load
		setTimeout(() => loadHistory(), 100);
	};

	// lazy load when scrolling near bottom
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const onScroll = () => {
			if (loading || !hasMore) return;
			if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
				loadHistory();
			}
		};
		el.addEventListener('scroll', onScroll);
		return () => el.removeEventListener('scroll', onScroll);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, hasMore, cursor]);

	const handleClickItem = async (id) => {
		// try local cache first
		const stored = await localforage.getItem(cacheKey) || [];
		const found = stored.find((it) => it.id === id) || history.find((it) => it.id === id);
		if (found) {
			if (found.responseFile) {
				// fetch file
				const url = `http://localhost:4000/storage/${found.responseFile}`;
				const resp = await axios.get(url, { responseType: 'arraybuffer' });
				let parsed;
				try { parsed = JSON.parse(Buffer.from(resp.data).toString()); } catch (e) { parsed = Buffer.from(resp.data).toString(); }
				return onLoadHistory(parsed);
			}
			return onLoadHistory(found.responseBody);
		}
		// fallback to fetch single
		try {
			const res = await axios.get(`http://localhost:4000/api/history/${id}`);
			onLoadHistory(res.data.responseBody);
		} catch (e) {
			console.error(e);
		}
	};

	const getMethodColor = (method) => {
		switch (method?.toUpperCase()) {
			case 'GET': return 'bg-green-100 text-green-800 border-green-200';
			case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
			case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mt-6 h-96 flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-bold text-gray-800 flex items-center">
					<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					History
				</h3>
				<div className="flex gap-3">
					<select 
						value={methodFilter} 
						onChange={(e) => { setMethodFilter(e.target.value); setHistory([]); setCursor(null); setHasMore(true); setLoading(false); }} 
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
					>
						<option value="">All Methods</option>
						<option>GET</option>
						<option>POST</option>
						<option>PUT</option>
						<option>DELETE</option>
					</select>
					<input 
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm" 
						placeholder="Search URL..." 
						value={q} 
						onChange={(e) => { setQ(e.target.value); setHistory([]); setCursor(null); setHasMore(true); setLoading(false); }} 
					/>
					<button 
						className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 text-sm font-medium border border-red-200" 
						onClick={clearCacheAndReload}
					>
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Clear
					</button>
				</div>
			</div>
			
			<div ref={containerRef} className="flex-1 overflow-auto">
				{history.length === 0 && !loading ? (
					<div className="flex items-center justify-center h-full text-gray-500">
						<div className="text-center">
							<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
							<p className="mt-2 text-sm">No request history found</p>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						{history.map((item) => (
							<div key={item.id} className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition duration-200" onClick={() => handleClickItem(item.id)}>
								<div className="flex items-center justify-between mb-2">
									<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMethodColor(item.method)}`}>
										{item.method}
									</span>
									<span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
								</div>
								<div className="text-sm font-medium text-gray-900 truncate">{item.url}</div>
							</div>
						))}
					</div>
				)}
				
				{loading && (
					<div className="flex items-center justify-center py-4">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
						<span className="text-sm text-gray-600">Loading...</span>
					</div>
				)}
				
				{!loading && hasMore && (
					<button 
						className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 text-sm font-medium flex items-center justify-center" 
						onClick={loadHistory}
					>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
						</svg>
						Load More
					</button>
				)}
				
				{!hasMore && history.length > 0 && (
					<div className="text-center text-sm text-gray-500 mt-4 py-2">
						<svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
						All history loaded
					</div>
				)}
			</div>
		</div>
	);
}