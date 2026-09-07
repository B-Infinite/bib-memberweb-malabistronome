import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

/**
 * Render a component wrapped in MemoryRouter + AuthProvider.
 * @param {JSX.Element} ui
 * @param {{ initialEntries?: string[], initialIndex?: number }} options
 */
export function renderWithProviders(ui, { initialEntries = ['/'], ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/** Seed localStorage so ProtectedRoute treats the user as logged in. */
export function seedAuth(user = mockUser) {
  localStorage.setItem('mala_bistronome__auth_token', 'mock-token');
  localStorage.setItem('mala_bistronome__user', JSON.stringify(user));
}

export const mockUser = {
  firstName: 'Sarun',
  lastName: 'Phongphaew',
  email: 'sarun@example.com',
  memberNumber: '0001234567890',
  tier: 'Gold',
  points: 12450,
  pointsExpiry: '2026-12-31',
  nextTierPoints: 20000,
};

export const mockMember = {
  ...mockUser,
  memberNumber: '0001234567890',
  tier: 'Gold',
  points: 12450,
};
