const { SqliteDriver } = require('@mikro-orm/sqlite');
const { RequestHistory } = require('./entities/RequestHistory');


module.exports = {
entities: [RequestHistory],
dbName: 'history.db',
driver: SqliteDriver,
debug: true,
};