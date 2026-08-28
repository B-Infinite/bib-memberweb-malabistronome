import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';
import * as memberApi from '../../api/member.api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ok = (data) => ({ data: { responseCode: '00', responseMessage: 'Success', responseData: data } });

function AuthConsumer() {
  const { user, loading, error, login, logout, mockLogin } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'null'}</span>
      <button onClick={() => login('60123456789', 'pass').catch(() => {})}>login</button>
      <button onClick={() => mockLogin('60123456789')}>mockLogin</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with null user when localStorage is empty', () => {
    renderAuth();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('hydrates user from localStorage on mount', () => {
    const stored = { name: 'Ahmad', mobileNo: '60123456789' };
    localStorage.setItem('kevw_kopitiam__user', JSON.stringify(stored));

    renderAuth();

    expect(screen.getByTestId('user').textContent).toContain('Ahmad');
  });

  it('login() calls ProfileLogin, ProfileGetDetail and CardPointGet then stores user', async () => {
    vi.spyOn(authApi, 'profileLogin').mockResolvedValue(
      ok({ mobileNo: '60123456789', name: 'Ahmad', token: 'tok123' })
    );
    vi.spyOn(memberApi, 'profileGetDetail').mockResolvedValue(
      ok({ name: 'Ahmad', accountNumber: 'ACC001', emailAddress: 'a@b.com', birthdate: '1990-01-01' })
    );
    vi.spyOn(memberApi, 'cardPointGet').mockResolvedValue(
      ok({ balPoint: '12450', expiryDate: null })
    );

    renderAuth();
    await act(async () => { screen.getByText('login').click(); });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Ahmad');
    });

    const user = JSON.parse(screen.getByTestId('user').textContent);
    expect(user.mobileNo).toBe('60123456789');
    expect(user.points).toBe(12450);
    expect(user.accountNumber).toBe('ACC001');
    expect(localStorage.getItem('kevw_kopitiam__auth_token')).toBe('tok123');
    expect(localStorage.getItem('kevw_kopitiam__mobileNo')).toBe('60123456789');
  });

  it('login() sets error state when ProfileLogin fails', async () => {
    vi.spyOn(authApi, 'profileLogin').mockRejectedValue(new Error('Invalid credentials'));

    renderAuth();
    await act(async () => { screen.getByText('login').click(); });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('mockLogin() stores a demo user without API calls', () => {
    renderAuth();
    act(() => { screen.getByText('mockLogin').click(); });

    expect(screen.getByTestId('user').textContent).toContain('Demo User');
    expect(localStorage.getItem('kevw_kopitiam__auth_token')).toBe('demo-token');
    expect(localStorage.getItem('kevw_kopitiam__mobileNo')).toBe('60123456789');
  });

  it('logout() clears session and nullifies user', async () => {
    localStorage.setItem('kevw_kopitiam__auth_token', 'tok');
    localStorage.setItem('kevw_kopitiam__mobileNo', '60123456789');
    localStorage.setItem('kevw_kopitiam__user', JSON.stringify({ name: 'Ahmad', mobileNo: '60123456789' }));

    renderAuth();
    await waitFor(() => { expect(screen.getByTestId('user').textContent).toContain('Ahmad'); });

    await act(async () => { screen.getByText('logout').click(); });

    await waitFor(() => { expect(screen.getByTestId('user').textContent).toBe('null'); });
    expect(localStorage.getItem('kevw_kopitiam__auth_token')).toBeNull();
    expect(localStorage.getItem('kevw_kopitiam__mobileNo')).toBeNull();
    expect(localStorage.getItem('kevw_kopitiam__user')).toBeNull();
  });
});
