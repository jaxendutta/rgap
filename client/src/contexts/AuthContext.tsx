// src/contexts/AuthContext.tsx
import {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import portConfig from "../../../config/ports.json";

interface User {
    user_id: number;
    email: string;
    name: string;
    searches: any;
    // adding additional fields as need, e.g. created_at, token, etc.
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, try to load user data from localStorage AND check session
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);

            // First check for saved user in localStorage
            const storedUser = localStorage.getItem("user");
            let parsedUser = null;

            if (storedUser) {
                try {
                    parsedUser = JSON.parse(storedUser);
                    // Set the user immediately from localStorage to prevent flash of logged out state
                    setUser(parsedUser);
                } catch (e) {
                    console.error("Error parsing stored user:", e);
                    localStorage.removeItem("user"); // Clean up invalid data
                }
            }

            // Then try to verify the session with the server
            try {
                const baseurl =
                    process.env.VITE_API_URL ||
                    `http://localhost:${portConfig.defaults.server}`;

                const response = await fetch(`${baseurl}/auth/session`, {
                    credentials: "include", // Important for sending cookies
                });

                // If server session is valid, use that data
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                } else if (response.status === 401) {
                    // If we get 401 Unauthorized, but still have localStorage data
                    // Consider the user logged in with localStorage data
                    if (parsedUser) {
                        console.warn(
                            "Server session unavailable, using local credentials"
                        );
                    } else {
                        // Only clear if we have no localStorage data
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error("Error checking session:", error);
                // Keep using localStorage data on network error
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            // Try to call logout endpoint
            const baseurl =
                process.env.VITE_API_URL ||
                `http://localhost:${portConfig.defaults.server}`;

            await fetch(`${baseurl}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            // Clear local state regardless of server response
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    // Update the current user with new fields
    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{ user, login, logout, updateUser, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
