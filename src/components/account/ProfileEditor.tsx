'use client';

import { useState } from 'react';
import { updateProfileAction } from '@/app/actions/auth';
import Button from '@/components/ui/Button';
import { User } from '@/types/database';
import { FiEdit2, FiClock } from 'react-icons/fi';
import { useNotify } from '@/providers/NotificationProvider';
import Tag from '@/components/ui/Tag';
import InputField from '@/components/ui/InputField';

interface ProfileEditorProps {
    user: User; // Use full User type to get pending_email
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { notify } = useNotify();

    async function handleSubmit(formData: FormData) {
        const result = await updateProfileAction(null, formData);
        if (result.success) {
            setIsEditing(false);
            notify(result.message, 'success');
        } else {
            notify(result.message, 'error');
        }
    }

    return (
        <div className="relative flex flex-col gap-4 md:gap-6">
            <div className="flex items-start justify-between">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Profile</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 md:gap-2 cursor-pointer"
                    >
                        <FiEdit2 className="size-2.75 md:size-3" /> Edit
                    </button>
                )}
            </div>

            {/* PENDING EMAIL ALERT */}
            {user.pending_email && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-amber-900 font-medium">
                            <FiClock className="text-amber-600 shrink-0" />
                            <p className="text-sm font-medium text-amber-900">Email Change Pending</p>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                            We sent a verification link to <strong>{user.pending_email}</strong>.
                            Click it to confirm the change. Until then, your current email remains <strong>{user.email}</strong>.
                        </p>
                        <p className="text-xs text-amber-600 mt-2">Link expires in 24 hours.</p>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-amber-600 border-amber-200 hover:bg-amber-100"
                            onClick={() => { }} // TODO: Implement resend verification action
                        >
                            Resend Verification Email
                        </Button>


                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-amber-600 border-amber-200 hover:bg-amber-100"
                            onClick={() => { }} // TODO: Implement cancel email change action
                        >
                            Cancel Email Change
                        </Button>
                    </div>
                </div>
            )}

            {isEditing ? (
                <form action={handleSubmit} className="flex flex-col gap-3 animate-in fade-in">
                    <div className="text-sm md:text-base w-full bg-gray-200 rounded-3xl pl-3 pr-1 py-0.75 inline-flex items-center gap-4 text-gray-600">
                        Name
                        <InputField name="name" defaultValue={user.name || ''} className="pl-3 pr-2 py-1" />
                    </div>

                    <div className="text-sm md:text-base w-full bg-gray-200 rounded-3xl pl-3 pr-1 py-0.75 inline-flex items-center gap-4 text-gray-600">
                        Email
                        <InputField name="email" type="email" defaultValue={user.email || ''} className="pl-3 pr-2 py-1" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Changing your email will require re-verification.</p>

                    <div className="flex gap-3 pt-2 w-full">
                        <Button type="submit" size="sm" className="w-full">Save Changes</Button>
                        <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="text-sm md:text-base w-full bg-gray-200 rounded-3xl pl-3 pr-1 py-1 inline-flex items-center gap-1 text-gray-600">
                        Name
                        <Tag text={user.name} className="w-full ml-3 text-sm md:text-base" />
                    </div>

                    <div className="text-sm md:text-base w-full bg-gray-200 rounded-3xl pl-3 pr-1 py-1 inline-flex items-center gap-1 text-gray-600">
                        Email
                        <Tag text={user.email} className="w-full ml-3 text-sm md:text-base" />
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            Verified
                        </span>
                    </div>

                    {user.pending_email && (
                        <div className="text-sm md:text-base w-full bg-gray-200 rounded-3xl pl-3 pr-1 py-1 inline-flex items-center gap-1 text-gray-600">
                            Email
                            <Tag text={user.pending_email} className="w-full ml-3 text-sm md:text-base" />
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                Unverified
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
