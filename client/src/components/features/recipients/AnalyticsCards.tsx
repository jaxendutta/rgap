// src/components/features/recipients/AnalyticsCards.tsx
import { Card } from "@/components/common/ui/Card";

// Single Analytics Card Component
interface AnalyticsCardProps {
    title: string;
    icon: React.ReactNode;
    fields: { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
}

export const AnalyticsCard = ({ title, icon, fields }: AnalyticsCardProps) => {
    return (
        <Card className="p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
                {icon}
                {title}
            </h3>
            <div className="space-y-1">
                {fields.map((field, index) => (
                    <div key={index} className="flex justify-between">
                        <div className="flex items-center">
                            {field.icon && <span>{field.icon}</span>}
                            <span className="text-sm text-gray-600">
                                {field.label}
                            </span>
                        </div>
                        <span className="text-sm font-medium">
                            {field.value}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Analytics Stats Cards Component
interface AnalyticsCardsProps {
    cards: {
        title: string;
        icon: React.ReactNode;
        fields: {
            label: string;
            value: React.ReactNode;
            icon?: React.ReactNode;
        }[];
    }[];
}

export const AnalyticsCards = ({ cards }: AnalyticsCardsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {cards.map((card, index) => (
                <AnalyticsCard
                    key={index}
                    title={card.title}
                    icon={card.icon}
                    fields={card.fields}
                />
            ))}
        </div>
    );
};
