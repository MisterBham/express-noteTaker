const express = require('express');
const path = require('path');

const PORT = 3001;
const db = require('./db/db.json');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
    console.info(`${req.method} request received to GET notes`);
    // return res.json(notes);
})

app.listen(PORT, () =>
    console.log(`Express server listening on port http://localhost:${PORT} 🚀`)
);
