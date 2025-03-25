// src/components/features/institutes/InstituteHeader.tsx
import {
    University,
    FileUser,
    MapPin,
    CircleArrowOutUpRight,
} from "lucide-react";
import EntityHeader, {
    MetadataItem,
    ActionButton,
} from "@/components/common/layout/EntityHeader";

interface InstituteHeaderProps {
    institute: any;
    isBookmarked: boolean;
    toggleBookmark: () => void;
}

const InstituteHeader = ({
    institute,
    isBookmarked,
    toggleBookmark,
}: InstituteHeaderProps) => {
    // Create a Google search URL for the institute
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        institute.name
    )}`;

    // Prepare metadata for the EntityHeader
    const metadata: MetadataItem[] = [];

    if (institute.type) {
        metadata.push({
            icon: FileUser,
            text: institute.type,
        });
    }

    if (institute.city || institute.province || institute.country) {
        metadata.push({
            icon: MapPin,
            text: `${institute.city ? `${institute.city}, ` : ""}${
                institute.province || ""
            }${institute.country ? `, ${institute.country}` : ""}`,
        });
    }

    // Prepare actions for the EntityHeader
    const actions: ActionButton[] = [
        {
            icon: CircleArrowOutUpRight,
            label: "Look up",
            onClick: () =>
                window.open(searchUrl, "_blank", "noopener,noreferrer"),
            variant: "outline",
        },
    ];

    return (
        <EntityHeader
            title={institute.name}
            icon={University}
            metadata={metadata}
            actions={actions}
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            entityType="institute"
            entityId={institute.institute_id}
        />
    );
};

export default InstituteHeader;
