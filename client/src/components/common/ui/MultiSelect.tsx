// src/components/common/ui/MultiSelect.tsx

import { Dropdown } from "./Dropdown";

export interface MultiSelectProps {
    label: string;
    options: string[];
    values: string[];
    onChange: (values: string[]) => void;
}

export const MultiSelect = ({
    label,
    options = [],
    values = [],
    onChange,
}: MultiSelectProps) => {
    return (
        <Dropdown
            label={label}
            value={values}
            options={options}
            onChange={onChange}
            multiple={true}
        />
    );
};
