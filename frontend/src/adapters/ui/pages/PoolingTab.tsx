import { useState } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { AdjustedCB, PoolMember } from '../../../core/domain/Models';

interface MemberPreview extends AdjustedCB {
    selected: boolean;
}

interface PoolResult {
    poolId: number;
    members: PoolMember[];
}

export function PoolingTab() {
    const [year, setYear] = useState(2025);
    const [previewInput, setPreviewInput] = useState('');
    const [previews, setPreviews] = useState<MemberPreview[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [poolLoading, setPoolLoading] = useState(false);
    const [poolError, setPoolError] = useState('');
    const [result, setResult] = useState<PoolResult | null>(null);

    /* ── Fetch adjusted CB for each entered ship ── */
    const handlePreview = async () => {
        const ids = previewInput.split(',').map(s => s.trim()).filter(Boolean);
        if (ids.length < 2) { setPreviewError('Enter at least 2 comma-separated Ship IDs.'); return; }
        setPreviewError('');
        setResult(null);
        setPreviewLoading(true);
        try {
            const fetched: AdjustedCB[] = await Promise.all(
                ids.map(id => apiAdapter.getAdjustedCB(id, year))
            );
            setPreviews(fetched.map(item => ({ ...item, selected: true })));
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            setPreviewError(e.response?.data?.error ?? e.message ?? 'Failed to fetch adjusted balances');
            setPreviews([]);
        } finally {
            setPreviewLoading(false);
        }
    };

    const toggleMember = (sid: string) => {
        setPreviews(prev => prev.map(p => p.ship_id === sid ? { ...p, selected: !p.selected } : p));
    };

    /* ── Validation rules ── */
    const selected = previews.filter(p => p.selected);
    const poolSum = selected.reduce((s, p) => s + p.adjusted_cb, 0);
    const isValidSum = poolSum >= 0;
    const deficitWorse = selected.some(p => p.adjusted_cb < 0 && p.original_cb < 0 && p.adjusted_cb < p.original_cb);
    const surplusNeg = selected.some(p => p.original_cb > 0 && p.adjusted_cb < 0);
    const canCreate = selected.length >= 2 && isValidSum && !deficitWorse && !surplusNeg;

    /* ── Create Pool ── */
    const handleCreatePool = async () => {
        const ids = selected.map(p => p.ship_id);
        setPoolError('');
        setResult(null);
        setPoolLoading(true);
        try {
            const res = await apiAdapter.createPool(year, ids);
            setResult(res);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            setPoolError(e.response?.data?.error ?? e.message ?? 'Failed to create pool');
        } finally {
            setPoolLoading(false);
        }
    };

    /* ── Pool net sum ── */
    const poolNetSum = result
        ? result.members.reduce((s, m) => s + m.cb_after, 0)
        : 0;

    const fillPct = Math.min(Math.abs(poolSum) / Math.max(
        ...selected.map(p => Math.abs(p.adjusted_cb)), 1
    ) * 100, 100);

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Article Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.07))',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '14px',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <div style={{
                    width: 44, height: 44,
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
                    </svg>
                </div>
                <div>
                    <div className="section-label" style={{ color: '#a78bfa' }}>Article 21 – Pooling</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Ships may pool compliance balances. Rules: Sum(adjustedCB) ≥ 0 · Deficit ships cannot exit worse · Surplus ships cannot go negative.
                    </div>
                </div>
            </div>

            {/* Input Panel */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <div className="card-title-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
                            </svg>
                        </div>
                        Pool Members Setup
                    </div>
                </div>

                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: '1 1 280px' }}>
                        <label className="form-label">Ship IDs (comma separated)</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="e.g. R001, R002, R003"
                            value={previewInput}
                            onChange={e => setPreviewInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePreview()}
                        />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 105px' }}>
                        <label className="form-label">Year</label>
                        <input
                            className="form-input"
                            type="number"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handlePreview}
                        disabled={previewLoading}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        {previewLoading ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                        Preview Balances
                    </button>
                </div>

                {previewError && <div className="alert alert-error" style={{ margin: '0 2rem 1rem' }}>{previewError}</div>}
            </div>

            {/* Member Preview Table */}
            {previews.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Member Adjusted Compliance Balances</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pool Sum:</span>
                            <span style={{
                                fontFamily: 'JetBrains Mono',
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: isValidSum ? '#34d399' : '#fb7185',
                            }}>
                                {poolSum >= 0 ? '+' : ''}{poolSum.toFixed(4)} gCO₂eq
                            </span>
                            <span className={`badge ${isValidSum ? 'badge-green' : 'badge-red'}`}>
                                {isValidSum ? '✓ Valid' : '✗ Invalid'}
                            </span>
                        </div>
                    </div>

                    {/* Pool Sum Progress Bar */}
                    <div style={{ padding: '0.75rem 2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '60px' }}>Pool Balance</span>
                        <div className="sum-bar" style={{ flex: 1 }}>
                            <div
                                className="sum-bar-fill"
                                style={{
                                    width: `${fillPct}%`,
                                    background: isValidSum
                                        ? 'linear-gradient(90deg, #059669, #10b981)'
                                        : 'linear-gradient(90deg, #be123c, #f43f5e)',
                                }}
                            />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>{fillPct.toFixed(0)}%</span>
                    </div>

                    {/* Validation warnings */}
                    <div style={{ padding: '0.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {!isValidSum && (
                            <div className="alert alert-error">Pool sum is negative ({poolSum.toFixed(4)} gCO₂eq). Adjust member selection until sum ≥ 0.</div>
                        )}
                        {deficitWorse && (
                            <div className="alert alert-error">One or more deficit ships would exit the pool worse off than they entered. This violates Article 21.</div>
                        )}
                        {surplusNeg && (
                            <div className="alert alert-error">One or more surplus ships would exit the pool with a negative balance. This violates Article 21.</div>
                        )}
                    </div>

                    {/* Preview table */}
                    <div style={{ padding: '0.5rem 2rem 1.5rem' }}>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Include</th>
                                        <th>Ship ID</th>
                                        <th>Original CB (gCO₂eq)</th>
                                        <th>Adjusted CB (gCO₂eq)</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previews.map(p => (
                                        <tr key={p.ship_id} style={{ opacity: p.selected ? 1 : 0.4 }}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={p.selected}
                                                    onChange={() => toggleMember(p.ship_id)}
                                                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#06b6d4' }}
                                                />
                                            </td>
                                            <td><span className="badge badge-cyan">{p.ship_id}</span></td>
                                            <td className="td-mono" style={{ color: p.original_cb >= 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                                                {p.original_cb >= 0 ? '+' : ''}{Number(p.original_cb).toFixed(4)}
                                            </td>
                                            <td className="td-mono" style={{ color: p.adjusted_cb >= 0 ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                                                {p.adjusted_cb >= 0 ? '+' : ''}{Number(p.adjusted_cb).toFixed(4)}
                                            </td>
                                            <td>
                                                {p.original_cb >= 0
                                                    ? <span className="badge badge-green">Surplus Provider</span>
                                                    : <span className="badge badge-red">Deficit Receiver</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ padding: '0 2rem 1.5rem' }}>
                        {poolError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{poolError}</div>}
                        <button
                            className="btn btn-violet"
                            onClick={handleCreatePool}
                            disabled={!canCreate || poolLoading}
                            title={!canCreate ? 'Pool constraints not met. Review warnings above.' : ''}
                            style={{ fontSize: '0.875rem', padding: '0.625rem 1.5rem' }}
                        >
                            {poolLoading ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14" /><path d="M5 12h14" />
                                </svg>
                            )}
                            {poolLoading ? 'Creating Pool…' : 'Create Compliance Pool'}
                        </button>
                    </div>
                </div>
            )}

            {/* Pool Result */}
            {result && (
                <div className="card fade-in">
                    <div className="card-header">
                        <div className="card-title">
                            <div className="card-title-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            Pool Created — #{result.poolId}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Net Group Balance:</span>
                            <span style={{
                                fontFamily: 'JetBrains Mono',
                                fontWeight: 700,
                                color: poolNetSum >= 0 ? '#34d399' : '#fb7185',
                            }}>
                                {poolNetSum >= 0 ? '+' : ''}{poolNetSum.toFixed(4)} gCO₂eq
                            </span>
                            <span className={`badge ${poolNetSum >= 0 ? 'badge-green' : 'badge-red'}`}>
                                {poolNetSum >= 0 ? '✅ Compliant Pool' : '❌ Pool Deficit'}
                            </span>
                        </div>
                    </div>

                    <div style={{ padding: '1rem 2rem 2rem' }}>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Ship ID</th>
                                        <th>CB Before Pooling</th>
                                        <th>CB After Pooling</th>
                                        <th>Net Change</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.members.map(m => {
                                        const net = m.cb_after - m.cb_before;
                                        const deficitsWorse = m.cb_before < 0 && m.cb_after < m.cb_before;
                                        const surplusGoneNeg = m.cb_before > 0 && m.cb_after < 0;
                                        const hasViolation = deficitsWorse || surplusGoneNeg;
                                        return (
                                            <tr key={m.ship_id}>
                                                <td><span className="badge badge-cyan">{m.ship_id}</span></td>
                                                <td className="td-mono" style={{ color: m.cb_before >= 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                                                    {m.cb_before >= 0 ? '+' : ''}{m.cb_before.toFixed(4)}
                                                </td>
                                                <td className="td-mono" style={{ color: m.cb_after >= 0 ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                                                    {m.cb_after >= 0 ? '+' : ''}{m.cb_after.toFixed(4)}
                                                </td>
                                                <td className="td-mono" style={{ color: net > 0 ? '#34d399' : net < 0 ? '#fb7185' : 'var(--text-muted)' }}>
                                                    {net > 0 ? '+' : ''}{net.toFixed(4)}
                                                </td>
                                                <td>
                                                    {hasViolation
                                                        ? <span className="badge badge-red">⚠ Violation</span>
                                                        : <span className="badge badge-green">✓ Valid</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {previews.length === 0 && !previewLoading && (
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
                    </svg>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Enter at least 2 comma-separated Ship IDs above and click <strong style={{ color: 'var(--text-secondary)' }}>Preview Balances</strong> to check pool eligibility.
                    </div>
                </div>
            )}
        </div>
    );
}
