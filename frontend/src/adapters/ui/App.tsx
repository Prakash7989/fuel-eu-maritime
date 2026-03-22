import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { RoutesTab } from './pages/RoutesTab.tsx';
import { CompareTab } from './pages/CompareTab.tsx';
import { BankingTab } from './pages/BankingTab.tsx';
import { PoolingTab } from './pages/PoolingTab.tsx';
import { Ship } from 'lucide-react';
import './index.css';

export function App() {
    // rescan
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <header className="bg-blue-900 text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Ship className="h-6 w-6 text-blue-300" />
                            <h1 className="text-xl font-bold">FuelEU Maritime Dashboard</h1>
                        </div>
                        <nav className="flex space-x-6">
                            <Link to="/" className="hover:text-blue-300 transition-colors">Routes</Link>
                            <Link to="/compare" className="hover:text-blue-300 transition-colors">Compare</Link>
                            <Link to="/banking" className="hover:text-blue-300 transition-colors">Banking</Link>
                            <Link to="/pooling" className="hover:text-blue-300 transition-colors">Pooling</Link>
                        </nav>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<RoutesTab />} />
                        <Route path="/compare" element={<CompareTab />} />
                        <Route path="/banking" element={<BankingTab />} />
                        <Route path="/pooling" element={<PoolingTab />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
