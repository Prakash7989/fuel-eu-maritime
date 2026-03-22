import type { Route, ShipCompliance, AdjustedCB, BankEntry, PoolMember } from '../domain/Models';

export interface IApiAdapter {
    getRoutes(): Promise<Route[]>;
    setBaseline(id: string): Promise<void>;
    getComparison(): Promise<Route[]>;

    getCB(shipId: string, year: number): Promise<ShipCompliance>;
    getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;

    getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;
    bankCB(shipId: string, year: number, amount: number): Promise<void>;
    applyCB(shipId: string, year: number, amount: number): Promise<void>;

    createPool(year: number, shipIds: string[]): Promise<{ poolId: number, members: PoolMember[] }>;
}
