// src/components/common/ui/MultiSelect.tsx

import { LucideIcon } from "lucide-react";
import { Dropdown } from "./Dropdown";

export interface MultiSelectProps {
    icon?: LucideIcon;
    label: string;
    options: string[];
    values: string[];
    onChange: (values: string[]) => void;
}

export const MultiSelect = ({
    icon,
    label,
    options = [],
    values = [],
    onChange,
}: MultiSelectProps) => {
    return (
        <Dropdown
            icon={icon}
            label={label}
            value={values}
            options={options}
            onChange={onChange}
            multiple={true}
        />
    );
};
