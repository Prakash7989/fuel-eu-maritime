import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { RoutesTab } from './pages/RoutesTab';
import { CompareTab } from './pages/CompareTab';
import { BankingTab } from './pages/BankingTab';
import { PoolingTab } from './pages/PoolingTab';
import './index.css';

export function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { to: "/", label: "Routes", icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18l-2 13H5L3 3z" /><path d="M8 21h8" /><path d="M12 17v4" />
            </svg>
        )},
        { to: "/compare", label: "Compare", icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
        )},
        { to: "/banking", label: "Banking", icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )},
        { to: "/pooling", label: "Pooling", icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
            </svg>
        )}
    ];

    return (
        <Router>
            <div className="app-bg" style={{ minHeight: '100vh' }}>
                {/* ── Header ── */}
                <header className="header">
                    <div className="header-inner">
                        <div className="logo">
                            <div className="logo-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2M2 20l8-16 4 8 2-4 4 12" />
                                    <path d="M6 20l1-5" />
                                    <path d="M18 20l-1-5" />
                                </svg>
                            </div>
                            <div>
                                <div className="logo-title">FuelEU Maritime</div>
                            </div>
                            <span className="logo-badge">EU 2025</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="tab-nav desktop-only" role="navigation" aria-label="Main navigation">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.to === "/"}
                                    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                                >
                                    {link.icon}
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation Overlay */}
                    {isMenuOpen && (
                        <div className="mobile-menu-overlay">
                            <nav className="mobile-nav">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.to === "/"}
                                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                                        onClick={closeMenu}
                                    >
                                        <span className="mobile-nav-icon">{link.icon}</span>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    )}
                </header>

                {/* ── Page Content ── */}
                <main className="main-content">
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
