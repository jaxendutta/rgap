import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Import directly from JSON
import portConfig from "../config/ports.json";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: parseInt(process.env.PORT || String(portConfig.defaults.client)),
        open: true,
        host: true,
    },
    define: {
        "process.env.VITE_API_URL": JSON.stringify(
            process.env.VITE_API_URL ||
                `http://localhost:${portConfig.defaults.server}`
        ),
    },
});
