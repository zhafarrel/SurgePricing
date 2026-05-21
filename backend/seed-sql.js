const { Pool, Client } = require('pg');

async function seedSQL() {
    try {
        console.log("Connecting to default postgres database...");
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: 'postgres',
            port: 5432,
        });
        await client.connect();
        
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'surgeticket_db'");
        if (res.rowCount === 0) {
            console.log("Creating database surgeticket_db...");
            await client.query('CREATE DATABASE surgeticket_db');
        }
        await client.end();

        console.log("Connecting to surgeticket_db...");
        const pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'surgeticket_db',
            password: 'postgres',
            port: 5432,
        });

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tiket_sql (
                event_id VARCHAR(50),
                ticket_id VARCHAR(50),
                stok INT,
                viewers INT,
                revenue NUMERIC,
                harga_sekarang NUMERIC
            );
        `);
        console.log("Table tiket_sql is ready.");

        await pool.query('TRUNCATE TABLE tiket_sql;');
        
        const insertQuery = `
            INSERT INTO tiket_sql (event_id, ticket_id, stok, viewers, revenue, harga_sekarang) VALUES 
            ('1', 'vip', 50, 0, 0, 1500000),
            ('1', 'regular', 500, 0, 0, 500000),
            ('2', 'cat1', 20, 0, 0, 5000000),
            ('2', 'festival', 300, 0, 0, 3500000),
            ('3', 'vip', 100, 0, 0, 3000000),
            ('3', 'tribune', 800, 0, 0, 1300000),
            ('4', 'vip', 5, 0, 0, 11000000),
            ('4', 'cat3', 150, 0, 0, 3500000);
        `;
        
        await pool.query(insertQuery);
        console.log("✅ Successfully seeded dummy data into PostgreSQL!");
        await pool.end();

    } catch (err) {
        console.error("❌ SQL Error:", err.message);
        console.log("Hint: Pastikan PostgreSQL berjalan.");
    }
}

seedSQL();
