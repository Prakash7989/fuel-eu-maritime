import { IRouteRepository } from '../../../core/ports/IRouteRepository';
import { Route } from '../../../core/domain/Route';
import { query } from '../../../infrastructure/db/connection';

export class PostgresRouteRepository implements IRouteRepository {
    async getAll(): Promise<Route[]> {
        const res = await query('SELECT * FROM routes ORDER BY year, route_id');
        return res.rows;
    }

    async getById(id: string): Promise<Route | null> {
        const res = await query('SELECT * FROM routes WHERE route_id = $1', [id]);
        return res.rows.length ? res.rows[0] : null;
    }

    async setBaseline(routeId: string): Promise<void> {
        await query('UPDATE routes SET is_baseline = false');
        await query('UPDATE routes SET is_baseline = true WHERE route_id = $1', [routeId]);
    }

    async getBaseline(): Promise<Route | null> {
        const res = await query('SELECT * FROM routes WHERE is_baseline = true LIMIT 1');
        return res.rows.length ? res.rows[0] : null;
    }
}
