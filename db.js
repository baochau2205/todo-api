const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: true })
    : new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE_ENV === 'test' ? 'jobs_test_db' : process.env.DB_NAME,
    });

module.exports = pool;