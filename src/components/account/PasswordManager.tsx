'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import InputField from '../ui/InputField';

const initialState = { message: '', success: false };

export default function PasswordManager() {
    const [state, action, isPending] = useActionState(changePasswordAction, initialState);

    return (
        <form action={action} className="space-y-4">
            {state?.message && (
                <div className={`p-3 text-sm rounded-lg ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {state.message}
                </div>
            )}

            <InputField label="Current Password" type="password" name="currentPassword" required className="pl-3 pr-2 py-1" />

            <div className="grid md:grid-cols-2 gap-4">
                <InputField label="New Password" type="password" name="newPassword" required className="pl-3 pr-2 py-1" />
                <InputField label="Confirm New Password" type="password" name="confirmNewPassword" required className="pl-3 pr-2 py-1" />
            </div>

            <div className="text-xs text-gray-500">
                A password must be at least 8 characters, include an uppercase letter and a number.
            </div>

            <div className="pt-2">
                <Button type="submit" variant="outline" isLoading={isPending} className="w-full">
                    Update Password
                </Button>
            </div>
        </form>
    );
}
