import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AuthFormProps {
  email: string
  password: string
  name?: string
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // TODO: Implement actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      navigate('/')
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="mt-6 text-3xl font-semibold text-gray-900">RGAP</h1>
            <p className="mt-2 text-m text-gray-600">
              [ Research Grant Analytics Platform ]
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          {/* Logo for mobile view */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Welcome.</h1>
          </div>
          <div className="max-w-md mx-auto">
            {/* Mode Toggle */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`pb-2 px-4 text-m font-medium border-b-2 transition-colors duration-300 ${
                  isLogin 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  !isLogin 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              {/* Name Field - Animated */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isLogin 
                    ? 'opacity-0 translate-y-4 h-0 mb-0' 
                    : 'opacity-100 translate-y-0 h-[66px] mb-6'
                }`}
              >
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    tabIndex={isLogin ? -1 : 0}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [-webkit-credentials-auto-fill-button:none]"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              {/* Forgot Password Link - Animated */}
              <div 
                className={`transition-all duration-300 ease-in-out transform ${
                  isLogin 
                    ? 'opacity-100 translate-y-0 h-auto' 
                    : 'opacity-0 -translate-y-3 h-0 overflow-hidden'
                }`}
              >
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    tabIndex={isLogin ? 0 : -1}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
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
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 48 48">
                    <path
                      d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}