import axios from 'axios';
import type { IApiAdapter } from '../../core/ports/IApiAdapter';
import type { Route, ShipCompliance, AdjustedCB, BankEntry, PoolMember } from '../../core/domain/Models';

export class AxiosApiAdapter implements IApiAdapter {
    private api = axios.create({
        baseURL: 'http://localhost:3000/api'
    });

    async getRoutes(): Promise<Route[]> {
        const res = await this.api.get('/routes');
        return res.data;
    }
    async setBaseline(id: string): Promise<void> {
        await this.api.post(`/routes/${id}/baseline`);
    }
    async getComparison(): Promise<Route[]> {
        const res = await this.api.get('/routes/comparison');
        return res.data;
    }

    async getCB(shipId: string, year: number): Promise<ShipCompliance> {
        const res = await this.api.get(`/compliance/cb?shipId=${shipId}&year=${year}`);
        return res.data;
    }
    async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
        const res = await this.api.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
        return res.data;
    }

    async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
        const res = await this.api.get(`/banking/records?shipId=${shipId}&year=${year}`);
        return res.data;
    }
    async bankCB(shipId: string, year: number, amount: number): Promise<void> {
        await this.api.post('/banking/bank', { shipId, year, amount });
    }
    async applyCB(shipId: string, year: number, amount: number): Promise<void> {
        await this.api.post('/banking/apply', { shipId, year, amount });
    }

    async createPool(year: number, shipIds: string[]): Promise<{ poolId: number, members: PoolMember[] }> {
        const res = await this.api.post('/pools', { year, shipIds });
        return res.data;
    }
}

export const apiAdapter = new AxiosApiAdapter();
