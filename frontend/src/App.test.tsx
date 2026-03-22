import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from './adapters/ui/App';

// Mock the icons that might cause issues in some environments or just to be safe
vi.mock('lucide-react', () => ({
    Anchor: () => <div data-testid="anchor-icon" />,
    BarChart3: () => <div data-testid="bar-chart-icon" />,
    History: () => <div data-testid="history-icon" />,
    Layers: () => <div data-testid="layers-icon" />,
    Menu: () => <div data-testid="menu-icon" />,
    X: () => <div data-testid="x-icon" />,
}));

describe('App Shell', () => {
    it('renders the FuelEU Maritime brand name', () => {
        render(<App />);
        expect(screen.getByText(/FuelEU Maritime/i)).toBeInTheDocument();
    });

    it('renders all four main navigation tabs', () => {
        render(<App />);
        expect(screen.getByRole('link', { name: /Routes/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Compare/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Banking/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Pooling/i })).toBeInTheDocument();
    });
});
