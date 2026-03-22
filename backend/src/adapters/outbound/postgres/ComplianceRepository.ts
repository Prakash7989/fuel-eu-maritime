import { IComplianceRepository, IBankingRepository, IPoolRepository } from '../../../core/ports/IComplianceRepository';
import { ShipCompliance, BankEntry, Pool, PoolMember } from '../../../core/domain/Compliance';
import { query } from '../../../infrastructure/db/connection';

export class PostgresComplianceRepository implements IComplianceRepository, IBankingRepository, IPoolRepository {

    // -- Compliance --

    async saveSnapshot(compliance: ShipCompliance): Promise<void> {
        const existing = await this.getSnapshot(compliance.ship_id, compliance.year);
        if (existing) {
            await query(
                'UPDATE ship_compliance SET cb_gco2eq = $1 WHERE ship_id = $2 AND year = $3',
                [compliance.cb_gco2eq, compliance.ship_id, compliance.year]
            );
        } else {
            await query(
                'INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ($1, $2, $3)',
                [compliance.ship_id, compliance.year, compliance.cb_gco2eq]
            );
        }
    }

    async getSnapshot(shipId: string, year: number): Promise<ShipCompliance | null> {
        const res = await query('SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2', [shipId, year]);
        return res.rows.length ? res.rows[0] : null;
    }

    // -- Banking --

    async getBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
        const res = await query('SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2', [shipId, year]);
        return res.rows;
    }

    async saveBankEntry(entry: BankEntry): Promise<void> {
        await query(
            'INSERT INTO bank_entries (ship_id, year, amount_gco2eq) VALUES ($1, $2, $3)',
            [entry.ship_id, entry.year, entry.amount_gco2eq]
        );
    }

    async getTotalBanked(shipId: string): Promise<number> {
        const res = await query('SELECT SUM(amount_gco2eq) as total FROM bank_entries WHERE ship_id = $1', [shipId]);
        return parseFloat(res.rows[0]?.total || '0');
    }

    // -- Pooling --

    async createPool(pool: Omit<Pool, 'id' | 'created_at'>): Promise<number> {
        const res = await query(
            'INSERT INTO pools (year) VALUES ($1) RETURNING id',
            [pool.year]
        );
        return res.rows[0].id;
    }

    async savePoolMembers(members: PoolMember[]): Promise<void> {
        for (const mem of members) {
            await query(
                'INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)',
                [mem.pool_id, mem.ship_id, mem.cb_before, mem.cb_after]
            );
        }
    }

    async getPoolsByYear(year: number): Promise<Pool[]> {
        const res = await query('SELECT * FROM pools WHERE year = $1', [year]);
        return res.rows;
    }

    async getPoolMembers(poolId: number): Promise<PoolMember[]> {
        const res = await query('SELECT * FROM pool_members WHERE pool_id = $1', [poolId]);
        return res.rows;
    }
}
