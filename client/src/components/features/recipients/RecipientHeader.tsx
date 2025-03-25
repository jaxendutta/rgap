// src/components/features/recipients/RecipientHeader.tsx
import {
    GraduationCap,
    University,
    FileUser,
    MapPin,
    CircleArrowOutUpRight,
} from "lucide-react";
import EntityHeader, {
    MetadataItem,
    ActionButton,
} from "@/components/common/layout/EntityHeader";
import { Recipient } from "@/types/models";
import { EntityType } from "@/constants/data";

// Recipient Header Component
interface RecipientHeaderProps {
    recipient: Recipient;
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

    // Prepare metadata for the EntityHeader
    const metadata: MetadataItem[] = [];

    if (recipient.research_organization_name) {
        metadata.push({
            icon: University,
            text: recipient.research_organization_name,
            href: `/institutes/${recipient.institute_id}`,
        });
    }

    metadata.push({
        icon: FileUser,
        text: recipient.type
            ? EntityType[recipient.type as keyof typeof EntityType]
            : "Unspecified",
    });

    if (recipient.city || recipient.province) {
        metadata.push({
            icon: MapPin,
            text: [recipient.city, recipient.province, recipient.country]
                .filter(Boolean)
                .join(", "),
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
            title={recipient.legal_name}
            icon={GraduationCap}
            metadata={metadata}
            actions={actions}
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            entityType="recipient"
            entityId={recipient.recipient_id}
        />
    );
};

export default RecipientHeader;
