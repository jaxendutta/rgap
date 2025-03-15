import { useState } from "react";
import { Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import portConfig from "../../../config/ports.json";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!isLogin) {
                // Sign Up mode
                const baseurl =
                    process.env.VITE_API_URL ||
                    `http://localhost:${portConfig.defaults.server}`;
                const response = await fetch(`${baseurl}/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        name,
                        password,
                        confirmPassword,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Signup failed");
                }

                // Update AuthContext with new user data
                login({
                    user_id: data.user_id,
                    email: data.email,
                    name: data.name,
                    searches: [],
                });
                showNotification(
                    "Account created successfully! Welcome to RGAP.",
                    "success"
                );
                navigate("/account");
            } else {
                // Login mode
                const baseurl =
                    process.env.VITE_API_URL ||
                    `http://localhost:${portConfig.defaults.server}`;
                const response = await fetch(`${baseurl}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Login failed");
                }

                login({
                    user_id: data.user_id,
                    email: data.email,
                    name: data.name,
                    searches: data.searches || [],
                });
                showNotification("Welcome back to RGAP!", "success");
                navigate("/account");
            }
        } catch (err: any) {
            const errorMessage =
                err.message || "Authentication failed. Please try again.";
            setError(errorMessage);
            showNotification(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-white flex items-center justify-center p-3 lg:p-6">
            <div className="bg-white w-full max-w-5xl flex flex-col lg:flex-row rounded-lg border hover:border-gray-300 transition-all duration-200">
                {/* Left Side - Hidden on mobile */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
                    {/* Centered divider with padding from edges */}
                    <div className="absolute right-0 top-12 bottom-12 flex items-center">
                        <div className="w-px h-full mx-12 bg-gray-200" />
                    </div>
                    <div className="text-center">
                        <img
                            src="/rgap.svg"
                            alt="RGAP Logo"
                            className="h-16 w-16 mx-auto"
                        />
                        <h1 className="mt-6 text-3xl font-semibold text-gray-900">
                            RGAP
                        </h1>
                        <p className="mt-2 text-m text-gray-600">
                            [ Research Grant Analytics Platform ]
                        </p>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                            Welcome.
                        </h2>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12">
                    {/* Logo for mobile view */}
                    <div className="lg:hidden text-center mb-4">
                        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
                            Welcome.
                        </h1>
                    </div>
                    <div className="max-w-md mx-auto">
                        {/* Mode Toggle */}
                        <div className="flex justify-center space-x-4 mb-8">
                            <button
                                onClick={() => {
                                    setIsLogin(true);
                                    setError(""); // Clear error when switching tabs
                                }}
                                className={`pb-2 px-4 font-medium border-b-2 transition-colors duration-300 ${
                                    isLogin
                                        ? "border-gray-900 text-gray-900 text-md"
                                        : "border-transparent text-gray-500 hover:text-gray-700 text-sm"
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsLogin(false);
                                    setError(""); // Clear error when switching tabs
                                }}
                                className={`pb-2 px-4 font-medium border-b-2 transition-colors duration-300 ${
                                    !isLogin
                                        ? "border-gray-900 text-gray-900 text-md"
                                        : "border-transparent text-gray-500 hover:text-gray-700 text-sm"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 relative"
                        >
                            {/* Name field - Only shown during signup */}
                            {!isLogin && (
                                <div className="transition-all duration-300 ease-in-out overflow-hidden h-[66px] mb-6">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required={!isLogin}
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    {isLogin ? "Password" : "New Password"}
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete={
                                            isLogin
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="focus:outline-none"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password field - Only shown during signup */}
                            {!isLogin && (
                                <div className="transition-all duration-300 ease-in-out overflow-hidden h-[66px] mb-6">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            required={!isLogin}
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm pr-10"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="focus:outline-none"
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Forgot Password Link - Only shown during login */}
                            {isLogin && (
                                <div className="flex items-center justify-end">
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-gray-600 hover:text-gray-500"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-md bg-red-50 p-4 relative">
                                    <p className="text-sm text-red-700">
                                        {error}
                                    </p>
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                                        onClick={() => setError("")}
                                    >
                                        <X className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center items-center rounded-lg border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "Sign In" : "Create Account"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
