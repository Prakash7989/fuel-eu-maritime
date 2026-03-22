import { Router } from 'express';
import { RouteService } from '../../../core/application/RouteService';
import { ComplianceService } from '../../../core/application/ComplianceService';
import { BankingService } from '../../../core/application/BankingService';
import { PoolingService } from '../../../core/application/PoolingService';

import { PostgresRouteRepository } from '../../outbound/postgres/RouteRepository';
import { PostgresComplianceRepository } from '../../outbound/postgres/ComplianceRepository';

const router = Router();

// Repositories
const routeRepo = new PostgresRouteRepository();
const complianceRepo = new PostgresComplianceRepository();

// Use Cases / Services
const routeService = new RouteService(routeRepo);
const complianceService = new ComplianceService(complianceRepo, routeRepo, complianceRepo);
const bankingService = new BankingService(complianceRepo, complianceRepo);
const poolingService = new PoolingService(complianceRepo, complianceRepo);

// --- Routes ---

router.get('/routes', async (req, res, next) => {
    try {
        const data = await routeService.getRoutes();
        res.json(data);
    } catch (err) { next(err); }
});

router.post('/routes/:id/baseline', async (req, res, next) => {
    try {
        await routeService.setBaseline(req.params.id);
        res.json({ message: 'Baseline set successfully' });
    } catch (err) { next(err); }
});

router.get('/routes/comparison', async (req, res, next) => {
    try {
        const data = await routeService.getComparison();
        res.json(data);
    } catch (err) { next(err); }
});

// --- Compliance ---

router.get('/compliance/cb', async (req, res, next) => {
    try {
        const shipId = req.query.shipId as string;
        const year = parseInt(req.query.year as string, 10);
        if (!shipId || !year) return res.status(400).json({ error: 'Missing shipId or year' });

        const data = await complianceService.computeCB(shipId, year);
        res.json(data);
    } catch (err) { next(err); }
});

router.get('/compliance/adjusted-cb', async (req, res, next) => {
    try {
        const shipId = req.query.shipId as string;
        const year = parseInt(req.query.year as string, 10);
        if (!shipId || !year) return res.status(400).json({ error: 'Missing shipId or year' });

        const data = await complianceService.computeAdjustedCB(shipId, year);
        res.json(data);
    } catch (err) { next(err); }
});

// --- Banking ---

router.get('/banking/records', async (req, res, next) => {
    try {
        const shipId = req.query.shipId as string;
        const year = parseInt(req.query.year as string, 10);
        if (!shipId || !year) return res.status(400).json({ error: 'Missing shipId or year' });

        const data = await complianceRepo.getBankEntries(shipId, year);
        res.json(data);
    } catch (err) { next(err); }
});

router.post('/banking/bank', async (req, res, next) => {
    try {
        const { shipId, year, amount } = req.body;
        await bankingService.bankPositiveCB(shipId, year, amount);
        res.json({ message: 'Successfully banked CB' });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.post('/banking/apply', async (req, res, next) => {
    try {
        const { shipId, year, amount } = req.body;
        await bankingService.applyBankedCB(shipId, year, amount);
        res.json({ message: 'Successfully applied banked CB' });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
});

// --- Pooling ---

router.post('/pools', async (req, res, next) => {
    try {
        const { year, shipIds } = req.body;
        if (!year || !Array.isArray(shipIds)) return res.status(400).json({ error: 'Invalid payload' });

        const data = await poolingService.createPool(year, shipIds);
        res.json(data);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
});

export default router;
