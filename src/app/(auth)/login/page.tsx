'use client';

import { useEffect, useState, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [state, action, isPending] = useActionState(authAction, initialState);

    // Get refreshUser to verify session status
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [displayMessage, setDisplayMessage] = useState('');

    // FIX: Add a local verification state. 
    // If 'user' exists initially, we assume it might be stale until verified.
    const [isVerifying, setIsVerifying] = useState(!!user);

    useEffect(() => {
        setDisplayMessage(state?.message || '');
    }, [state]);

    useEffect(() => {
        setDisplayMessage('');
    }, [mode]);

    // FIX: Redirect Logic
    // Instead of redirecting immediately if 'user' is present, we verify it first.
    useEffect(() => {
        const verifySession = async () => {
            if (user) {
                // We have a user object, but we are on the login page.
                // This could be a stale session from another tab.
                // Force a check against the server.
                await refreshUser();
            }
            // Once verification is done (or if no user existed), we stop verifying.
            setIsVerifying(false);
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONCE on mount

    // Only redirect if we have a user AND we are finished verifying
    useEffect(() => {
        if (user && !isVerifying) {
            router.replace('/account');
        }
    }, [user, isVerifying, router]);


    const tabs = [
        { id: 'login', label: 'Sign In' },
        { id: 'register', label: 'Register' },
    ];

    // ... (Rest of the component remains exactly the same)
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-md md:py-4 rounded-3xl">
                <motion.div
                    layout
                    className="w-full p-4 md:p-8 pt-10 flex flex-col gap-4"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {/* Header with Sliding Text */}
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-900 flex justify-center items-center">
                            <motion.span layout transition={{ duration: 0.2 }}>
                                [ Welcome
                            </motion.span>

                            <AnimatePresence mode="popLayout">
                                {mode === 'login' && (
                                    <motion.span
                                        layout
                                        initial={{ opacity: 0, width: 0, x: -10 }}
                                        animate={{ opacity: 1, width: 'auto', x: 0 }}
                                        exit={{ opacity: 0, width: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden whitespace-nowrap pl-1.5"
                                    >
                                        Back
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <motion.span layout transition={{ duration: 0.2 }}>&nbsp;]</motion.span>
                        </h1>
                        <motion.p layout className="text-xs md:text-sm text-gray-500 mt-1">
                            {mode === 'login'
                                ? 'Enter your credentials to access analytics'
                                : 'Start analyzing research grants today'}
                        </motion.p>
                    </div>

                    <div className="py-2">
                        <Tabs
                            tabs={tabs}
                            activeTab={mode}
                            onChange={(id) => setMode(id as 'login' | 'register')}
                            variant="pills"
                            fullWidth
                            className="bg-gray-100"
                        />
                    </div>

                    {/* Hides form while verifying to prevent flickering/input jumps */}
                    {isVerifying ? (
                        <div className="py-12 flex justify-center text-gray-400 text-sm">
                            Checking session...
                        </div>
                    ) : (
                        <form action={action} className="space-y-4">
                            <input type="hidden" name="mode" value={mode} />

                            <AnimatePresence>
                                {displayMessage && (
                                    <motion.div
                                        layout
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-2">
                                            {displayMessage}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Name Field (Register Only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'register' && (
                                    <motion.div
                                        layout
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <InputField
                                            label="Full Name"
                                            name="name"
                                            placeholder="Jane Doe"
                                            required={mode === 'register'}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div layout>
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                />
                            </motion.div>

                            <motion.div layout>
                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                />
                                {mode === 'login' && (
                                    <div className="flex justify-end mt-1">
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}
                            </motion.div>

                            {/* Confirm Password (Register Only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'register' && (
                                    <motion.div
                                        layout
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <InputField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            required={mode === 'register'}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-end">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Remember me
                                </label>
                            </div>

                            <motion.div layout className="pt-4">
                                <Button type="submit" className="w-full" isLoading={isPending}>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                </Button>
                            </motion.div>
                        </form>
                    )}
                </motion.div>
            </Card>
        </div>
    );
}
