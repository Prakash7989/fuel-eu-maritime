import { IPoolRepository, IComplianceRepository } from '../ports/IComplianceRepository';
import { PoolMember } from '../domain/Compliance';

export class PoolingService {
    constructor(
        private poolRepo: IPoolRepository,
        private complianceRepo: IComplianceRepository
    ) { }

    async createPool(year: number, shipIds: string[]) {
        // 1. Fetch CB for all ships
        const snapshots = await Promise.all(
            shipIds.map(id => this.complianceRepo.getSnapshot(id, year))
        );

        // Filter valid
        const validSnapshots = snapshots.filter(s => s !== null);
        if (validSnapshots.length !== shipIds.length) {
            throw new Error('Some ships do not have a compliance snapshot');
        }

        const totalCB = validSnapshots.reduce((sum, s) => sum + s!.cb_gco2eq, 0);
        if (totalCB < 0) {
            throw new Error('Pool sum total CB is negative');
        }

        // Strategy: Greedy allocation
        // Deficit ships cannot exit worse
        // Surplus ships cannot exit negative
        const members: PoolMember[] = validSnapshots.map(s => ({
            pool_id: 0,
            ship_id: s!.ship_id,
            cb_before: s!.cb_gco2eq,
            cb_after: s!.cb_gco2eq
        }));

        members.sort((a, b) => b.cb_before - a.cb_before); // Descending

        const surplusMembers = members.filter(m => m.cb_before > 0);
        const deficitMembers = members.filter(m => m.cb_before < 0);

        let currentSurplusIdx = 0;

        for (const defMem of deficitMembers) {
            let needed = Math.abs(defMem.cb_after);

            while (needed > 0 && currentSurplusIdx < surplusMembers.length) {
                const surMem = surplusMembers[currentSurplusIdx]!;
                const available = surMem.cb_after;

                if (available >= needed) {
                    surMem.cb_after -= needed;
                    defMem.cb_after += needed;
                    needed = 0;
                } else if (available > 0) {
                    surMem.cb_after -= available;
                    defMem.cb_after += available;
                    needed -= available;
                    currentSurplusIdx++;
                } else {
                    currentSurplusIdx++;
                }
            }
        }

        // Assert total hasn't changed
        const finalTotal = members.reduce((sum, m) => sum + m.cb_after, 0);
        if (Math.abs(finalTotal - totalCB) > 0.01) {
            throw new Error('Math error during pooling allocation');
        }

        // Ensure deficit ship didn't exit worse, and surplus didn't exit negative
        for (const m of members) {
            if (m.cb_before < 0 && m.cb_after < m.cb_before) throw new Error('Deficit ship exited worse');
            if (m.cb_before > 0 && m.cb_after < 0) throw new Error('Surplus ship exited negative');
        }

        const poolId = await this.poolRepo.createPool({ year });
        members.forEach(m => m.pool_id = poolId);

        await this.poolRepo.savePoolMembers(members);

        return {
            poolId,
            members
        };
    }
}
