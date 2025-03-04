// src/components/features/recipients/RecipientHeader.tsx
import {
    GraduationCap,
    University,
    FileUser,
    MapPin,
    BookmarkCheck,
    BookmarkPlus,
    CircleArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { cn } from "@/utils/cn";

// Recipient Header Component
interface RecipientHeaderProps {
    recipient: any;
    isBookmarked: boolean;
    toggleBookmark: () => void;
}

const RecipientHeader = ({
    recipient,
    isBookmarked,
    toggleBookmark,
}: RecipientHeaderProps) => {
    // Create a Google search URL for the recipient
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        `${recipient.legal_name} ${recipient.research_organization_name || ""}`
    )}`;

    const actionButtons = (
        <>
            <Button
                onClick={() =>
                    window.open(searchUrl, "_blank", "noopener,noreferrer")
                }
                variant="outline"
                className="flex items-center gap-2 text-sm border-dashed hover:border-solid"
            >
                <span>Look up</span>
                <CircleArrowOutUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
                onClick={toggleBookmark}
                variant="secondary"
                className={cn(
                    "p-1 transition-colors hover:bg-gray-50",
                    isBookmarked
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-400 hover:text-gray-600"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
                {isBookmarked ? (
                    <BookmarkCheck className="h-6 w-6" />
                ) : (
                    <BookmarkPlus className="h-6 w-6" />
                )}
            </Button>
        </>
    );

    return (
        <div className="p-4 lg:p-6 pb-4 border-b border-gray-100">
            <div className="flex flex-wrap justify-between">
                <div className="space-y-2 max-w-full lg:max-w-3xl ">
                    <div className="flex flex-col lg:flex-row items-start gap-3">
                        <div className="flex flex-row items-start justify-between w-full lg:w-auto">
                            <GraduationCap className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
                            <div className="lg:hidden flex items-start gap-1">
                                {actionButtons}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                {recipient.legal_name}
                            </h1>
                            <div className="flex flex-wrap items-center text-gray-600 mt-1 gap-x-4 gap-y-1">
                                {recipient.research_organization_name && (
                                    <div className="flex items-center gap-1.5">
                                        <University className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                            {
                                                recipient.research_organization_name
                                            }
                                        </span>
                                    </div>
                                )}
                                {recipient.recipient_type && (
                                    <div className="flex items-center gap-1.5">
                                        <FileUser className="h-4 w-4 flex-shrink-0" />
                                        <span>{recipient.recipient_type}</span>
                                    </div>
                                )}
                                {(recipient.city || recipient.province) && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                            {recipient.city
                                                ? `${recipient.city}, `
                                                : ""}
                                            {recipient.province || ""}
                                            {recipient.country &&
                                                `, ${recipient.country}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex flex-row items-start gap-3 mt-4 lg:mt-0">
                    {actionButtons}
                </div>
            </div>
        </div>
    );
};

export default RecipientHeader;
