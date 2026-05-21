const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
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

        // To find tickets for this event, we scan keys ticket:eventId:* (excluding stock/viewers/revenue)
        // Since redis keys are string based, we will fetch VIP and Regular as an example, 
        // or we can use scan. Better yet, since we don't have a set of ticket IDs per event, 
        // let's fetch all keys matching `ticket:${eventId}:*` and filter.
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

// GET TICKET STATUS (Surge Pricing Logic)
app.get('/api/status/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const ticketHash = await redisClient.hGetAll(`ticket:${eventId}:${ticketId}`);
        
        if (!ticketHash || !ticketHash.base_price) {
            return res.status(404).json({ error: 'Tiket tidak ditemukan' });
        }

        const HARGA_DASAR = parseInt(ticketHash.base_price);
        const STOK_AWAL = parseInt(ticketHash.initial_stock);
        const TARGET_REVENUE = HARGA_DASAR * STOK_AWAL;

        const viewers = parseInt(await redisClient.get(`ticket:${eventId}:${ticketId}:viewers`)) || 0;
        const stok = parseInt(await redisClient.get(`ticket:${eventId}:${ticketId}:stock`)) || 0;
        const revenue = parseFloat(await redisClient.get(`ticket:${eventId}:${ticketId}:revenue`)) || 0;

        let harga_target = 0;
        if (stok > 0) {
            harga_target = (TARGET_REVENUE - revenue) / stok;
        }

        let harga_demand = HARGA_DASAR;
        let status = "Normal";

        if (stok > 0) {
            // DEMO MODE: Menggunakan angka absolute (bukan rasio) 
            // agar mudah didemonstrasikan di kelas tanpa perlu ratusan tab
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
        
        // Simpan harga final
        await redisClient.set(`ticket:${eventId}:${ticketId}:price`, harga_final);

        res.json({
            viewers: viewers,
            stok: stok,
            harga_sekarang: Math.round(harga_final),
            revenue: Math.round(revenue),
            status: status
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

// RESET VIEWERS (Admin Utility)
app.post('/api/reset-viewers/:eventId/:ticketId', async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const key = `ticket:${eventId}:${ticketId}:viewers`;
        await redisClient.set(key, 0);
        res.json({ success: true, message: "Viewers reset to 0" });
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
    // We don't reset data here anymore because the seeder handles it.
    app.listen(port, () => {
        console.log(`🚀 Backend API berjalan di http://localhost:${port}`);
    });
}

startServer();