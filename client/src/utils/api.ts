// src/utils/api.ts
import axios from "axios";
import portConfig from "../../../config/ports.json";

export const createAPI = (timeout = 10000) => {
    const API = axios.create({
        baseURL:
            process.env.VITE_API_URL ||
            `http://localhost:${portConfig.defaults.server}`,
        timeout: timeout,
        withCredentials: true,
    });

    API.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Handle specific error cases
            if (
                error.response?.status === 409 &&
                error.response?.data?.retryable
            ) {
                console.log("Received retryable error, attempting to retry...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                return API(error.config);
            }

            return Promise.reject(error);
        }
    );

    return API;
};

export default createAPI;
