// src/pages/AccountPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    History,
    LogOut,
    Eye,
    EyeOff,
    Shield,
    Trash2,
    AlertCircle,
    X,
    Search,
    Mail,
    UserCircle,
    Lock,
    Save,
    RefreshCw,
} from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import { SearchHistoryCard } from "@/components/features/search/SearchHistoryCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { useUser } from "@/hooks/api/useUser";
import { useUserSearchHistory } from "@/hooks/api/useSearchHistory";
import EntityList from "@/components/common/ui/EntityList";
import { SearchHistory } from "@/types/search";
import createAPI from "@/utils/api";
import EmptyState from "@/components/common/ui/EmptyState";
import { getDataFromResult } from "@/hooks/api/useData";
import Tabs, { TabContent, TabItem } from "@/components/common/ui/Tabs";
import InputField from "@/components/common/ui/InputField";
import Tag from "@/components/common/ui/Tag";

const API = createAPI();

const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "history", label: "History", icon: History },
    { id: "logout", label: "Sign Out", icon: LogOut },
];

export default function AccountPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] =
        useState<(typeof tabs)[number]["id"]>("profile");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Local state for editable profile info and password fields
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const { user, logout, updateUser } = useAuth();
    const { showNotification } = useNotification();

    const { deleteAccount } = useUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    // Get search history using the hook with proper infinite query pagination
    const searchHistoryQuery = useUserSearchHistory(
        user?.user_id,
        "search_time",
        "desc"
    );

    const paginatedSearchHistory = useMemo(() => {
        return getDataFromResult(searchHistoryQuery);
    }, [searchHistoryQuery.data]);

    // If no user is logged in, redirect to the login page
    useEffect(() => {
        if (!user) {
            navigate("/auth");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
        }
    }, [user]);

    if (!user) {
        return null;
    }

    // Profile update in Account Settings
    const handleProfileUpdate = async () => {
        setUpdateError("");
        setUpdateLoading(true);

        try {
            await API.put("/auth/update-profile", {
                user_id: user.user_id,
                name: editName,
                email: editEmail,
            });

            // Update the AuthContext with new user info
            updateUser({ name: editName, email: editEmail });
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

        try {
            await API.put("/auth/update-password", {
                user_id: user.user_id,
                currentPassword,
                newPassword,
            });

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

    // Function to render a search history item
    const renderSearchHistoryItem = (search: SearchHistory) => {
        return <SearchHistoryCard data={search} />;
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Account Settings"
                subtitle="Manage your account settings here."
            />

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={(tabId) => setActiveTab(tabId as string)}
                variant="pills"
                size="md"
                fullWidth={true}
            />

            {/* Content */}
            <TabContent activeTab={activeTab} className="mt-6">
                    {/* Profile Settings */}
                    {activeTab === "profile" && (
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-medium">
                                    Profile Information
                                </h2>
                                <Button
                                    variant="outline"
                                    leftIcon={Save}
                                    onClick={handleProfileUpdate}
                                    disabled={updateLoading}
                                    isLoading={updateLoading}
                                >
                                    Save Changes
                                </Button>
                            </div>

                            {updateError && (
                                <Tag
                                    icon={AlertCircle}
                                    text={updateError}
                                    variant="danger"
                                    size="md"
                                    className="w-full justify-start"
                                />
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Full Name"
                                    id="edit-name"
                                    icon={UserCircle}
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    placeholder="Your full name"
                                    required
                                />

                                <InputField
                                    label="Email Address"
                                    id="edit-email"
                                    icon={Mail}
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) =>
                                        setEditEmail(e.target.value)
                                    }
                                    placeholder="Your email address"
                                    required
                                    helperText="This email will be used for account recovery"
                                />
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
                                <Button
                                    variant="outline"
                                    leftIcon={RefreshCw}
                                    onClick={handlePasswordUpdate}
                                    disabled={updateLoading}
                                    isLoading={updateLoading}
                                >
                                    Update Password
                                </Button>
                            </div>

                            {updateError && (
                                <Tag
                                    icon={AlertCircle}
                                    text={updateError}
                                    variant="danger"
                                    size="md"
                                    className="w-full justify-start"
                                />
                            )}

                            <div className="space-y-4">
                                <InputField
                                    label="Current Password"
                                    id="current-password"
                                    icon={Lock}
                                    trailingIcon={
                                        showCurrentPassword ? EyeOff : Eye
                                    }
                                    onTrailingIconClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Enter your current password"
                                    required
                                />

                                <InputField
                                    label="New Password"
                                    id="new-password"
                                    icon={Lock}
                                    trailingIcon={
                                        showNewPassword ? EyeOff : Eye
                                    }
                                    onTrailingIconClick={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    required
                                    helperText="Use a strong password with at least 8 characters"
                                />

                                <InputField
                                    label="Confirm New Password"
                                    id="confirm-password"
                                    icon={Lock}
                                    trailingIcon={
                                        showConfirmPassword ? EyeOff : Eye
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
                                    value={confirmNewPassword}
                                    onChange={(e) =>
                                        setConfirmNewPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    required
                                    error={
                                        newPassword !== confirmNewPassword &&
                                        confirmNewPassword.length > 0
                                            ? "Passwords don't match"
                                            : ""
                                    }
                                />
                            </div>
                        </Card>
                    )}

                    {/* Search History Tab */}
                    {activeTab === "history" && user && (
                        <EntityList<SearchHistory>
                            entityType="search"
                            entities={paginatedSearchHistory}
                            query={searchHistoryQuery}
                            renderItem={renderSearchHistoryItem}
                            variant="list"
                            emptyState={
                                <EmptyState
                                    title="No Search History"
                                    message="You haven't searched for any grants yet."
                                    icon={History}
                                    primaryAction={{
                                        label: "Start Searching",
                                        onClick: () => navigate("/search"),
                                        icon: Search,
                                    }}
                                />
                            }
                        />
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
                                            leftIcon={LogOut}
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
                                            <AlertCircle className="h-5 w-5 mt-0.5 mr-2" />
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
                                            leftIcon={Trash2}
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
                                        <InputField
                                            label={`Please enter your email (${user?.email}) to confirm:`}
                                            id="confirm-email"
                                            type="email"
                                            icon={Mail}
                                            value={confirmEmail}
                                            onChange={(e) => {
                                                setConfirmEmail(e.target.value);
                                                setEmailError("");
                                            }}
                                            placeholder="Enter your email"
                                            error={emailError}
                                        />
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
                                            leftIcon={Trash2}
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
            </TabContent>
        </PageContainer>
    );
}
