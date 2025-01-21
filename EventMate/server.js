const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect('mongodb://127.0.0.1:27017/eventmate')
    .then(() => {
        console.log('MongoDB bağlantısı başarılı');
    })
    .catch((err) => {
        console.error('MongoDB bağlantı hatası:', err);
    });

// Etkinlik şeması
const eventSchema = new mongoose.Schema({
    title: String,
    location: String,
    date: Date,
    time: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);

// Geçmiş etkinlikleri temizleme fonksiyonu
async function cleanupPastEvents() {
    try {
        const now = new Date();
        const result = await Event.deleteMany({
            $or: [
                // Tarihi geçmiş etkinlikler
                { date: { $lt: now.toISOString().split('T')[0] } },
                // Aynı gün ama saati geçmiş etkinlikler
                {
                    date: now.toISOString().split('T')[0],
                    time: { $lt: now.toTimeString().split(' ')[0] }
                }
            ]
        });
        console.log(`${result.deletedCount} geçmiş etkinlik silindi`);
    } catch (error) {
        console.error('Geçmiş etkinlikler silinirken hata:', error);
    }
}

// Her saat başı temizlik yap
setInterval(cleanupPastEvents, 1000 * 60 * 60); // Her saat
// İlk çalıştırma
cleanupPastEvents();

// API Routes
app.post('/api/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        // Önce geçmiş etkinlikleri temizle
        await cleanupPastEvents();
        // Sonra güncel etkinlikleri getir
        const events = await Event.find().sort({ date: 1, time: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Email gönderimi için transporter oluştur
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'emincengiz0@outlook.com',
        pass: 'your_password' // Mail hesabınızın şifresi
    }
});

// İletişim formu için API endpoint'i
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
        from: 'emincengiz0@outlook.com',
        to: 'emincengiz0@outlook.com',
        subject: `İletişim Formu: ${subject}`,
        html: `
            <h3>Yeni İletişim Formu Mesajı</h3>
            <p><strong>Gönderen:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Konu:</strong> ${subject}</p>
            <p><strong>Mesaj:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Mesajınız başarıyla gönderildi.' });
    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        res.status(500).json({ error: 'Mesaj gönderilirken bir hata oluştu.' });
    }
});

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/etkinlik-olustur', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'etkinlik-olustur.html'));
});

app.get('/etkinlikler', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'etkinlikler.html'));
});

app.get('/hakkimizda', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hakkimizda.html'));
});

app.get('/iletisim', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'iletisim.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 