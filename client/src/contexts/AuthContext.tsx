// src/contexts/AuthContext.tsx
import {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // On mount, try to load user data from localStorage AND check session
    useEffect(() => {
        // Check for saved user in localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Also check if there's an active session with the server
        const checkSession = async () => {
            try {
                const response = await fetch("/auth/session", {
                    credentials: "include", // Important for sending cookies
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            } catch (error) {
                console.error("Error checking session:", error);
            }
        };

        checkSession();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Update the current user with new fields
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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
