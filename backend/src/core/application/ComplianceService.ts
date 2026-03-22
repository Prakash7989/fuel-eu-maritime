import { IComplianceRepository, IBankingRepository } from '../ports/IComplianceRepository';
import { IRouteRepository } from '../ports/IRouteRepository';

export class ComplianceService {
    constructor(
        private complianceRepo: IComplianceRepository,
        private routeRepo: IRouteRepository,
        private bankingRepo: IBankingRepository
    ) { }

    async computeCB(shipId: string, year: number) {
        // 1. Fetch from route repository
        const route = await this.routeRepo.getById(shipId);
        if (!route) {
            throw new Error('Ship/Route not found');
        }

        // Energy in scope (MJ) ≈ fuelConsumption × 41 000 MJ/t
        const energyInScope = route.fuel_consumption * 41000;

        // Target Intensity (2025)
        const target = 89.3368;

        // Compliance Balance = ( Target − Actual ) × Energy in scope
        // Positive CB → Surplus ; Negative → Deficit
        const cb = (target - route.ghg_intensity) * energyInScope;

        const complianceSnapshot = {
            ship_id: shipId,
            year: year,
            cb_gco2eq: cb,
        };

        await this.complianceRepo.saveSnapshot(complianceSnapshot);
        return complianceSnapshot;
    }

    async computeAdjustedCB(shipId: string, year: number) {
        // Return CB after bank applications
        const snapshot = await this.complianceRepo.getSnapshot(shipId, year);
        if (!snapshot) {
            throw new Error('No compliance snapshot found');
        }

        const banked = await this.bankingRepo.getTotalBanked(shipId);
        return {
            ship_id: shipId,
            year,
            original_cb: snapshot.cb_gco2eq,
            adjusted_cb: snapshot.cb_gco2eq + banked // Assuming banked applied towards deficit
        };
    }
}
