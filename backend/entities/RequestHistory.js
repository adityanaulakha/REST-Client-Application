const { EntitySchema } = require('@mikro-orm/core');


module.exports.RequestHistory = new EntitySchema({
name: 'RequestHistory',
properties: {
id: { type: 'number', primary: true, autoincrement: true },
method: { type: 'string' },
url: { type: 'string' },
headers: { type: 'json', nullable: true },
body: { type: 'json', nullable: true },
responseStatus: { type: 'number', nullable: true },
responseBody: { type: 'json', nullable: true },
	responseHeaders: { type: 'json', nullable: true },
	responseFile: { type: 'string', nullable: true },
createdAt: { type: 'date', defaultRaw: 'CURRENT_TIMESTAMP' },
},
});