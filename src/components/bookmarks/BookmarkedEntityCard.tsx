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
import { Institute, Recipient, InstituteWithStats, RecipientWithStats, isRecipient, RECIPIENT_TYPE_LABELS } from "@/types/database";

// Define a union type that matches what our API returns (includes notes)
type BookmarkedData = (InstituteWithStats | RecipientWithStats) & { notes?: string };

interface BookmarkedEntityCardProps {
    data: BookmarkedData;
    type: "recipient" | "institute";
}

export default function BookmarkedEntityCard({ data, type }: BookmarkedEntityCardProps) {
    const router = useRouter();

    // Type guards / Data access
    const isInstitute = type === "institute";

    // ID Access
    const id = isInstitute
        ? (data as Institute).institute_id
        : (data as Recipient).recipient_id;

    // Name Access
    const name = isInstitute
        ? (data as Institute).name
        : (data as Recipient).legal_name;

    const recipientType = !isInstitute ? (data as Recipient).type : "Institute";

    // Location Access
    const city = (data as any).city;
    const province = (data as any).province;
    const country = (data as any).country || "CA";
    const location = [city, province, country].filter(Boolean).join(", ");

    // For Recipients: Institute Name
    // The query returns this as 'research_organization_name'
    const instituteName = !isInstitute
        ? (data as RecipientWithStats).research_organization_name
        : null;

    const instituteId = !isInstitute
        ? (data as Recipient).institute_id
        : null;

    const link = isInstitute ? `/institutes/${id}` : `/recipients/${id}`;

    // Handle Note Save
    const handleSaveNote = async (note: string) => {
        if (isInstitute) {
            return await updateInstituteNote(id, note);
        } else {
            return await updateRecipientNote(id, note);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:border-gray-300 transition-all duration-200">
            <div className="p-3 md:p-4 flex-1 flex flex-col gap-0.75 md:gap-1.25 border-b-1 border-gray-300 shadow-sm rounded-2xl">
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
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
                <div className="flex flex-wrap gap-2">
                    {location && (
                        <Tag icon={LuMapPin} text={location} size="xs" variant="outline" />
                    )}
                    {instituteName && instituteId && (
                        <Tag
                            icon={LuUniversity}
                            text={instituteName}
                            size="xs"
                            variant="link"
                            className="cursor-pointer hover:bg-gray-100 max-w-full truncate"
                            onClick={() => router.push(`/institutes/${instituteId}`)}
                        />
                    )}

                    {!isInstitute && recipientType !== "Institute" && (
                        <Tag
                            icon={LuSquareUser}
                            text={RECIPIENT_TYPE_LABELS[recipientType as keyof typeof RECIPIENT_TYPE_LABELS]}
                            size="xs"
                            variant="default"
                        />
                    )}
                </div>
            </div>
            
            {/* Notes Section - Pushed to bottom */}
            <div className="p-2.5 md:pt-2">
                <NoteEditor
                    initialNote={data.notes || null}
                    onSave={handleSaveNote}
                    placeholder={`Notes about this ${type}...`}
                />
            </div>
        </Card>
    );
}
