import { IRouteRepository } from '../ports/IRouteRepository';

export class RouteService {
    constructor(private routeRepo: IRouteRepository) { }

    async getRoutes() {
        return this.routeRepo.getAll();
    }

    async setBaseline(routeId: string) {
        await this.routeRepo.setBaseline(routeId);
    }

    async getComparison() {
        const routes = await this.routeRepo.getAll();
        const baseline = await this.routeRepo.getBaseline();
        const target = 89.3368;

        return routes.map(r => {
            const compliant = r.ghg_intensity <= target;
            let percentDiff = null;
            if (baseline) {
                percentDiff = ((r.ghg_intensity / baseline.ghg_intensity) - 1) * 100;
            }
            return {
                ...r,
                compliant,
                percentDiff
            };
        });
    }
}
