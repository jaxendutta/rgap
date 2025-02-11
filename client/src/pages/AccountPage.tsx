import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  Bell,
  Save,
  History,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  BookMarked,
  ArrowRight,
  Building2,
  GraduationCap,
  AlertCircle
} from 'lucide-react'
import MockupMessage from '../components/common/messages/mockup'

const AccountPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Mock user data - in real app would come from auth context/state
  const userData = {
    name: 'Demo User',
    email: 'demo@example.com',
    created_at: '2025-01-15',
    savedSearches: 12,
    savedGrants: 8,
    savedRecipients: 5,
    savedInstitutes: 3,
    notifications: {
      emailAlerts: true,
      grantUpdates: true,
      recipientUpdates: false
    }
  }

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/auth')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
          
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'saved', label: 'Saved Items', icon: BookMarked },
            { id: 'history', label: 'Search History', icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center w-full px-4 py-2 text-left rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 mt-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-medium">Profile Information</h3>
                <MockupMessage />
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.name}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={userData.email}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-medium">Change Password</h3>
                <MockupMessage />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                        type={showNewPassword ? 'text' : 'password'}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
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
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <MockupMessage />
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked={userData.notifications.emailAlerts}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Email Alerts</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked={userData.notifications.grantUpdates}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Grant Updates</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked={userData.notifications.recipientUpdates}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Recipient Updates</span>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Items */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <MockupMessage />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Saved Grants */}
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Saved Grants</h3>
                    <span className="text-sm text-gray-500">{userData.savedGrants} items</span>
                  </div>
                  <button
                    onClick={() => navigate('/bookmarks')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    View All Grants
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </button>
                </div>

                {/* Saved Recipients */}
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Saved Recipients</h3>
                    <span className="text-sm text-gray-500">{userData.savedRecipients} items</span>
                  </div>
                  <button
                    onClick={() => navigate('/bookmarks')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    View All Recipients
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </button>
                </div>

                {/* Saved Institutes */}
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Saved Institutes</h3>
                    <span className="text-sm text-gray-500">{userData.savedInstitutes} items</span>
                  </div>
                  <button
                    onClick={() => navigate('/bookmarks')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View All Institutes
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </button>
                </div>

                {/* Saved Searches */}
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Saved Searches</h3>
                    <span className="text-sm text-gray-500">{userData.savedSearches} items</span>
                  </div>
                  <button
                    onClick={() => navigate('/bookmarks')}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    View All Searches
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Recent Searches</h3>
                <MockupMessage />
                <div className="space-y-4">
                  {/* This would be populated with actual search history data */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="space-y-1">
                      <p className="font-medium">NSERC Grants in Ontario</p>
                      <p className="text-sm text-gray-500">12 results • 2 days ago</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="space-y-1">
                      <p className="font-medium">Medical Research Grants</p>
                      <p className="text-sm text-gray-500">45 results • 5 days ago</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountPage