import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MembershipCard from '../../components/MembershipCard';

const baseMember = {
  name: 'Ahmad bin Razali',
  points: 12450,
  pointsExpiry: '2026-12-31',
};

describe('MembershipCard', () => {
  it('renders the brand / merchant name', () => {
    render(<MembershipCard member={baseMember} merchantName="KevW Kopitam" onShowQR={() => {}} onOutlets={() => {}} />);
    expect(screen.getByText('KevW Kopitam')).toBeInTheDocument();
  });

  it('falls back to "KevW Kopitam" when merchantName is not supplied', () => {
    render(<MembershipCard member={baseMember} onShowQR={() => {}} onOutlets={() => {}} />);
    expect(screen.getByText('KevW Kopitam')).toBeInTheDocument();
  });

  it('renders formatted points', () => {
    render(<MembershipCard member={baseMember} merchantName="KevW Kopitam" onShowQR={() => {}} onOutlets={() => {}} />);
    expect(screen.getByText('12,450')).toBeInTheDocument();
  });

  it('handles 0 points gracefully', () => {
    render(<MembershipCard member={{ ...baseMember, points: 0 }} onShowQR={() => {}} onOutlets={() => {}} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows expiry date when pointsExpiry is provided', () => {
    render(<MembershipCard member={baseMember} merchantName="KevW Kopitam" onShowQR={() => {}} onOutlets={() => {}} />);
    // The expiry label should be present somewhere in the card
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  it('does NOT show expiry when pointsExpiry is null', () => {
    render(<MembershipCard member={{ ...baseMember, pointsExpiry: null }} onShowQR={() => {}} onOutlets={() => {}} />);
    expect(screen.queryByText(/expires/i)).not.toBeInTheDocument();
  });

  it('calls onShowQR when QR button is clicked', () => {
    const onShowQR = vi.fn();
    render(<MembershipCard member={baseMember} merchantName="KevW Kopitam" onShowQR={onShowQR} onOutlets={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /qr/i }));
    expect(onShowQR).toHaveBeenCalledOnce();
  });

  it('calls onOutlets when Outlets button is clicked', () => {
    const onOutlets = vi.fn();
    render(<MembershipCard member={baseMember} merchantName="KevW Kopitam" onShowQR={() => {}} onOutlets={onOutlets} />);
    fireEvent.click(screen.getByRole('button', { name: /outlet/i }));
    expect(onOutlets).toHaveBeenCalledOnce();
  });
});
