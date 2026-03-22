import { useState, useEffect } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { Route } from '../../../core/domain/Models';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell, Legend, LineChart, Line,
} from 'recharts';

const TARGET = 89.3368; // 2% below 91.16

/* ── Custom chart tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value;
    const compliant = val !== undefined && val <= TARGET;
    return (
        <div style={{
            background: 'rgba(10,25,40,0.95)', border: '1px solid rgba(34,211,238,0.3)',
            borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem',
        }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{payload[0]?.name}</div>
            <div style={{ color: compliant ? '#34d399' : '#fb7185', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                {val !== undefined ? val.toFixed(4) : '—'} gCO₂e/MJ
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.7rem' }}>
                {compliant ? '✅ Compliant' : '❌ Non-Compliant'}
            </div>
        </div>
    );
};

export function CompareTab() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chart, setChart] = useState<'bar' | 'line'>('bar');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await apiAdapter.getComparison();
                setRoutes(data);
            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to fetch comparison data');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const baseline = routes.find(r => r.is_baseline);
    const comparisons = routes.filter(r => !r.is_baseline);

    /* % diff relative to baseline */
    const withDiff = routes.map(r => {
        if (r.is_baseline || !baseline) return { ...r, percentDiff: r.percentDiff ?? null };
        const computed = ((Number(r.ghg_intensity) / Number(baseline.ghg_intensity)) - 1) * 100;
        return { ...r, percentDiff: r.percentDiff !== undefined ? r.percentDiff : computed };
    });

    const chartData = withDiff.map(r => ({
        name: `${r.route_id}${r.is_baseline ? ' ★' : ''}`,
        ghg: Number(r.ghg_intensity),
        compliant: Number(r.ghg_intensity) <= TARGET,
    }));

    /* Summary KPIs */
    const compliantCount = withDiff.filter(r => Number(r.ghg_intensity) <= TARGET).length;
    const nonCompliantCount = withDiff.length - compliantCount;

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '12px' }} />)}
        </div>
    );

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">EU Target</div>
                    <div className="kpi-value neutral" style={{ fontSize: '1.4rem' }}>89.34</div>
                    <div className="kpi-sub">gCO₂e/MJ (2% below 91.16)</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Baseline GHG</div>
                    <div className="kpi-value neutral" style={{ fontSize: '1.4rem' }}>
                        {baseline ? Number(baseline.ghg_intensity).toFixed(4) : '—'}
                    </div>
                    <div className="kpi-sub">{baseline?.route_id ?? 'Not set'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Compliant</div>
                    <div className="kpi-value positive">{compliantCount}</div>
                    <div className="kpi-sub">of {withDiff.length} routes</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Non-Compliant</div>
                    <div className="kpi-value negative">{nonCompliantCount}</div>
                    <div className="kpi-sub">Exceed 89.34 target</div>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Comparison Table */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <div className="card-title-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                            </svg>
                        </div>
                        Route Comparison
                    </div>
                    <span className="badge badge-cyan">Target: {TARGET} gCO₂e/MJ</span>
                </div>

                <div style={{ padding: '1rem 2rem 2rem' }}>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Route ID</th>
                                    <th>Year</th>
                                    <th>GHG Intensity</th>
                                    <th>vs Baseline</th>
                                    <th>vs Target</th>
                                    <th>Compliance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withDiff.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No comparison data. Set a baseline route first.
                                        </td>
                                    </tr>
                                ) : withDiff.map(r => {
                                    const ghg = Number(r.ghg_intensity);
                                    const isCompliant = ghg <= TARGET;
                                    const vsTarget = ((ghg / TARGET) - 1) * 100;
                                    return (
                                        <tr key={r.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="badge badge-cyan">{r.route_id}</span>
                                                    {r.is_baseline && <span className="badge badge-amber">Baseline</span>}
                                                </div>
                                            </td>
                                            <td className="td-mono">{r.year}</td>
                                            <td className="td-mono" style={{ color: isCompliant ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                                                {ghg.toFixed(4)}
                                            </td>
                                            <td className="td-mono" style={{ color: r.is_baseline ? 'var(--text-muted)' : r.percentDiff! < 0 ? '#34d399' : '#fb7185' }}>
                                                {r.is_baseline
                                                    ? <span className="badge badge-amber">—</span>
                                                    : r.percentDiff !== null
                                                        ? `${r.percentDiff! > 0 ? '+' : ''}${r.percentDiff!.toFixed(2)}%`
                                                        : '—'}
                                            </td>
                                            <td className="td-mono" style={{ color: isCompliant ? '#34d399' : '#fb7185' }}>
                                                {vsTarget > 0 ? '+' : ''}{vsTarget.toFixed(2)}%
                                            </td>
                                            <td>
                                                {isCompliant
                                                    ? <span className="badge badge-green">✅ Compliant</span>
                                                    : <span className="badge badge-red">❌ Non-Compliant</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {comparisons.length > 0 || baseline ? (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <div className="card-title-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18" />
                                    <path d="M7 16l4-8 4 4 4-4" />
                                </svg>
                            </div>
                            GHG Intensity Visualization
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className={`btn ${chart === 'bar' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setChart('bar')} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Bar</button>
                            <button className={`btn ${chart === 'line' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setChart('line')} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Line</button>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem 2rem 2rem' }}>
                        <ResponsiveContainer width="100%" height={320}>
                            {chart === 'bar' ? (
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(34,211,238,0.1)' }} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(34,211,238,0.1)' }} tickFormatter={(v: number) => v.toFixed(0)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                                    <ReferenceLine y={TARGET} stroke="#f43f5e" strokeDasharray="6 3" label={{ value: `Target ${TARGET}`, fill: '#fb7185', fontSize: 11 }} />
                                    <Bar dataKey="ghg" name="GHG Intensity" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.compliant ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(34,211,238,0.1)' }} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(34,211,238,0.1)' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                                    <ReferenceLine y={TARGET} stroke="#f43f5e" strokeDasharray="6 3" label={{ value: `Target ${TARGET}`, fill: '#fb7185', fontSize: 11 }} />
                                    <Line type="monotone" dataKey="ghg" name="GHG Intensity" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 5 }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>

                        {/* Legend callout */}
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }} />
                                Compliant (≤ {TARGET})
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f43f5e' }} />
                                Non-Compliant
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: 20, height: 2, background: '#f43f5e', borderRadius: 1, borderTop: '2px dashed #f43f5e' }} />
                                EU Target Line
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
