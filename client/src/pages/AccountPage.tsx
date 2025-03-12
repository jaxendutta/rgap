// src/pages/AccountPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Save,
    History,
    LogOut,
    Eye,
    EyeOff,
    Shield,
    Calendar,
    Search,
    PackageOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import { SortButton } from "@/components/common/ui/SortButton";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";
import { cn } from "@/utils/cn";
import MockupMessage from "../components/common/messages/mockup";
import { useAuth } from "@/contexts/AuthContext";
import portConfig from "../../../config/ports.json";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";

type SortField = "date" | "results";
type SortDirection = "asc" | "desc";

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "history", label: "History", icon: History },
    { id: "logout", label: "Sign Out", icon: LogOut },
] as const;

export default function AccountPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] =
        useState<(typeof TABS)[number]["id"]>("profile");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        field: SortField;
        direction: SortDirection;
    }>({
        field: "date",
        direction: "desc",
    });

     // local state for editable profile info and password fields
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const { user, logout, updateUser } = useAuth();
    const { showNotification } = useNotification();

    // If no user is logged in, redirect to the login page
    if (!user) {
        navigate("/auth");
        return null;
    }

    // Initialize the local state with user profile data when AccountPage loads
    useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    }, [user]);

    const sortedSearches = [...(user.searches || [])].sort((a, b) => {
        if (sortConfig.field === "date") {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sortConfig.direction === "asc"
                ? dateA - dateB
                : dateB - dateA;
        } else {
            return sortConfig.direction === "asc"
                ? a.results - b.results
                : b.results - a.results;
        }
    });

    const toggleSort = (field: SortField) => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    const handleRerunSearch = (searchParams: any) => {
        navigate("/search", { state: { searchParams } });
    };

    // Profile update in Account Settings
    const handleProfileUpdate = async () => {
        setUpdateError("");
        setUpdateLoading(true);
        const baseurl =
          process.env.VITE_API_URL || `http://localhost:${portConfig.defaults.server}`;
        try {
          const response = await fetch(`${baseurl}/auth/update-profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              name: editName,
              email: editEmail,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Profile update failed");
          }
          // Update the AuthContext with new user info
          updateUser({ name: data.name, email: data.email });
          showNotification("Profile updated successfully!", "success");
        } catch (err: any) {
          setUpdateError(err.message || "Profile update failed.");
          showNotification(err.message, "error");
        } finally {
          setUpdateLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmNewPassword) {
          setUpdateError("New passwords do not match.");
          return;
        }
        setUpdateError("");
        setUpdateLoading(true);
        const baseurl =
          process.env.VITE_API_URL || `http://localhost:${portConfig.defaults.server}`;
        try {
          const response = await fetch(`${baseurl}/auth/update-password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              // we send currentPassword for verification on the backend
              currentPassword,
              newPassword,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Password update failed");
          }
          showNotification("Password updated successfully!", "success");
          // Clear password fields after success
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        } catch (err: any) {
          setUpdateError(err.message || "Password update failed.");
          showNotification(err.message, "error");
        } finally {
          setUpdateLoading(false);
        }
    };

    const handleLogout = () => {
        logout(); // Clear current user data
        showNotification("You have been logged out successfully!", "info");
        navigate("/");
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader title="Account Settings" subtitle="Manage your account settings here." />

            {/* Tabs */}
            <div className="flex space-x-2 lg:space-x-4">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    const isLogout = id === "logout";

                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "w-full flex items-center py-3 rounded-lg transition-all duration-200 gap-0.5 lg:gap-2",
                                isActive
                                    ? isLogout
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                    : isLogout
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                "flex-col lg:flex-row",
                                "px-2 lg:px-4",
                                "text-sm lg:text-base"
                            )}
                        >
                            <Icon className="h-6 w-6 mb-1 sm:mb-0" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Profile Settings */}
                    {activeTab === "profile" && (
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-medium">
                                    Profile Information
                                </h2>
                                <Button variant="outline" onClick={handleProfileUpdate} disabled={updateLoading}>
                                    Save
                                </Button>
                            </div>
                            {updateError && <p className="text-red-600">{updateError}</p>}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-medium">
                                    Security Settings
                                </h2>
                                <Button variant="outline" onClick={handlePasswordUpdate} disabled={updateLoading}>
                                    Update
                                </Button>
                            </div>
                            {updateError && <p className="text-red-600">{updateError}</p>}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={
                                                showCurrentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    !showCurrentPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Search History */}
                    {activeTab === "history" && (
                        <Card className="p-4 lg:p-6">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex justify-between gap-4">
                                    <h2 className="text-2xl font-medium">
                                        Recent Searches
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <SortButton
                                            label="Date"
                                            icon={Calendar}
                                            field="date"
                                            currentField={sortConfig.field}
                                            direction={sortConfig.direction}
                                            onClick={() => toggleSort("date")}
                                        />
                                        <SortButton
                                            label="Results"
                                            icon={History}
                                            field="results"
                                            currentField={sortConfig.field}
                                            direction={sortConfig.direction}
                                            onClick={() =>
                                                toggleSort("results")
                                            }
                                        />
                                    </div>
                                </div>

                                {sortedSearches.length > 0 ? (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 gap-4"
                                    >
                                        {sortedSearches.map((search) => (
                                            <motion.div
                                                key={search.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <SearchHistoryCard
                                                    search={search}
                                                    onRerun={handleRerunSearch}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col justify-center items-center space-y-4 h-64 bg-gray-100 p-8 rounded-lg text-center w-full">
                                        <PackageOpen className="h-16 w-16 text-gray-400" />
                                        <p className="text-gray-700 text-md">
                                            You have no recorded search history.
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate("/search")}
                                            icon={Search}
                                        >
                                            Start exploring
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Logout Confirmation */}
                    {activeTab === "logout" && (
                        <Card className="p-6 border-red-200 bg-red-50">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-medium text-gray-900">
                                    You're about to sign out!
                                </h2>
                                <p className="text-gray-700">
                                    Are you sure you want to sign out?
                                </p>
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700"
                                        icon={LogOut}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </PageContainer>
    );
}
