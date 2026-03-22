import { useState, useCallback } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { ShipCompliance, BankEntry } from '../../../core/domain/Models';

type Action = 'bank' | 'apply';

export function BankingTab() {
    const [shipId, setShipId] = useState('');
    const [year, setYear] = useState(2025);
    const [amount, setAmount] = useState('');
    const [cbData, setCbData] = useState<ShipCompliance | null>(null);
    const [bankRecords, setBankRecords] = useState<BankEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<Action | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMsg = () => { setError(''); setSuccess(''); };

    const fetchCB = useCallback(async () => {
        if (!shipId.trim() || !year) {
            setError('Please enter a Ship ID and year.');
            return;
        }
        try {
            clearMsg();
            setLoading(true);
            const [cb, records] = await Promise.all([
                apiAdapter.getCB(shipId.trim(), year),
                apiAdapter.getBankRecords(shipId.trim(), year),
            ]);
            setCbData(cb);
            setBankRecords(records);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            setError(e.response?.data?.error ?? e.message ?? 'Failed to fetch compliance data');
            setCbData(null);
            setBankRecords([]);
        } finally {
            setLoading(false);
        }
    }, [shipId, year]);

    const handleAction = async (action: Action) => {
        const num = Number(amount);
        if (!amount || isNaN(num) || num <= 0) { setError('Enter a valid positive amount.'); return; }
        try {
            clearMsg();
            setActionLoading(action);
            if (action === 'bank') {
                await apiAdapter.bankCB(shipId.trim(), year, num);
                setSuccess(`Successfully banked ${num.toFixed(2)} gCO₂eq ✓`);
            } else {
                await apiAdapter.applyCB(shipId.trim(), year, num);
                setSuccess(`Successfully applied ${num.toFixed(2)} gCO₂eq banked surplus ✓`);
            }
            setAmount('');
            await fetchCB();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            setError(e.response?.data?.error ?? e.message ?? 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const cb = cbData?.cb_gco2eq ?? 0;
    const isSurplus = cb > 0;
    const isDeficit = cb < 0;

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Article Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '14px',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <div style={{
                    width: 44, height: 44,
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div>
                    <div className="section-label">Article 20 – Banking</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Ships with a positive Compliance Balance may bank surplus to the next reporting year, or apply previously banked surplus to offset a current deficit.
                    </div>
                </div>
            </div>

            {/* Query panel */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <div className="card-title-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                        Compliance Balance Lookup
                    </div>
                </div>

                <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: '1 1 160px' }}>
                        <label className="form-label">Ship / Route ID</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="e.g. R001"
                            value={shipId}
                            onChange={e => setShipId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchCB()}
                        />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 110px' }}>
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
                        onClick={fetchCB}
                        disabled={loading}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        {loading ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        )}
                        {loading ? 'Fetching…' : 'Check Balance'}
                    </button>
                </div>

                {/* Alerts */}
                {error && <div className="alert alert-error" style={{ margin: '0 2rem 1rem' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ margin: '0 2rem 1rem' }}>{success}</div>}
            </div>

            {/* Results section */}
            {cbData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {/* CB Status */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Compliance Status</div>
                        </div>
                        <div className="card-body">
                            <div className="kpi-card" style={{ marginBottom: '1.25rem' }}>
                                <div className="kpi-label">Compliance Balance</div>
                                <div className={`kpi-value ${isSurplus ? 'positive' : isDeficit ? 'negative' : 'neutral'}`}>
                                    {cb >= 0 ? '+' : ''}{cb.toFixed(4)}
                                </div>
                                <div className="kpi-sub">gCO₂eq — {isSurplus ? '🟢 Surplus' : isDeficit ? '🔴 Deficit' : '⚪ Neutral'}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Ship ID</span>
                                    <span className="badge badge-cyan">{cbData.ship_id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Year</span>
                                    <span style={{ fontFamily: 'JetBrains Mono' }}>{cbData.year}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                                    {isSurplus
                                        ? <span className="badge badge-green">Banking Eligible</span>
                                        : isDeficit
                                            ? <span className="badge badge-red">Deficit — Apply Banked</span>
                                            : <span className="badge badge-amber">Neutral</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Banking Actions</div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!isSurplus && (
                                <div className="alert alert-info">
                                    CB must be &gt; 0 to bank surplus. Current: {cb.toFixed(4)} gCO₂eq
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Amount (gCO₂eq)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="0.0001"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="Enter amount to bank or apply"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-success"
                                    style={{ flex: 1 }}
                                    disabled={!isSurplus || actionLoading !== null}
                                    onClick={() => handleAction('bank')}
                                    title={!isSurplus ? 'CB must be positive to bank' : ''}
                                >
                                    {actionLoading === 'bank' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                                        </svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                                        </svg>
                                    )}
                                    Bank Surplus
                                </button>
                                <button
                                    className="btn btn-violet"
                                    style={{ flex: 1 }}
                                    disabled={actionLoading !== null}
                                    onClick={() => handleAction('apply')}
                                >
                                    {actionLoading === 'apply' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                                        </svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 14 4-4-4-4" /><path d="M5 18a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
                                        </svg>
                                    )}
                                    Apply Banked
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Banking History */}
            {bankRecords.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Banking History</div>
                        <span className="badge badge-cyan">{bankRecords.length} records</span>
                    </div>
                    <div style={{ padding: '1rem 2rem 2rem' }}>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Ship ID</th>
                                        <th>Year</th>
                                        <th>Amount (gCO₂eq)</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bankRecords.map(r => (
                                        <tr key={r.id}>
                                            <td className="td-mono" style={{ color: 'var(--text-muted)' }}>{r.id}</td>
                                            <td><span className="badge badge-cyan">{r.ship_id}</span></td>
                                            <td className="td-mono">{r.year}</td>
                                            <td className="td-mono" style={{ color: r.amount_gco2eq > 0 ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                                                {r.amount_gco2eq > 0 ? '+' : ''}{Number(r.amount_gco2eq).toFixed(4)}
                                            </td>
                                            <td>
                                                {r.amount_gco2eq > 0
                                                    ? <span className="badge badge-green">Banked</span>
                                                    : <span className="badge badge-red">Applied</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!cbData && !loading && (
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter a Ship ID and year above to view Compliance Balance and perform banking operations.</div>
                </div>
            )}
        </div>
    );
}
