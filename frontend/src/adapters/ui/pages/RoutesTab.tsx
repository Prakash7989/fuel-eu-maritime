import { useEffect, useState } from 'react';
import { apiAdapter } from '../../infrastructure/AxiosApiAdapter';
import type { Route } from '../../../core/domain/Models';

export function RoutesTab() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await apiAdapter.getRoutes();
            setRoutes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleSetBaseline = async (id: string) => {
        try {
            await apiAdapter.setBaseline(id);
            await fetchRoutes();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">All Routes</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">Route ID</th>
                            <th className="p-3">Vessel Type</th>
                            <th className="p-3">Fuel Type</th>
                            <th className="p-3">Year</th>
                            <th className="p-3">GHG Intensity</th>
                            <th className="p-3">Consumption (t)</th>
                            <th className="p-3">Distance (km)</th>
                            <th className="p-3">Emissions (t)</th>
                            <th className="p-3">Baseline</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map(r => (
                            <tr key={r.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{r.route_id}</td>
                                <td className="p-3">{r.vessel_type}</td>
                                <td className="p-3">{r.fuel_type}</td>
                                <td className="p-3">{r.year}</td>
                                <td className="p-3 font-semibold">{r.ghg_intensity}</td>
                                <td className="p-3">{r.fuel_consumption}</td>
                                <td className="p-3">{r.distance}</td>
                                <td className="p-3">{r.total_emissions}</td>
                                <td className="p-3">
                                    {r.is_baseline ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Yes</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">No</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {!r.is_baseline && (
                                        <button
                                            onClick={() => handleSetBaseline(r.route_id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                                        >
                                            Set Baseline
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
