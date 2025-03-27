// src/utils/api.ts
import axios from "axios";
import portConfig from "../../../config/ports.json";

export const createAPI = (timeout = 30000) => {
    // Increased timeout
    const API = axios.create({
        baseURL:
            process.env.VITE_API_URL ||
            `http://localhost:${portConfig.defaults.server}`,
        timeout: timeout,
        withCredentials: true,
    });

    // Add request interceptor to log requests
    API.interceptors.request.use(
        (config) => {
            console.log(
                `API Request to: ${config.method?.toUpperCase()} ${config.url}`,
                config.data
                    ? JSON.stringify(config.data).substring(0, 200) + "..."
                    : ""
            );
            return config;
        },
        (error) => {
            console.error("API Request error:", error);
            return Promise.reject(error);
        }
    );

    // Enhance response interceptor with better error handling and logging
    API.interceptors.response.use(
        (response) => {
            console.log(
                `API Response from: ${response.config.url}`,
                response.data ? "Data received successfully" : "No data"
            );
            return response;
        },
        async (error) => {
            // Log error details
            console.error("API Error:", error.message);

            if (error.response) {
                console.error(
                    `Status: ${error.response.status}`,
                    error.response.data
                );
            }

            // If we get a 409 Conflict from the server (temporary table issue)
            if (
                error.response?.status === 409 &&
                error.response?.data?.retryable
            ) {
                console.log("Received retryable error, attempting to retry...");

                // Wait a short delay before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Retry the request
                return API(error.config);
            }

            // For all other errors, just reject the promise
            return Promise.reject(error);
        }
    );

    return API;
};

export default createAPI;
