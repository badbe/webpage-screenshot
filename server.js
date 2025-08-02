const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint для создания скриншота
app.post('/screenshot', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    let browser;
    try {
        // Запускаем браузер
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        
        // Устанавливаем размер viewport
        await page.setViewport({ width: 1280, height: 720 });
        
        // Переходим на страницу
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Делаем скриншот
        const screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: true
        });
        
        // Отправляем скриншот как файл
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
        res.send(screenshot);
        
    } catch (error) {
        console.error('Error taking screenshot:', error);
        res.status(500).json({ error: 'Failed to take screenshot' });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});