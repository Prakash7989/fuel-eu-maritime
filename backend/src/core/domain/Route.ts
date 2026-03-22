export interface Route {
    id?: number;
    route_id: string;
    vessel_type: string;
    fuel_type: string;
    year: number;
    ghg_intensity: number;
    fuel_consumption: number;
    distance: number;
    total_emissions: number;
    is_baseline: boolean;
}
