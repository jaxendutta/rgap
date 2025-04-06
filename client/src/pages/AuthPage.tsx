// src/pages/AuthPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    AlertCircle,
    Mail,
    User,
    Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import Tabs, { TabItem } from "@/components/common/ui/Tabs";
import Tag from "@/components/common/ui/Tag";
import InputField from "@/components/common/ui/InputField";
import { motion, AnimatePresence } from "framer-motion";
import portConfig from "../../../config/ports.json";

// Define tabs for authentication modes
const authTabs: TabItem[] = [
    { id: "signin", label: "Sign In", icon: LogIn },
    { id: "signup", label: "Sign Up", icon: UserPlus },
];

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    // Reset form when switching tabs
    useEffect(() => {
        setError("");
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const isSignIn = activeTab === "signin";
            const baseurl =
                process.env.VITE_API_URL ||
                `http://localhost:${portConfig.defaults.server}`;

            if (isSignIn) {
                // Sign In logic
                const response = await fetch(`${baseurl}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: "include",
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
            } else {
                // Sign Up logic
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${baseurl}/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        name,
                        password,
                        confirmPassword,
                    }),
                    credentials: "include",
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
        <div className="h-full flex items-center justify-center p-3 lg:p-6">
            <Card className="w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden">
                {/* Left Side - Branding (Hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-12 relative">
                    <div className="text-center">
                        <img
                            src="/rgap.svg"
                            alt="RGAP Logo"
                            className="h-16 w-16 mx-auto"
                        />
                        <h1 className="mt-6 text-3xl font-semibold text-gray-900">
                            RGAP
                        </h1>
                        <p className="mt-2 text-gray-600">
                            [ Research Grant Analytics Platform ]
                        </p>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                            Welcome.
                        </h2>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="w-full lg:w-1/2 p-6 lg:p-12">
                    {/* Logo for mobile view */}
                    <div className="lg:hidden text-center mb-6">
                        <img
                            src="/rgap.svg"
                            alt="RGAP Logo"
                            className="h-14 w-14 mx-auto"
                        />
                        <h1 className="mt-2 text-xl font-semibold text-gray-900">
                            Welcome to RGAP
                        </h1>
                    </div>

                    <div className="max-w-md mx-auto">
                        {/* Modern Tab Navigation */}
                        <Tabs
                            tabs={authTabs}
                            activeTab={activeTab}
                            onChange={(tab) =>
                                setActiveTab(tab as "signin" | "signup")
                            }
                            variant="pills"
                            size="md"
                            fullWidth={true}
                            className="mb-6"
                        />

                        {/* Form Content with Animation */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    {/* Name field - Only shown during signup */}
                                    {activeTab === "signup" && (
                                        <InputField
                                            label="Full Name"
                                            id="name"
                                            icon={User}
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    )}

                                    {/* Email field */}
                                    <InputField
                                        label="Email Address"
                                        id="email"
                                        icon={Mail}
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter your email address"
                                        autoComplete="email"
                                        required
                                    />

                                    {/* Password field */}
                                    <InputField
                                        label={
                                            activeTab === "signin"
                                                ? "Password"
                                                : "Create Password"
                                        }
                                        id="password"
                                        icon={Lock}
                                        trailingIcon={
                                            showPassword ? EyeOff : Eye
                                        }
                                        onTrailingIconClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder={
                                            activeTab === "signin"
                                                ? "Enter your password"
                                                : "Create a strong password"
                                        }
                                        autoComplete={
                                            activeTab === "signin"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        required
                                        helperText={
                                            activeTab === "signup"
                                                ? "Use a strong password with at least 8 characters"
                                                : undefined
                                        }
                                    />

                                    {/* Confirm Password field - Only shown during signup */}
                                    {activeTab === "signup" && (
                                        <InputField
                                            label="Confirm Password"
                                            id="confirm-password"
                                            icon={Lock}
                                            trailingIcon={
                                                showConfirmPassword
                                                    ? EyeOff
                                                    : Eye
                                            }
                                            onTrailingIconClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            required
                                            error={
                                                confirmPassword.length > 0 &&
                                                password !== confirmPassword
                                                    ? "Passwords don't match"
                                                    : ""
                                            }
                                        />
                                    )}

                                    {/* Forgot Password Link - Only shown during login */}
                                    {activeTab === "signin" && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                Forgot your password?
                                            </button>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <Tag
                                            icon={AlertCircle}
                                            text={error}
                                            variant="danger"
                                            size="md"
                                            className="w-full justify-start"
                                        />
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        rightIcon={
                                            activeTab === "signin"
                                                ? LogIn
                                                : UserPlus
                                        }
                                        isLoading={loading}
                                        className="w-full mt-6 bg-gray-900 hover:bg-gray-800"
                                    >
                                        {activeTab === "signin"
                                            ? "Sign In"
                                            : "Create Account"}
                                    </Button>
                                </form>
                            </motion.div>
                        </AnimatePresence>

                        {/* Switch mode text for mobile */}
                        <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
                            {activeTab === "signin" ? (
                                <>
                                    New to RGAP?{" "}
                                    <button
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                        onClick={() => setActiveTab("signup")}
                                        type="button"
                                    >
                                        Create an account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                        onClick={() => setActiveTab("signin")}
                                        type="button"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
