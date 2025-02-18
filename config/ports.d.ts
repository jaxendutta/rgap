interface PortRange {
    start: number;
    end: number;
}

interface PortRanges {
    client: PortRange;
    server: PortRange;
    database: PortRange;
}

interface PortDefaults {
    client: number;
    server: number;
    database: number;
}

interface PortConfig {
    ranges: PortRanges;
    defaults: PortDefaults;
}

export const PortConfig: PortConfig;
export function findAvailablePorts(): Promise<{
    client: number;
    server: number;
    database: number;
}>;
export function getPortConfig(): PortConfig;
export const RANGES: PortRanges;
export const DEFAULTS: PortDefaults;
