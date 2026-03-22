import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RouteService } from '../core/application/RouteService';
import { IRouteRepository } from '../core/ports/IRouteRepository';

describe('RouteService', () => {
    let mockRouteRepo: jest.Mocked<IRouteRepository>;
    let routeService: RouteService;

    beforeEach(() => {
        mockRouteRepo = {
            getAll: jest.fn(),
            getById: jest.fn(),
            setBaseline: jest.fn(),
            getBaseline: jest.fn(),
        };

        routeService = new RouteService(mockRouteRepo);
    });

    it('should compute comparison correctly', async () => {
        mockRouteRepo.getBaseline.mockResolvedValue({
            route_id: 'R001', year: 2025, ghg_intensity: 90.0,
            vessel_type: 'Test', fuel_type: 'HFO', fuel_consumption: 100, distance: 100, total_emissions: 100, is_baseline: true
        });

        mockRouteRepo.getAll.mockResolvedValue([
            {
                route_id: 'R002', year: 2025, ghg_intensity: 85.0,
                vessel_type: 'Test', fuel_type: 'LNG', fuel_consumption: 100, distance: 100, total_emissions: 100, is_baseline: false
            },
            {
                route_id: 'R003', year: 2025, ghg_intensity: 95.0,
                vessel_type: 'Test', fuel_type: 'HFO', fuel_consumption: 100, distance: 100, total_emissions: 100, is_baseline: false
            }
        ]);

        const result = await routeService.getComparison();

        expect(result.length).toBe(2);

        const r2 = result.find(r => r.route_id === 'R002');
        expect(r2?.percentDiff).toBeCloseTo(-5.56); // (85 - 90) / 90 * 100 = -5.555...
        expect(r2?.compliant).toBe(true); // 85 < 89.3368

        const r3 = result.find(r => r.route_id === 'R003');
        expect(r3?.percentDiff).toBeCloseTo(5.56); // (95 - 90) / 90 * 100 = 5.555...
        expect(r3?.compliant).toBe(false); // 95 > 89.3368
    });
});
