const express = require('express');
const cors = require('cors')

const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
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
  res.send(`
    <h1>Welcome to the RGAP Server</h1>
    <p>This server provides the following endpoints:</p>
    <ul>
      <li><strong>GET /search</strong> - Search for grants and recepients</li>
      <li> ... more coming soon!</li>
    </ul>
    <p>Use the above endpoints to interact with the RGAP application.</p>
    <h2>Example Usage:</h2>
    <h3>1. Get all grants</h3>
    This fetches all grants from the database:
    <pre><code>
    curl -X GET http://localhost:3030/search/all
    </code></pre>

    <h3>2. Search for filtered grants </h3>
    This fetches grats where the reserach prganization / institution associated had "waterloo" in its name:
    <pre><code>
    curl -X POST http://localhost:3030/search \\
    -H "Content-Type: application/json" \\
    -d '{"searchTerms":{"institute":"waterloo"},"filters":{},"sortConfig":{"field":"date","direction":"desc"}}'
    </code></pre>
  `);
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
