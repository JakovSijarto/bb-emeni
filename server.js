const express = require('express');
const fs = require('fs');
const path = require('path');
const serverless = require('serverless-http');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading menu file.' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/menu', (req, res) => {
    const newMenuData = JSON.stringify(req.body, null, 2);
    fs.writeFile(path.join(__dirname, 'menu.json'), newMenuData, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error writing to menu file.' });
        }
        res.json({ message: 'Menu updated successfully.' });
    });
});

module.exports.handler = serverless(app);
