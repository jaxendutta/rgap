// src/components/bookmarks/NoteEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { LuPencil, LuCheck, LuLoader } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
    initialNote: string | null;
    onSave: (note: string) => Promise<{ success: boolean; error?: string }>;
    placeholder?: string;
    className?: string;
}

export default function NoteEditor({ initialNote, onSave, placeholder = "Add a note...", className }: NoteEditorProps) {
    const [note, setNote] = useState(initialNote || "");
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Reset internal state if prop changes (e.g. revalidation)
    useEffect(() => {
        setNote(initialNote || "");
        setIsDirty(false);
    }, [initialNote]);

    const handleSave = async () => {
        if (!isDirty) return;

        setIsSaving(true);
        const result = await onSave(note);
        setIsSaving(false);

        if (result.success) {
            setIsDirty(false);
            setLastSaved(new Date());
            // Clear "Saved" message after 3 seconds
            setTimeout(() => setLastSaved(null), 3000);
        }
    };

    return (
        <div className={cn("relative group", className)}>
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <LuPencil className="w-3 h-3" />
                    Personal Notes
                </label>
                <div className="text-xs h-4">
                    {isSaving && <span className="text-blue-600 flex items-center gap-1"><LuLoader className="animate-spin w-3 h-3" /> Saving...</span>}
                    {!isSaving && lastSaved && <span className="text-green-600 flex items-center gap-1"><LuCheck className="w-3 h-3" /> Saved</span>}
                </div>
            </div>
            <textarea
                value={note}
                onChange={(e) => {
                    setNote(e.target.value);
                    setIsDirty(true);
                }}
                onBlur={handleSave}
                placeholder={placeholder}
                className="w-full text-sm p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none min-h-[80px] transition-all placeholder:text-gray-400 text-gray-700"
            />
            {isDirty && !isSaving && (
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 italic pointer-events-none">
                    Click outside to save
                </div>
            )}
        </div>
    );
}
