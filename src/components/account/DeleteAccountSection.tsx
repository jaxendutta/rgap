'use client';

import { useState, useActionState } from 'react';
import Button from '@/components/ui/Button';
import { deleteAccountAction } from '@/app/actions/auth';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';

export default function DeleteAccountSection({ userEmail }: { userEmail: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [state, formAction] = useActionState(deleteAccountAction, { success: false, message: '' });

    return (
        <Card className="p-4 md:p-6 border-red-200">
            <div className="flex flex-col gap-1">
                <h3 className="md:text-lg font-semibold text-red-700">Delete Account</h3>
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Permanently remove your account and all associated data.
                    </p>
                    <Button variant="outline" className="max-w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsOpen(true)}>
                        <FiTrash2 /> Delete Account Permanently
                    </Button>
                </div>

            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-red-600 mb-4">
                                    <div className="p-3 bg-red-50 rounded-full">
                                        <FiAlertTriangle size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold">Delete Account?</h2>
                                </div>

                                <p className="text-gray-600 text-sm mb-6">
                                    This action is <strong>permanent</strong>. All your bookmarks, search history, and profile data will be wiped immediately.
                                </p>

                                <form action={formAction} className="space-y-4">
                                    {/* ... Inputs for email, password, confirmation (Same as before) ... */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type your email ({userEmail})</label>
                                        <input
                                            name="email"
                                            placeholder={userEmail}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type "I AGREE"</label>
                                        <input
                                            name="confirmation"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="agree"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor="agree" className="text-xs text-gray-600">
                                            I understand that this action is irreversible.
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                            disabled={!agreed}
                                        >
                                            Delete Permanently
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Card>
    );
}
