'use client';

import { useActionState, useEffect } from 'react';
import { resetPasswordAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Card } from '@/components/ui/Card';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [state, action, isPending] = useActionState(resetPasswordAction, initialState);

    useEffect(() => {
        if (state?.success) {
            // Optional: Redirect after delay
            const timer = setTimeout(() => router.push('/login'), 3000);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    if (!token) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Card className="p-8 text-center text-red-600">
                    Missing or invalid reset token.
                    <div className="mt-4">
                        <Link href="/login" className="text-blue-600 hover:underline text-sm">Return to login</Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-md md:py-4 rounded-3xl">
                <div className="w-full p-4 md:p-8 pt-10 flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            [ Reset Password ]
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Choose a strong new password
                        </p>
                    </div>

                    {state?.success ? (
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm text-center">
                            <p className="font-semibold">{state.message}</p>
                            <p className="mt-2 text-xs">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form action={action} className="space-y-4">
                            <input type="hidden" name="token" value={token} />

                            {state?.message && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                    {state.message}
                                </div>
                            )}

                            <InputField
                                label="New Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                            />

                            <InputField
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full" isLoading={isPending}>
                                    Reset Password
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
}
