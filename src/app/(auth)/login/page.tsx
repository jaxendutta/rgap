'use client';

import { useState, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import { useRouter } from 'next/navigation';
import { LuChevronLeft } from 'react-icons/lu';

const initialState = { message: '' };

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [state, action, isPending] = useActionState(authAction, initialState);

    const tabs = [
        { id: 'login', label: 'Sign In' },
        { id: 'register', label: 'Register' },
    ];

    const router = useRouter();

    return (
        <div className="self-center w-full max-w-md">
            <Card className="overflow-hidden border-0 shadow-md">
                {/* 1. layout prop here ensures the CARD height animates smoothly 
                     as fields appear/disappear inside it.
                */}
                <motion.div
                    layout
                    className="p-4 md:p-8 pt-10 flex flex-col gap-4"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {/* Header with Sliding Text */}
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-900 flex justify-center items-center">
                            {/* 2. layout prop on "Welcome" allows it to slide left/right 
                                  smoothly when "Back" appears/disappears next to it.
                            */}
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
                        />
                    </div>

                    <form action={action} className="space-y-4">
                        <input type="hidden" name="mode" value={mode} />

                        <AnimatePresence>
                            {state?.message && (
                                <motion.div
                                    layout
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-2">
                                        {state.message}
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
                                    <div className="pb-1">
                                        <InputField
                                            label="Full Name"
                                            name="name"
                                            placeholder="Jane Doe"
                                            required={mode === 'register'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Standard Fields (Wrapped in layout motion to be safe) */}
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
                                    <div className="pt-4">
                                        <InputField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            required={mode === 'register'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div layout className="pt-4">
                            <Button type="submit" className="w-full" isLoading={isPending}>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </Card>
        </div>
    );
}
