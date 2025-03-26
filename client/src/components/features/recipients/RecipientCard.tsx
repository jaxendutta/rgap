// src/components/features/recipients/RecipientCard.tsx
import React from "react";
import EntityCard from "@/components/common/ui/EntityCard";
import { Recipient } from "@/types/models";

export interface RecipientCardProps {
    recipient: Recipient;
    isBookmarked?: boolean;
    className?: string;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
    recipient,
    isBookmarked = false,
    className,
}) => {
    return (
        <EntityCard
            entity={recipient}
            entityType="recipient"
            isBookmarked={isBookmarked}
            className={className}
        />
    );
};

export default RecipientCard;