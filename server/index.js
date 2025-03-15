// server/index.js
import cors from "cors";
import express, { json } from "express";
import session from "express-session";
import { config } from "../config/ports.js";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import recipientRoutes from "./routes/recipientRoutes.js";
import instituteRoutes from "./routes/instituteRoutes.js";

const app = express();

// Enhanced CORS configuration
app.use(
    cors({
        origin: [
            `http://localhost:${
                process.env.CLIENT_PORT || config.defaults.client
            }`
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// Configure session middleware
app.use(
    session({
        secret: "your-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Only use secure in production
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }
    })
);

// Body parsing middleware
app.use(json());

// Basic health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
app.use("/recipients", recipientRoutes);
app.use("/institutes", instituteRoutes);
app.use("/save", require("./routes/saveRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: err.message,
    });
});

const PORT = process.env.PORT || config.defaults.server;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
        `Client expected at http://localhost:${
            process.env.CLIENT_PORT || config.defaults.client
        }`
    );
});

app.get("/", (req, res) => {
    const serverPort = process.env.PORT || DEFAULTS.server;
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
        curl -X GET http://localhost:${serverPort}/search/all
        </code></pre>

        <h3>2. Search for filtered grants </h3>
        This fetches grants where the research organization / institution associated had "waterloo" in its name:
        <pre><code>
        curl -X POST http://localhost:${serverPort}/search \\
        -H "Content-Type: application/json" \\
        -d '{"searchTerms":{"institute":"waterloo"},"filters":{},"sortConfig":{"field":"date","direction":"desc"}}'
        </code></pre>
    `);
});
