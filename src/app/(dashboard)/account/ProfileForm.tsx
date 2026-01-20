'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import { User } from '@/types/database';

interface ProfileFormProps {
    user: Partial<User>;
}

const initialState = {
    message: '',
    success: false
};

export default function ProfileForm({ user }: ProfileFormProps) {
    const [state, action, isPending] = useActionState(updateProfileAction, initialState);

    return (
        <form action={action} className="space-y-4">
            {state?.message && (
                <div className={`p-3 text-sm rounded-lg ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                    name="name"
                    defaultValue={user.name || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={user.email || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
            </div>

            <Button type="submit" variant="outline" isLoading={isPending}>
                Update Profile
            </Button>
        </form>
    );
}
