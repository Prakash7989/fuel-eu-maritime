import request from 'supertest';
import express from 'express';
import router from '../adapters/inbound/http/Router';

const app = express();
app.use(express.json());
app.use('/', router);

describe('Integration Tests', () => {

    // These tests hit the real database by default because the repositories in Router.ts are instantiated directly
    // Ideally we'd mock them or use a test DB. For this assignment, we will assume the seed database has what's needed.

    it('GET /routes - fetches all routes', async () => {
        const res = await request(app).get('/routes');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /routes/comparison - compares against baseline', async () => {
        const res = await request(app).get('/routes/comparison');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('compliant');
            expect(res.body[0]).toHaveProperty('percentDiff');
        }
    });

    it('GET /compliance/cb - calculates CB', async () => {
        const res = await request(app).get('/compliance/cb?shipId=R001&year=2024');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('cb_gco2eq');
    });

    it('GET /banking/records - fetches banking records', async () => {
        const res = await request(app).get('/banking/records?shipId=R001&year=2024');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
