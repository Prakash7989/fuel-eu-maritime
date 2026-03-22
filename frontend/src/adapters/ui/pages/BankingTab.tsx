import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { ShipCompliance, BankEntry } from '../../../core/domain/Models';

export function BankingTab() {
    const [shipId, setShipId] = useState('');
    const [year, setYear] = useState(2025);
    const [amount, setAmount] = useState('');
    const [cbData, setCbData] = useState<ShipCompliance | null>(null);
    const [bankRecords, setBankRecords] = useState<BankEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCB = async () => {
        if (!shipId || !year) return;
        try {
            setLoading(true);
            setError('');
            const cb = await apiAdapter.getCB(shipId, year);
            setCbData(cb);
            const records = await apiAdapter.getBankRecords(shipId, year);
            setBankRecords(records);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
            setCbData(null);
            setBankRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'bank' | 'apply', e: FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return;
        try {
            setLoading(true);
            setError('');
            if (action === 'bank') {
                await apiAdapter.bankCB(shipId, year, Number(amount));
            } else {
                await apiAdapter.applyCB(shipId, year, Number(amount));
            }
            setAmount('');
            await fetchCB(); // refresh
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Banking Article 20</h2>

                <div className="flex space-x-4 mb-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ship ID (Route ID)</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded-md p-2 w-48"
                            value={shipId}
                            onChange={e => setShipId(e.target.value)}
                            placeholder="e.g. R001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                            type="number"
                            className="border border-gray-300 rounded-md p-2 w-32"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                        />
                    </div>
                    <button
                        onClick={fetchCB}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Check Balance
                    </button>
                </div>

                {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

                {cbData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border rounded-lg p-5 bg-gray-50">
                            <h3 className="text-lg font-semibold mb-2">Current Status</h3>
                            <p className="mb-1"><span className="text-gray-600">Ship:</span> {cbData.ship_id}</p>
                            <p className="mb-1"><span className="text-gray-600">Year:</span> {cbData.year}</p>
                            <p className="text-xl mt-4 font-bold">
                                Compliance Balance:
                                <span className={cbData.cb_gco2eq >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {' '}{cbData.cb_gco2eq.toFixed(2)} gCO₂eq
                                </span>
                                {cbData.cb_gco2eq >= 0 ? ' (Surplus)' : ' (Deficit)'}
                            </p>
                        </div>

                        <div className="border rounded-lg p-5">
                            <h3 className="text-lg font-semibold mb-4">Actions</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Bank/Apply</label>
                                    <input
                                        type="number"
                                        required
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={e => handleAction('bank', e)}
                                        disabled={cbData.cb_gco2eq <= 0 || loading}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Bank Surplus
                                    </button>
                                    <button
                                        onClick={e => handleAction('apply', e)}
                                        disabled={loading}
                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Apply Banked
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {bankRecords.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Recent Banking Transactions</h3>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Year</th>
                                    <th className="p-3">Amount (gCO₂eq)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankRecords.map(r => (
                                    <tr key={r.id} className="border-b">
                                        <td className="p-3">{r.id}</td>
                                        <td className="p-3">{r.year}</td>
                                        <td className="p-3 font-mono">{r.amount_gco2eq > 0 ? '+' : ''}{r.amount_gco2eq}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
