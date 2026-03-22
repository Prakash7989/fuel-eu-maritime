import { useState, useEffect, useCallback } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { Route } from '../../../core/domain/Models';

const VESSEL_TYPES = ['All', 'Container', 'Tanker', 'Bulk Carrier', 'RoRo', 'Passenger'];
const FUEL_TYPES = ['All', 'HFO', 'LNG', 'Methanol', 'Ammonia', 'VLSFO'];

function FilterBar({
    vesselType, setVesselType,
    fuelType, setFuelType,
    year, setYear,
}: {
    vesselType: string; setVesselType: (v: string) => void;
    fuelType: string; setFuelType: (v: string) => void;
    year: string; setYear: (v: string) => void;
}) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ minWidth: '130px' }}>
                <label className="form-label">Vessel Type</label>
                <select className="form-select" value={vesselType} onChange={e => setVesselType(e.target.value)}>
                    {VESSEL_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
            </div>
            <div className="form-group" style={{ minWidth: '120px' }}>
                <label className="form-label">Fuel Type</label>
                <select className="form-select" value={fuelType} onChange={e => setFuelType(e.target.value)}>
                    {FUEL_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
            </div>
            <div className="form-group" style={{ minWidth: '90px' }}>
                <label className="form-label">Year</label>
                <input
                    className="form-input"
                    type="number"
                    placeholder="All"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    style={{ width: '90px' }}
                />
            </div>
        </div>
    );
}

export function RoutesTab() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [vesselType, setVesselType] = useState('All');
    const [fuelType, setFuelType] = useState('All');
    const [year, setYear] = useState('');
    const [settingId, setSettingId] = useState<string | null>(null);

    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiAdapter.getRoutes();
            setRoutes(data);
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

    const handleSetBaseline = async (id: string) => {
        try {
            setSettingId(id);
            setError('');
            await apiAdapter.setBaseline(id);
            setSuccess(`Route ${id} set as baseline ✓`);
            await fetchRoutes();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to set baseline');
        } finally {
            setSettingId(null);
        }
    };

    const filtered = routes.filter(r => {
        const vMatch = vesselType === 'All' || r.vessel_type === vesselType;
        const fMatch = fuelType === 'All' || r.fuel_type === fuelType;
        const yMatch = !year || String(r.year) === year;
        return vMatch && fMatch && yMatch;
    });

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Page KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Total Routes</div>
                    <div className="kpi-value neutral">{routes.length}</div>
                    <div className="kpi-sub">In database</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Baseline Route</div>
                    <div className="kpi-value neutral" style={{ fontSize: '1.2rem' }}>
                        {routes.find(r => r.is_baseline)?.route_id ?? '—'}
                    </div>
                    <div className="kpi-sub">Currently active</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Avg GHG Intensity</div>
                    <div className="kpi-value neutral">
                        {routes.length
                            ? (routes.reduce((s, r) => s + Number(r.ghg_intensity), 0) / routes.length).toFixed(2)
                            : '—'}
                    </div>
                    <div className="kpi-sub">gCO₂e/MJ fleet avg</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Showing</div>
                    <div className="kpi-value neutral">{filtered.length}</div>
                    <div className="kpi-sub">After filters</div>
                </div>
            </div>

            {/* Table Card */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <div className="card-title-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3h18l-2 13H5L3 3z" />
                            </svg>
                        </div>
                        Route Registry
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <FilterBar
                            vesselType={vesselType} setVesselType={setVesselType}
                            fuelType={fuelType} setFuelType={setFuelType}
                            year={year} setYear={setYear}
                        />
                        <button
                            className="btn btn-outline"
                            onClick={fetchRoutes}
                            disabled={loading}
                            style={{ alignSelf: 'flex-end' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin' : ''}>
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div className="alert alert-error" style={{ margin: '1rem 2rem' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ margin: '1rem 2rem' }}>{success}</div>}

                {/* Table */}
                <div style={{ padding: '1rem 2rem 2rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '44px', borderRadius: '8px' }} />
                            ))}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Route ID</th>
                                        <th>Vessel Type</th>
                                        <th>Fuel Type</th>
                                        <th>Year</th>
                                        <th>GHG Intensity (gCO₂e/MJ)</th>
                                        <th>Consumption (t)</th>
                                        <th>Distance (km)</th>
                                        <th>Total Emissions (t)</th>
                                        <th>Baseline</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                No routes match the selected filters.
                                            </td>
                                        </tr>
                                    ) : filtered.map(r => (
                                        <tr key={r.id}>
                                            <td><span className="badge badge-cyan">{r.route_id}</span></td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{r.vessel_type}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{r.fuel_type}</td>
                                            <td className="td-mono">{r.year}</td>
                                            <td className="td-mono" style={{ color: Number(r.ghg_intensity) <= 89.34 ? 'var(--emerald-500)' : 'var(--rose-500)', fontWeight: 600 }}>
                                                {Number(r.ghg_intensity).toFixed(4)}
                                            </td>
                                            <td className="td-mono">{Number(r.fuel_consumption).toFixed(2)}</td>
                                            <td className="td-mono">{Number(r.distance).toFixed(0)}</td>
                                            <td className="td-mono">{Number(r.total_emissions).toFixed(2)}</td>
                                            <td>
                                                {r.is_baseline
                                                    ? <span className="badge badge-green">✓ Baseline</span>
                                                    : <span className="badge badge-amber">—</span>}
                                            </td>
                                            <td>
                                                {!r.is_baseline && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleSetBaseline(r.route_id)}
                                                        disabled={settingId === r.route_id}
                                                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                                    >
                                                        {settingId === r.route_id ? 'Setting…' : 'Set Baseline'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
