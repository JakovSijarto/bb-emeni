const express = require('express');
const fs = require('fs');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const port = 3000;


app.use(express.json());


module.exports.handler = serverless(app)

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files (like CSS, JS) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get menu items
app.get('/api/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading menu file.' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update menu items
app.post('/api/menu', (req, res) => {
    const newMenuData = JSON.stringify(req.body, null, 2);
    fs.writeFile(path.join(__dirname, 'menu.json'), newMenuData, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error writing to menu file.' });
        }
        res.json({ message: 'Menu updated successfully.' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
