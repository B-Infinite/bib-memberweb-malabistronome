import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../../pages/Login';

function renderLogin(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/home"            element={<div>Home Page</div>} />
          <Route path="/signup"          element={<div>Signup Page</div>} />
          <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Login page — rendering', () => {
  it('renders brand name', () => {
    renderLogin();
    expect(screen.getByAltText('Mala Bistronome')).toBeInTheDocument();
  });

  it('renders phone number field with +60 prefix', () => {
    renderLogin();
    expect(screen.getByText('+60')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('12 345 6789')).toBeInTheDocument();
  });

  it('renders password field', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders Continue button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('renders "Join Mala Bistronome" signup link', () => {
    renderLogin();
    expect(screen.getByText('Join Mala Bistronome')).toBeInTheDocument();
  });

  it('renders "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });
});

// ── Password visibility ───────────────────────────────────────────────────────

describe('Login page — password visibility toggle', () => {
  it('toggles password field type on eye button click', async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(screen.getByLabelText(/show password/i));
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(screen.getByLabelText(/hide password/i));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('Login page — validation', () => {
  it('shows error when phone number is empty on submit', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
  });

  it('shows error for invalid phone format', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '999'); // too short, starts with 9
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/valid Malaysian number/i)).toBeInTheDocument();
  });

  it('shows error when password is empty', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '123456789'); // starts with 1, 9 digits
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('shows error when password is fewer than 6 characters', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '123456789');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'abc');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  it('clears phone error when user starts correcting the field', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '1');
    expect(screen.queryByText('Phone number is required.')).not.toBeInTheDocument();
  });
});

// ── Successful flow ───────────────────────────────────────────────────────────

describe('Login page — successful flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to /home after valid credentials (dev mock fallback)', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '123456789'); // "1" + 8 digits = valid
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('stores mobileNo in localStorage after successful login', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('12 345 6789'), '123456789');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(localStorage.getItem('mala_bistronome__mobileNo')).toBe('60123456789');
    });
  });
});
