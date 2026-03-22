import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PoolingService } from '../core/application/PoolingService';
import { IPoolRepository, IComplianceRepository } from '../core/ports/IComplianceRepository';
import { ShipCompliance } from '../core/domain/Compliance';

describe('PoolingService', () => {
    let mockPoolRepo: jest.Mocked<IPoolRepository>;
    let mockCompRepo: jest.Mocked<IComplianceRepository>;
    let poolingService: PoolingService;

    beforeEach(() => {
        mockPoolRepo = {
            createPool: jest.fn<any>(),
            savePoolMembers: jest.fn<any>(),
            getPoolsByYear: jest.fn<any>(),
            getPoolMembers: jest.fn<any>(),
        } as any;
        mockCompRepo = {
            getSnapshot: jest.fn<any>(),
            saveSnapshot: jest.fn<any>(),
        } as any;

        poolingService = new PoolingService(mockPoolRepo, mockCompRepo);
    });

    it('should create a valid pool and allocate surplus optimally', async () => {
        const ships: ShipCompliance[] = [
            { id: 1, ship_id: 'R001', year: 2025, cb_gco2eq: -2000 },
            { id: 2, ship_id: 'R002', year: 2025, cb_gco2eq: 5000 },
            { id: 3, ship_id: 'R003', year: 2025, cb_gco2eq: -1000 }
        ];

        mockCompRepo.getSnapshot.mockImplementation(async (id: string, year: number) => {
            return ships.find(s => s.ship_id === id) || null;
        });
        mockPoolRepo.createPool.mockResolvedValue(1);

        const result = await poolingService.createPool(2025, ['R001', 'R002', 'R003']);

        expect(result.poolId).toBe(1);
        expect(mockPoolRepo.savePoolMembers).toHaveBeenCalled();

        // R002 has 5000, covers R001 (2000) and R003 (1000). R002 should have 2000 left.
        const r001 = result.members.find(m => m.ship_id === 'R001')!;
        const r002 = result.members.find(m => m.ship_id === 'R002')!;
        const r003 = result.members.find(m => m.ship_id === 'R003')!;

        expect(r001.cb_after).toBeCloseTo(0);
        expect(r003.cb_after).toBeCloseTo(0);
        expect(r002.cb_after).toBeCloseTo(2000);
    });

    it('should throw an error if pool total CB is negative', async () => {
        const ships: ShipCompliance[] = [
            { id: 1, ship_id: 'R001', year: 2025, cb_gco2eq: -5000 },
            { id: 2, ship_id: 'R002', year: 2025, cb_gco2eq: 2000 }
        ];

        mockCompRepo.getSnapshot.mockImplementation(async (id: string, year: number) => {
            return ships.find(s => s.ship_id === id) || null;
        });

        await expect(poolingService.createPool(2025, ['R001', 'R002']))
            .rejects.toThrow('Pool sum total CB is negative');
    });

    it('should reject if any ship does not have a snapshot', async () => {
        mockCompRepo.getSnapshot.mockResolvedValue(null);
        await expect(poolingService.createPool(2025, ['R001']))
            .rejects.toThrow('Some ships do not have a compliance snapshot');
    });
});
