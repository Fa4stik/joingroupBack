const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: '123',
    host: '176.124.193.54',
    port: 5432,
    database: 'joingroup'
});

module.exports = pool;