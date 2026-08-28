import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuickNav from '../../components/QuickNav';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderQuickNav(merchantId) {
  return render(
    <MemoryRouter>
      <QuickNav merchantId={merchantId} />
    </MemoryRouter>
  );
}

describe('QuickNav', () => {
  it('renders the "Quick Access" section title', () => {
    renderQuickNav();
    expect(screen.getByText('Quick Access')).toBeInTheDocument();
  });

  it('renders all 4 navigation items', () => {
    renderQuickNav();
    const labels = ['Vouchers', 'News', 'History', 'Outlets'];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('navigates to /vouchers when Vouchers is clicked', () => {
    renderQuickNav();
    fireEvent.click(screen.getByText('Vouchers').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/vouchers');
  });

  it('navigates to /news when News is clicked', () => {
    renderQuickNav();
    fireEvent.click(screen.getByText('News').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/news');
  });

  it('navigates to /outlets when Outlets is clicked', () => {
    renderQuickNav();
    fireEvent.click(screen.getByText('Outlets').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/outlets');
  });

  it('appends merchant query param when merchantId is provided', () => {
    renderQuickNav('bi-mart');
    fireEvent.click(screen.getByText('Vouchers').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/vouchers?m=bi-mart');
  });
});
