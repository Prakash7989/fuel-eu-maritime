export interface Route {
    id: number;
    route_id: string;
    vessel_type: string;
    fuel_type: string;
    year: number;
    ghg_intensity: number;
    fuel_consumption: number;
    distance: number;
    total_emissions: number;
    is_baseline: boolean;
    compliant?: boolean;
    percentDiff?: number;
}

export interface ShipCompliance {
    ship_id: string;
    year: number;
    cb_gco2eq: number;
}

export interface AdjustedCB {
    ship_id: string;
    year: number;
    original_cb: number;
    adjusted_cb: number;
}

export interface BankEntry {
    id: number;
    ship_id: string;
    year: number;
    amount_gco2eq: number;
}

export interface PoolMember {
    pool_id: number;
    ship_id: string;
    cb_before: number;
    cb_after: number;
}
