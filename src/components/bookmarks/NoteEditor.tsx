// src/components/bookmarks/NoteEditor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { LuCheck, LuLoader, LuPlus, LuStickyNote } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
    initialNote: string | null;
    onSave: (note: string) => Promise<{ success: boolean; error?: string }>;
    placeholder?: string;
    className?: string;
    label?: string;
}

export default function NoteEditor({
    initialNote,
    onSave,
    placeholder = "Add a note...",
    className,
    label = "Notes"
}: NoteEditorProps) {
    const [note, setNote] = useState(initialNote || "");
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isExpanded, setIsExpanded] = useState(!!initialNote);

    // 1. Create a ref to access the textarea DOM element
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync state with props
    useEffect(() => {
        setNote(initialNote || "");
        setIsDirty(false);
        if (initialNote) setIsExpanded(true);
    }, [initialNote]);

    // 2. Auto-focus whenever the editor expands
    useEffect(() => {
        if (isExpanded && textareaRef.current) {
            // Small timeout ensures the render is complete before focusing
            // preventing race conditions in some browsers
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 0);
        }
    }, [isExpanded]);

    const handleSave = async () => {
        if (!isDirty) return;

        setIsSaving(true);
        const result = await onSave(note);
        setIsSaving(false);

        if (result.success) {
            setIsDirty(false);
            setLastSaved(new Date());
            setTimeout(() => setLastSaved(null), 3000);

            // If empty after save, collapse it
            if (!note.trim()) {
                setIsExpanded(false);
            }
        }
    };

    const handleBlur = () => {
        // If empty and clean (user opened but didn't type, or cleared it previously), collapse immediately
        if (!note.trim() && !isDirty) {
            setIsExpanded(false);
        } else {
            // Otherwise try to save
            handleSave();
        }
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="text-xs md:text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors md:py-2 group"
            >
                <div className="p-1 rounded bg-gray-100 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600">
                    <LuPlus className="size-2.5 md:size-3" />
                </div>
                Add notes only visible to you
            </button>
        );
    }

    return (
        <div className={cn("relative group animate-in fade-in zoom-in-95 duration-200", className)}>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 md:gap-1.5">
                    <LuStickyNote className="size-2.5 md:size-3" />
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <div className="text-xs h-4">
                        {isSaving && <span className="text-blue-600 flex items-center gap-1"><LuLoader className="animate-spin size-2.5 md:size-3" /> Saving...</span>}
                        {!isSaving && lastSaved && <span className="text-green-600 flex items-center gap-1"><LuCheck className="size-2.5 md:size-3" /> Saved</span>}
                    </div>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => {
                    setNote(e.target.value);
                    setIsDirty(true);
                }}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="w-full text-xs md:text-sm p-3 bg-yellow-50/50 border border-yellow-200 rounded-2xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent outline-none resize-none min-h-[80px] transition-all placeholder:text-gray-400 text-gray-700 block"
            />

            {isDirty && !isSaving && (
                <div className="absolute bottom-2 right-3 text-xs text-gray-400 italic pointer-events-none">
                    Click outside to save
                </div>
            )}
        </div>
    );
}
