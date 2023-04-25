const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const db = require('./db/db.json');
const uuid = require('./helpers/uuid');
const { readFromFile, readAndAppend, writeToFile } = require('./helpers/fsUtils');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('db/db.json', function (err, data) {
        if (err) throw err;
        let parsedData = JSON.parse(data);
        return res.status(200).json(parsedData);
    })
});

app.get('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        console.info(`${req.method} request received for a specific note`);
        const noteId = req.params.id;
        for (let i = 0; i < db.length; i++) {
            const currentNote = db[i];
            if (currentNote.id === noteId) {
                res.json(currentNote);
                return;
            }
        }
        res.status(404).send('There is no note with that ID found');
    } else {
        res.status(400).send('Note ID needs to be given to search by ID');
    }
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);

        fs.readFile('db/db.json', 'utf8', (err, data) => {
            if (err) throw err;
            const parsedNotes = JSON.parse(data);
            parsedNotes.push(newNote);
            fs.writeFile('db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) => writeErr ? console.error(writeErr) : console.info('Successfully added note!'));
        });

        // readAndAppend(newNote, './db/db.json')
    } else {
        res.status(500).json('Error in posting note!');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            // Make a new array of all notes except the one with the ID provided in the URL
            const result = json.filter((note) => note.id !== noteId);

            // Save that array to the filesystem
            writeToFile('db/db.json', result);

            // Respond to the DELETE request
            res.json(`Item ${noteId} has been deleted 🗑️`);
        });
});

app.listen(PORT, () =>
    console.log(`Express server listening on port http://localhost:${PORT} 🚀`)
);
