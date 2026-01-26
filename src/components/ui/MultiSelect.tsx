// src/components/ui/MultiSelect.tsx

import { Dropdown } from "./Dropdown";
import { IconType } from "react-icons";

export interface MultiSelectProps {
    icon?: IconType;
    label: string;
    options: string[];
    values: string[];
    onChange: (values: string[]) => void;
    fullWidth?: boolean;
}

export const MultiSelect = ({
    icon,
    label,
    options = [],
    values = [],
    onChange,
    fullWidth = false,
}: MultiSelectProps) => {
    return (
        <Dropdown
            icon={icon}
            label={label}
            value={values}
            options={options}
            onChange={onChange}
            multiple={true}
            fullWidth={fullWidth}
        />
    );
};
