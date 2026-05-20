const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Redis Client
const redisClient = createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Konstanta Bisnis
const HARGA_DASAR = 100000;
const TARGET_REVENUE = 15000000;
const STOK_AWAL = 100;

// GET STATUS 
app.get('/api/status', async (req, res) => {
    try {
        const viewers = parseInt(await redisClient.get('ticket:vip:active_viewers')) || 0;
        const stok = parseInt(await redisClient.get('ticket:vip:stock_left')) || 0;
        const revenue = parseFloat(await redisClient.get('ticket:vip:current_revenue')) || 0;

        // Harga berdasarkan Target Revenue
        let harga_target = 0;
        if (stok > 0) {
            harga_target = (TARGET_REVENUE - revenue) / stok;
        }

        // Harga berdasarkan Demand
        let harga_demand = HARGA_DASAR;
        let status = "Normal";

        if (stok > 0) {
            const rasio = viewers / stok;
            if (rasio > 10) {
                harga_demand = HARGA_DASAR * 2.5;
                status = "CRITICAL SURGE";
            } else if (rasio > 5) {
                harga_demand = HARGA_DASAR * 1.5;
                status = "SURGE PRICING";
            }
        } else {
            status = "SOLD OUT";
        }

        // Tentukan Harga Final
        const harga_final = Math.max(harga_target, harga_demand, HARGA_DASAR);

        // Simpan harga final ke Redis 
        await redisClient.set('ticket:vip:current_price', harga_final);

        // Kirim response ke Frontend
        res.json({
            viewers: viewers,
            stok: stok,
            harga_sekarang: Math.round(harga_final),
            revenue: Math.round(revenue),
            status: status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengambil data' });
    }
});

// MASUK 
app.post('/api/masuk', async (req, res) => {
    try {
        // Atomic Increment
        const currentViewers = await redisClient.incr('ticket:vip:active_viewers');
        res.json({ success: true, viewers: currentViewers });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// KELUAR 
app.post('/api/keluar', async (req, res) => {
    try {
        // Cek dulu jangan sampai minus
        const current = parseInt(await redisClient.get('ticket:vip:active_viewers')) || 0;
        if (current > 0) {
            await redisClient.decr('ticket:vip:active_viewers');
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// BELI TIKET 
app.post('/api/beli', async (req, res) => {
    try {
        const stok = parseInt(await redisClient.get('ticket:vip:stock_left')) || 0;

        if (stok > 0) {
            // Atomic Decrement Stok
            await redisClient.decr('ticket:vip:stock_left');

            // Ambil harga detik ini
            const harga = parseFloat(await redisClient.get('ticket:vip:current_price')) || HARGA_DASAR;

            // Tambah uang ke brankas
            await redisClient.incrByFloat('ticket:vip:current_revenue', harga);

            res.json({ success: true, message: "Tiket berhasil didapat!" });
        } else {
            res.json({ success: false, message: "Tiket Habis!" });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Inisialisasi Data & Jalankan Server
async function startServer() {
    await redisClient.connect();

    // Reset data setiap kali server menyala
    await redisClient.set('ticket:vip:active_viewers', 0);
    await redisClient.set('ticket:vip:stock_left', 3);
    await redisClient.set('ticket:vip:current_revenue', 0);
    await redisClient.set('ticket:vip:current_price', HARGA_DASAR);

    app.listen(port, () => {
        console.log(`🚀 Backend API berjalan di http://localhost:${port}`);
    });
}

startServer();