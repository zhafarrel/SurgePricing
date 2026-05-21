const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'surgeticket-secret-dev-key';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Redis Client
const redisClient = createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'surgeticket_db',
    password: 'postgres',
    port: 5432,
});

// GET ALL EVENTS
app.get('/api/events', async (req, res) => {
    try {
        const eventIds = await redisClient.sMembers('events:all');
        const events = [];

        for (const id of eventIds) {
            const eventData = await redisClient.hGetAll(`event:${id}`);
            events.push(eventData);
        }

        res.json({ success: true, data: events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data event' });
    }
});

// GET EVENT DETAILS & TICKETS
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventData = await redisClient.hGetAll(`event:${eventId}`);

        if (!eventData || !eventData.id) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const keys = await redisClient.keys(`ticket:${eventId}:*`);
        const ticketIds = new Set();
        keys.forEach(key => {
            const parts = key.split(':');
            if (parts.length === 3) {
                ticketIds.add(parts[2]);
            }
        });

        const tickets = [];
        for (const tid of ticketIds) {
            const tData = await redisClient.hGetAll(`ticket:${eventId}:${tid}`);
            const currentStock = await redisClient.get(`ticket:${eventId}:${tid}:stock`);
            if (tData && tData.id) {
                tickets.push({
                    ...tData,
                    base_price: parseInt(tData.base_price),
                    initial_stock: parseInt(tData.initial_stock),
                    current_stock: currentStock !== null ? parseInt(currentStock) : parseInt(tData.initial_stock)
                });
            }
        }

        res.json({ success: true, data: { ...eventData, tickets } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil detail event' });
    }
});

// GET TICKET STATUS (Surge Pricing Logic + Live Benchmarking)
app.get('/api/status/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;

        // Live branchmarking Redis
        const startRedis = process.hrtime();

        // MENGIRIM 4 REQUEST KE REDIS SECARA BERSAMAAN DALAM 1 PERJALANAN
        const [ticketHash, viewersRaw, stokRaw, revenueRaw] = await Promise.all([
            redisClient.hGetAll(`ticket:${eventId}:${ticketId}`),
            redisClient.get(`ticket:${eventId}:${ticketId}:viewers`),
            redisClient.get(`ticket:${eventId}:${ticketId}:stock`),
            redisClient.get(`ticket:${eventId}:${ticketId}:revenue`)
        ]);

        if (!ticketHash || !ticketHash.base_price) {
            return res.status(404).json({ error: 'Tiket tidak ditemukan' });
        }

        const HARGA_DASAR = parseInt(ticketHash.base_price);
        const STOK_AWAL = parseInt(ticketHash.initial_stock);
        const TARGET_REVENUE = HARGA_DASAR * STOK_AWAL;

        // Parse data yang didapat dari Promise.all
        const viewers = parseInt(viewersRaw) || 0;
        const stok = parseInt(stokRaw) || 0;
        const revenue = parseFloat(revenueRaw) || 0;

        const endRedis = process.hrtime(startRedis);
        const latencyRedis = (endRedis[0] * 1000 + endRedis[1] / 1000000).toFixed(3);


        // Live branchmarking sql
        let latencySQL = "Error";
        try {
            const startSQL = process.hrtime();
            await pool.query(
                'SELECT stok, viewers, revenue FROM tiket_sql WHERE event_id = $1 AND ticket_id = $2',
                [eventId, ticketId]
            );
            const endSQL = process.hrtime(startSQL);
            latencySQL = (endSQL[0] * 1000 + endSQL[1] / 1000000).toFixed(3);
        } catch (err) {
            console.error("SQL Benchmarking Error:", err.message);
        }

        // Logika Surge Pricing
        let harga_target = 0;
        if (stok > 0) {
            harga_target = (TARGET_REVENUE - revenue) / stok;
        }

        let harga_demand = HARGA_DASAR;
        let status = "Normal";

        if (stok > 0) {
            if (viewers >= 4) {
                harga_demand = HARGA_DASAR * 2.5;
                status = "CRITICAL SURGE";
            } else if (viewers >= 2) {
                harga_demand = HARGA_DASAR * 1.5;
                status = "SURGE PRICING";
            }
        } else {
            status = "SOLD OUT";
        }

        const harga_final = Math.max(harga_target, harga_demand, HARGA_DASAR);

        // Simpan harga final ter-update ke Redis
        await redisClient.set(`ticket:${eventId}:${ticketId}:price`, harga_final);

        // Respons JSON dikirim dengan menyertakan objek live_latency
        res.json({
            viewers: viewers,
            stok: stok,
            harga_sekarang: Math.round(harga_final),
            revenue: Math.round(revenue),
            status: status,
            live_latency: {
                redis_ms: latencyRedis,
                sql_ms: latencySQL
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengambil status' });
    }
});

// MASUK (Increment Viewers)
app.post('/api/masuk/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const currentViewers = await redisClient.incr(`ticket:${eventId}:${ticketId}:viewers`);
        res.json({ success: true, viewers: currentViewers });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// KELUAR (Decrement Viewers)
app.post('/api/keluar/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const key = `ticket:${eventId}:${ticketId}:viewers`;
        const current = parseInt(await redisClient.get(key)) || 0;
        if (current > 0) {
            await redisClient.decr(key);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// BELI TIKET
app.post('/api/beli/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const stokKey = `ticket:${eventId}:${ticketId}:stock`;
        const stok = parseInt(await redisClient.get(stokKey)) || 0;

        if (stok > 0) {
            await redisClient.decr(stokKey);
            const harga = parseFloat(await redisClient.get(`ticket:${eventId}:${ticketId}:price`)) || 0;
            if (harga > 0) {
                await redisClient.incrByFloat(`ticket:${eventId}:${ticketId}:revenue`, harga);
            }
            res.json({ success: true, message: "Tiket berhasil didapat!" });
        } else {
            res.json({ success: false, message: "Tiket Habis!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, dan password wajib diisi' });
        }

        const userKey = `user:${username}`;
        const existingUser = await redisClient.hGetAll(userKey);

        if (existingUser && existingUser.username) {
            return res.status(400).json({ success: false, message: 'Username sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await redisClient.hSet(userKey, {
            username: username,
            email: email,
            password: hashedPassword
        });

        res.json({ success: true, message: 'Registrasi berhasil' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
        }

        const userKey = `user:${username}`;
        const user = await redisClient.hGetAll(userKey);

        if (!user || !user.username) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, message: 'Login berhasil', token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});

// Inisialisasi Data & Jalankan Server
async function startServer() {
    await redisClient.connect();
    app.listen(port, () => {
        console.log(`🚀 Backend API berjalan di http://localhost:${port}`);
    });
}

startServer();