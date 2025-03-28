// src/components/features/institutes/InstituteHeader.tsx
import { University, CircleArrowOutUpRight } from "lucide-react";
import EntityHeader, {
    MetadataItem,
    ActionButton,
} from "@/components/common/layout/EntityHeader";
import { Institute } from "@/types/models";
import { formatCommaSeparated } from "@/utils/format";

const InstituteHeader = (
    institute: Institute & { is_bookmarked?: boolean }
) => {
    // Create a Google search URL for the institute
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        institute.name
    )}`;

    // Prepare metadata for the EntityHeader
    const metadata: MetadataItem[] = [];

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
            entityType="institute"
            entityId={institute.institute_id}
            isBookmarked={institute.is_bookmarked}
            location={formatCommaSeparated([
                institute.city,
                institute.province,
                institute.country,
            ])}
        />
    );
};

export default InstituteHeader;
