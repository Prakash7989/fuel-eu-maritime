import { Route } from '../domain/Route';

export interface IRouteRepository {
    getAll(): Promise<Route[]>;
    getById(id: string): Promise<Route | null>;
    setBaseline(id: string): Promise<void>;
    getBaseline(): Promise<Route | null>;
}
