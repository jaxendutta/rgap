// src/components/bookmarks/BookmarkedEntityCard.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuArrowUpRight, LuMapPin, LuUniversity, LuLandmark, LuSquareUser } from "react-icons/lu";
import { Card } from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import NoteEditor from "@/components/bookmarks/NoteEditor";
import { updateRecipientNote, updateInstituteNote } from "@/app/actions/bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkedEntityCardProps {
    data: any; // Using any for flexibility with the joined SQL result
    type: "recipient" | "institute";
}

export default function BookmarkedEntityCard({ data, type }: BookmarkedEntityCardProps) {
    const router = useRouter();

    // Map fields based on type
    const id = type === "institute" ? data.institute_id : data.recipient_id;
    const name = type === "institute" ? data.name : data.legal_name;
    const link = `/${type}s/${id}`;

    // Location logic
    const city = data.city;
    const province = data.province;
    const country = data.country || "CA";
    const location = [city, province, country].filter(Boolean).join(", ");

    // Handle Note Save
    const handleSaveNote = async (note: string) => {
        if (type === "institute") {
            return await updateInstituteNote(id, note);
        } else {
            return await updateRecipientNote(id, note);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:border-gray-300 transition-all duration-200">
            <div className="p-4 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-2">
                    <Link
                        href={link}
                        className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors group flex items-start gap-1"
                    >
                        <span className="line-clamp-2">{name}</span>
                        <LuArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                    </Link>
                    <BookmarkButton
                        entityType={type}
                        entityId={id}
                        isBookmarked={true}
                        variant="ghost"
                        size="sm"
                        showLabel={false}
                    />
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {location && (
                        <Tag icon={LuMapPin} text={location} size="sm" variant="outline" />
                    )}
                    {type === "recipient" && data.institute_name && (
                        <Tag
                            icon={LuUniversity}
                            text={data.institute_name}
                            size="sm"
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => router.push(`/institutes/${data.institute_id}`)}
                        />
                    )}
                    <Tag
                        icon={type === "institute" ? LuLandmark : LuSquareUser}
                        text={type === "institute" ? "Institute" : "Recipient"}
                        size="sm"
                        variant="default"
                    />
                </div>

                {/* Notes Section - Replaces Stats */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <NoteEditor
                        initialNote={data.notes}
                        onSave={handleSaveNote}
                        placeholder={`Notes about this ${type}...`}
                    />
                </div>
            </div>
        </Card>
    );
}
