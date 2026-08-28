import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QRModal from '../../components/QRModal';

const member = {
  name: 'Sarun Phongphaew',
  memberNumber: '0001234567890',
  tier: 'Gold',
};

describe('QRModal', () => {
  it('renders member name', () => {
    render(<QRModal member={member} onClose={() => {}} />);
    expect(screen.getByText('Sarun Phongphaew')).toBeInTheDocument();
  });

  it('renders the tier badge', () => {
    render(<QRModal member={member} onClose={() => {}} />);
    expect(screen.getByText('Gold')).toBeInTheDocument();
  });

  it('renders the member number', () => {
    render(<QRModal member={member} onClose={() => {}} />);
    expect(screen.getByText('0001234567890')).toBeInTheDocument();
  });

  it('renders a QR code with correct member number value', () => {
    render(<QRModal member={member} onClose={() => {}} />);
    const qr = screen.getByTestId('qr-code');
    expect(qr).toBeInTheDocument();
    expect(qr).toHaveAttribute('data-value', '0001234567890');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<QRModal member={member} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when clicking the overlay backdrop', () => {
    const onClose = vi.fn();
    render(<QRModal member={member} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<QRModal member={member} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does NOT call onClose when clicking the modal card itself', () => {
    const onClose = vi.fn();
    render(<QRModal member={member} onClose={onClose} />);
    // The .qr-sheet div stops propagation, so clicking inside should not close
    fireEvent.click(screen.getByText('Sarun Phongphaew').closest('.qr-sheet'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses fallback QR value when memberNumber is missing', () => {
    render(<QRModal member={{ ...member, memberNumber: undefined }} onClose={() => {}} />);
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-value', 'BI-MEMBER');
  });
});
