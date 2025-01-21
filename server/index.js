const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const db = require('./db/index');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/test-query', (req, res) => {
    db.query('SELECT * FROM Institutions', (err, results) => {
        if (err) {
            res.status(500).send('Error fetching data: ' + err.message);
        } else {
            res.json(results);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
