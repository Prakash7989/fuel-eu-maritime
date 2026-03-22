import { useState } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { PoolMember } from '../../../core/domain/Models';

export function PoolingTab() {
    const [year, setYear] = useState(2025);
    const [shipIds, setShipIds] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ poolId: number, members: PoolMember[] } | null>(null);

    const handleCreatePool = async () => {
        try {
            setLoading(true);
            setError('');
            setResult(null);
            const ids = shipIds.split(',').map(s => s.trim()).filter(s => s);
            if (ids.length < 2) {
                throw new Error('Please enter at least 2 Ship IDs to create a pool.');
            }

            const res = await apiAdapter.createPool(year, ids);
            setResult(res);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const poolSumResult = result
        ? result.members.reduce((acc, m) => acc + m.cb_after, 0)
        : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Pooling Article 21</h2>
                <p className="text-gray-600 mb-6">Enter comma-separated Ship IDs to simulate and create a compliance pool.</p>

                <div className="flex space-x-4 mb-6 items-end">
                    <div className="flex-1 max-w-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ship IDs (e.g. R001, R002, R003)</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded-md p-2 w-full"
                            value={shipIds}
                            onChange={e => setShipIds(e.target.value)}
                            placeholder="R001, R002"
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
                        onClick={handleCreatePool}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        Create Pool
                    </button>
                </div>

                {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

                {result && (
                    <div className="mt-8 border rounded-lg p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Pool Created: #{result.poolId}</h3>
                            <div className="text-lg">
                                Group Final Balance:
                                <span className={`ml-2 font-bold ${poolSumResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {poolSumResult.toFixed(2)} gCO₂eq
                                </span>
                            </div>
                        </div>

                        <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">Ship ID</th>
                                    <th className="p-3">CB Before Pooling</th>
                                    <th className="p-3">CB After Pooling</th>
                                    <th className="p-3">Net Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.members.map(m => {
                                    const netChange = m.cb_after - m.cb_before;
                                    return (
                                        <tr key={m.ship_id} className="border-b">
                                            <td className="p-3 font-medium">{m.ship_id}</td>
                                            <td className={`p-3 ${m.cb_before < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {m.cb_before.toFixed(2)}
                                            </td>
                                            <td className={`p-3 font-bold flex items-center ${m.cb_after < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {m.cb_after.toFixed(2)}
                                                {m.cb_after < 0 && m.cb_before < 0 && m.cb_after < m.cb_before && (
                                                    <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded text-red-800">Violation! Worse</span>
                                                )}
                                                {m.cb_before > 0 && m.cb_after < 0 && (
                                                    <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded text-red-800">Violation! Negative</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-gray-500">
                                                {netChange > 0 ? '+' : ''}{netChange.toFixed(2)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
