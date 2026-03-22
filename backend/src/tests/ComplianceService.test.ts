import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ComplianceService } from '../core/application/ComplianceService';
import { IComplianceRepository, IBankingRepository } from '../core/ports/IComplianceRepository';
import { IRouteRepository } from '../core/ports/IRouteRepository';

describe('ComplianceService', () => {
    let complianceService: ComplianceService;
    let mockCompRepo: jest.Mocked<IComplianceRepository>;
    let mockRouteRepo: jest.Mocked<IRouteRepository>;
    let mockBankRepo: jest.Mocked<IBankingRepository>;

    beforeEach(() => {
        mockCompRepo = {
            saveSnapshot: jest.fn(),
            getSnapshot: jest.fn(),
        };
        mockRouteRepo = {
            getAll: jest.fn(),
            getById: jest.fn(),
            setBaseline: jest.fn(),
            getBaseline: jest.fn(),
        };
        mockBankRepo = {
            getBankEntries: jest.fn(),
            saveBankEntry: jest.fn(),
            getTotalBanked: jest.fn()
        };

        complianceService = new ComplianceService(mockCompRepo, mockRouteRepo, mockBankRepo);
    });

    it('should compute positive CB (Surplus)', async () => {
        mockRouteRepo.getById.mockResolvedValue({
            route_id: 'R002',
            vessel_type: 'BulkCarrier',
            fuel_type: 'LNG',
            year: 2025,
            ghg_intensity: 88.0, // target is 89.3368
            fuel_consumption: 4800,
            distance: 11500,
            total_emissions: 4200,
            is_baseline: false
        });

        const result = await complianceService.computeCB('R002', 2025);

        // (89.3368 - 88.0) * (4800 * 41000)
        // 1.3368 * 196800000 = 263082240
        expect(result.cb_gco2eq).toBeGreaterThan(0);
        expect(mockCompRepo.saveSnapshot).toHaveBeenCalledWith(result);
    });

    it('should compute negative CB (Deficit)', async () => {
        mockRouteRepo.getById.mockResolvedValue({
            route_id: 'R001',
            vessel_type: 'Container',
            fuel_type: 'HFO',
            year: 2024,
            ghg_intensity: 91.0, // greater than target 89.3368
            fuel_consumption: 5000,
            distance: 12000,
            total_emissions: 4500,
            is_baseline: false
        });

        const result = await complianceService.computeCB('R001', 2024);

        expect(result.cb_gco2eq).toBeLessThan(0);
    });
});
