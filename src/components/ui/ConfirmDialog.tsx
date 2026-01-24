// src/components/ui/ConfirmDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuTriangleAlert, LuX } from 'react-icons/lu';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = 'danger',
    isLoading = false
}: ConfirmDialogProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog Panel */}
            <div className="p-4 md:p-6 gap-4 flex flex-col relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className={cn(
                        "flex-shrink-0 size-8 md:size-10 rounded-full flex items-center justify-center",
                        variant === 'danger' ? "bg-red-100 text-red-600" :
                            variant === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                        <LuTriangleAlert className="flex-shrink-0 size-4 md:size-4 lg:size-5" />
                    </div>
                    <div className={cn(
                        "py-1.5 flex-1 rounded-full flex items-center justify-center",
                        variant === 'danger' ? "bg-red-100 text-red-600" :
                            variant === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900">{title}</h3>

                    </div>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="size-8 md:size-10 text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <LuX className="flex-shrink-0 size-4 lg:size-5" />
                    </ Button>
                </div>

                <div className="text-xs md:text-sm text-gray-500">
                    {description}
                </div>

                <div className="flex flex-wrap-reverse gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 text-xs md:text-sm"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'primary' : 'secondary'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={cn(
                            "flex-1 text-xs md:text-sm",
                            variant === 'danger' && "bg-red-700 hover:bg-red-700"
                        )}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
