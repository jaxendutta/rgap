// src/pages/AccountPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    History,
    LogOut,
    Eye,
    EyeOff,
    Shield,
    Calendar,
    Search,
    PackageOpen,
    Trash2,
    AlertCircle,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import { SortButton } from "@/components/common/ui/SortButton";
import { SearchHistoryCard } from "@/components/features/account/SearchHistoryCard";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import portConfig from "../../../config/ports.json";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { useUser } from "@/hooks/api/useUser";

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
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

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

    useEffect(() => {
        const fetchSearchHistory = async () => {
          setHistoryLoading(true);
          try {
            const baseurl =
              process.env.VITE_API_URL || `http://localhost:${portConfig.defaults.server}`;
            const response = await fetch(
              `${baseurl}/search-history/${user.user_id}?sortField=search_time&sortDirection=desc`
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.message || "Failed to fetch search history");
            }
            setSearchHistory(data.searches);
          } catch (error: any) {
            setHistoryError(error.message);
          } finally {
            setHistoryLoading(false);
          }
        };
      
        fetchSearchHistory();
    }, [user.user_id]);

    const handleSortChange = async (field: "search_time" | "result_count", direction: "asc" | "desc") => {
        // Optionally, update local state for sort config
        setSortConfig({ field: field === "search_time" ? "date" : "results", direction });
        // Fetch the sorted search history
        setHistoryLoading(true);
        try {
          const baseurl =
            process.env.VITE_API_URL || `http://localhost:${portConfig.defaults.server}`;
          const response = await fetch(
            `${baseurl}/search-history/${user.user_id}?sortField=${field}&sortDirection=${direction}`
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch sorted history");
          }
          setSearchHistory(data.searches);
        } catch (error: any) {
          setHistoryError(error.message);
        } finally {
          setHistoryLoading(false);
        }
    };

    const handleRerunSearch = (searchParams: any) => {
        navigate("/search", { state: { searchParams } });
    };

    // Handle deletion of a search history entry
    const handleDeleteHistory = async (historyId: number) => {
        setHistoryLoading(true);
        try {
        const baseurl =
            process.env.VITE_API_URL ||
            `http://localhost:${portConfig.defaults.server}`;
        const response = await fetch(`${baseurl}/search-history/${historyId}`, {
            method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete history entry");
        }
        // Remove the deleted entry from state
        setSearchHistory((prev) =>
            prev.filter((entry) => entry.history_id !== historyId)
        );
        showNotification("History entry deleted successfully!", "success");
        } catch (error: any) {
        setHistoryError(error.message);
        showNotification(error.message, "error");
        } finally {
        setHistoryLoading(false);
        }
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

    const { deleteAccount } = useUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleDeleteAccount = async () => {
        if (!user) return;

        // Verify email matches
        if (confirmEmail !== user.email) {
            setEmailError("Email does not match your account");
            return;
        }

        try {
            setIsDeleting(true);
            const success = await deleteAccount(user.user_id);

            if (success) {
                logout(); // Clear current user data
                showNotification(
                    "Your account has been successfully deleted",
                    "info"
                );
                navigate("/");
            } else {
                showNotification(
                    "Failed to delete your account. Please try again.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            showNotification("An error occurred. Please try again.", "error");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setConfirmEmail("");
        }
    };

    // Add a function to open the modal
    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setConfirmEmail("");
        setEmailError("");
    };

    // Add a function to close the modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setConfirmEmail("");
        setEmailError("");
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Account Settings"
                subtitle="Manage your account settings here."
            />

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
                            <h2 className="text-2xl font-medium">Recent Searches</h2>
                            <div className="flex flex-wrap items-center gap-2">
                            <SortButton
                                            label="Date"
                                            icon={Calendar}
                                            // For backend sorting not using React
                                            onClick={() => handleSortChange("search_time", sortConfig.direction === "asc" ? "desc" : "asc")} field={""} currentField={""} direction={"asc"}                            />
                            <SortButton
                                            label="Results"
                                            icon={History}
                                            onClick={() => handleSortChange("result_count", sortConfig.direction === "asc" ? "desc" : "asc")} field={""} currentField={""} direction={"asc"}                            />
                            </div>
                        </div>

                        {historyLoading ? (
                            <p>Loading search history...</p>
                        ) : historyError ? (
                            <p className="text-red-600">{historyError}</p>
                        ) : searchHistory.length > 0 ? (
                            <motion.div layout className="grid grid-cols-1 gap-4">
                            {searchHistory.map((search) => (
                                <motion.div
                                key={search.history_id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                >
                                <SearchHistoryCard search={search} onRerun={handleRerunSearch} onDelete={handleDeleteHistory} />
                                </motion.div>
                            ))}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col justify-center items-center space-y-4 h-64 bg-gray-100 p-8 rounded-lg text-center w-full">
                            <PackageOpen className="h-16 w-16 text-gray-400" />
                            <p className="text-gray-700 text-md">
                                You have no recorded search history.
                            </p>
                            <Button variant="primary" onClick={() => navigate("/search")} icon={Search}>
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
                            <div className="space-y-6">
                                {/* Sign Out Section */}
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

                                {/* Divider */}
                                <div className="border-t border-red-300"></div>

                                {/* Delete Account Section */}
                                <div className="space-y-4 mt-6">
                                    <h2 className="text-xl font-medium text-gray-900">
                                        Delete Your Account
                                    </h2>
                                    <div className="bg-white rounded-md p-4 border border-red-300">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                                            <div>
                                                <p className="text-gray-700">
                                                    Deleting your account will:
                                                </p>
                                                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                                                    <li>
                                                        Permanently remove your
                                                        account information
                                                    </li>
                                                    <li>
                                                        Anonymize all your
                                                        search history
                                                    </li>
                                                    <li>
                                                        Remove your bookmarks
                                                    </li>
                                                    <li>
                                                        This action cannot be
                                                        undone
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={openDeleteModal}
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                            icon={Trash2}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Delete Account Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-md w-full shadow-xl p-6 relative">
                                {/* Close button */}
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    onClick={closeDeleteModal}
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Modal content */}
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                            <Trash2 className="h-6 w-6 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900">
                                            Delete Account Confirmation
                                        </h3>
                                    </div>

                                    <div className="border border-red-200 bg-red-50 rounded-md p-4 text-sm">
                                        <p className="text-red-700 font-medium">
                                            Warning: This action cannot be
                                            undone.
                                        </p>
                                        <p className="mt-1 text-gray-700">
                                            Your account will be permanently
                                            deleted, and all your personal data
                                            will be removed. Your search history
                                            will be anonymized.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="confirm-email"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Please enter your email (
                                            {user?.email}) to confirm:
                                        </label>
                                        <input
                                            id="confirm-email"
                                            type="email"
                                            value={confirmEmail}
                                            onChange={(e) => {
                                                setConfirmEmail(e.target.value);
                                                setEmailError("");
                                            }}
                                            className={`w-full px-3 py-2 border ${
                                                emailError
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                            placeholder="Enter your email"
                                        />
                                        {emailError && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={closeDeleteModal}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleDeleteAccount}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            icon={Trash2}
                                            isLoading={isDeleting}
                                            disabled={
                                                confirmEmail !== user?.email
                                            }
                                        >
                                            Permanently Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </PageContainer>
    );
}
