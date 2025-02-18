const fs = require('fs');
const path = require('path');
const http = require('http');

// Use absolute paths
const CONFIG_DIR = path.dirname(__filename);
const CONFIG_PATH = path.join(CONFIG_DIR, '.port-config.json');
const portConfigData = require('./ports.json');

const config = {
    ranges: portConfigData.ranges,
    defaults: portConfigData.defaults,
};

const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.once('error', () => {
            resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
};

const findAvailablePort = async (startPort, endPort) => {
    for (let port = startPort; port <= endPort; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available ports found in range ${startPort}-${endPort}`);
};

const findAvailablePorts = async () => {
    try {
        // Try to read existing configuration
        if (fs.existsSync(CONFIG_PATH)) {
            const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            const timestamp = new Date(existingConfig.timestamp);
            const now = new Date();
            // If config is less than 1 hour old
            if (now - timestamp < 60 * 60 * 1000) {
                const portsAvailable = await Promise.all([
                    isPortAvailable(existingConfig.ports.client),
                    isPortAvailable(existingConfig.ports.server),
                    isPortAvailable(existingConfig.ports.database),
                ]);
                if (portsAvailable.every((available) => available)) {
                    return existingConfig.ports;
                }
            }
        }

        // Find new available ports
        const [clientPort, serverPort, databasePort] = await Promise.all([
            findAvailablePort(config.ranges.client.start, config.ranges.client.end),
            findAvailablePort(config.ranges.server.start, config.ranges.server.end),
            findAvailablePort(config.ranges.database.start, config.ranges.database.end),
        ]);

        const newConfig = {
            timestamp: new Date().toISOString(),
            ports: {
                client: clientPort,
                server: serverPort,
                database: databasePort,
            },
        };

        // Save configuration
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
        return newConfig.ports;
    } catch (error) {
        console.error('Error finding available ports:', error);
        // Fallback to defaults if port finding fails
        return {
            client: config.defaults.client,
            server: config.defaults.server,
            database: config.defaults.database,
        };
    }
};

module.exports = {
    config,
    findAvailablePorts,
    getConfig: () => config,
    PortConfig: config,
};