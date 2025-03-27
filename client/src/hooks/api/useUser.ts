// src/hooks/api/useUser.ts
import { useState } from "react";
import axios from "axios";
import createAPI from '@/utils/api';

const API = createAPI(); // Use default 10000ms timeout

export function useUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteAccount = async (userId: number): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            await API.delete(`/auth/delete-account/${userId}`);
            return true;
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : "Failed to delete account";

            setError(new Error(errorMessage));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteAccount,
        isLoading,
        error,
    };
}
