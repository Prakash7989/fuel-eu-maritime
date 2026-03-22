import { useEffect, useState } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { Route } from '../../../core/domain/Models';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function CompareTab() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparison();
    }, []);

    const fetchComparison = async () => {
        try {
            setLoading(true);
            const data = await apiAdapter.getComparison();
            setRoutes(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    const targetIntensity = 89.3368;
    const chartData = routes.map(r => ({
        name: r.route_id,
        'GHG Intensity': Number(r.ghg_intensity),
    }));

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Comparison vs Baseline</h2>
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Route ID</th>
                                <th className="p-3">Year</th>
                                <th className="p-3">GHG Intensity</th>
                                <th className="p-3">% Diff (vs Baseline)</th>
                                <th className="p-3">Compliant (Target: 89.34)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map(r => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{r.route_id} {r.is_baseline && '(Baseline)'}</td>
                                    <td className="p-3">{r.year}</td>
                                    <td className="p-3 font-semibold">{r.ghg_intensity}</td>
                                    <td className="p-3">
                                        {r.percentDiff !== undefined && r.percentDiff !== null
                                            ? `${r.percentDiff > 0 ? '+' : ''}${r.percentDiff.toFixed(2)}%`
                                            : '-'}
                                    </td>
                                    <td className="p-3">
                                        {r.compliant ? '✅ Compliant' : '❌ Non-Compliant'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="h-96 w-full mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-center">GHG Intensity Comparison</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine y={targetIntensity} label="Target Limit" stroke="red" strokeDasharray="3 3" />
                            <Bar dataKey="GHG Intensity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
