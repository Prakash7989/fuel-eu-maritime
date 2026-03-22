import { ShipCompliance, BankEntry, Pool, PoolMember } from '../domain/Compliance';

export interface IComplianceRepository {
    saveSnapshot(compliance: ShipCompliance): Promise<void>;
    getSnapshot(shipId: string, year: number): Promise<ShipCompliance | null>;
}

export interface IBankingRepository {
    getBankEntries(shipId: string, year: number): Promise<BankEntry[]>;
    saveBankEntry(entry: BankEntry): Promise<void>;
    getTotalBanked(shipId: string): Promise<number>;
}

export interface IPoolRepository {
    createPool(pool: Omit<Pool, 'id' | 'created_at'>): Promise<number>;
    savePoolMembers(members: PoolMember[]): Promise<void>;
    getPoolsByYear(year: number): Promise<Pool[]>;
    getPoolMembers(poolId: number): Promise<PoolMember[]>;
}
