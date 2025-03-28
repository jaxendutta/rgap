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
import { RecipientType } from "@/constants/data";
import { formatCommaSeparated } from "@/utils/format";

const RecipientHeader = (
    recipient: Recipient & { is_bookmarked?: boolean }
) => {
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
            ? RecipientType[recipient.type as keyof typeof RecipientType]
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
            entityType="recipient"
            entityId={recipient.recipient_id}
            isBookmarked={recipient.is_bookmarked}
            location={formatCommaSeparated([
                recipient.city,
                recipient.province,
                recipient.country,
            ])}
        />
    );
};

export default RecipientHeader;
