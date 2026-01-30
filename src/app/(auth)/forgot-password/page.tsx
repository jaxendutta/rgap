'use client';

import { useActionState, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPasswordAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function ForgotPasswordPage() {
    const [state, action, isPending] = useActionState(forgotPasswordAction, initialState);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setEmailSent(true);
        }
    }, [state]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-md md:py-4 rounded-3xl">
                <div className="w-full p-4 md:p-8 pt-10 flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            [ Forgot Password ]
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Enter your email to receive reset instructions
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {emailSent ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 text-green-800 p-4 rounded-lg text-sm text-center"
                            >
                                <p className="font-semibold mb-1">Check your inbox</p>
                                <p>{state.message}</p>
                                <div className="mt-4">
                                    <Link href="/login" className="text-blue-600 hover:underline">
                                        Return to login
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <form action={action} className="space-y-4">
                                {state?.message && !state.success && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                        {state.message}
                                    </div>
                                )}

                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                />

                                <div className="pt-2">
                                    <Button type="submit" className="w-full" isLoading={isPending}>
                                        Send Reset Link
                                    </Button>
                                </div>

                                <div className="text-center mt-4">
                                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
                                        Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}
