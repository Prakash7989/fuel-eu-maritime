export interface ShipCompliance {
    id?: number;
    ship_id: string;
    year: number;
    cb_gco2eq: number;
}

export interface BankEntry {
    id?: number;
    ship_id: string;
    year: number;
    amount_gco2eq: number;
}

export interface Pool {
    id?: number;
    year: number;
    created_at?: Date;
}

export interface PoolMember {
    pool_id: number;
    ship_id: string;
    cb_before: number;
    cb_after: number;
}
