const express = require('express');
const cors = require('cors')

const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3030',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }))

const PORT = process.env.PORT || 3030;
const db = require('./config/db');

// Routes
app.use('/search', require('./routes/searchRoutes'));

app.use('/grant', require('./routes/grantRoutes'));
app.use('/recepient', require('./routes/recepientRoutes'));


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Debugging
app.use((req, res, next) => {
    console.log('Received request:', {
      method: req.method,
      path: req.path,
      body: req.body
    });
    next();
});
