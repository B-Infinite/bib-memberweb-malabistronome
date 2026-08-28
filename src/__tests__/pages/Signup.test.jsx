import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Signup from '../../pages/Signup';
import * as authApiModule from '../../api/auth.api';

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login"  element={<div>Login Page</div>} />
          <Route path="/home"   element={<div>Home Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

/**
 * Fill all required fields on the registration form with valid data.
 * DOB is set via select elements; other fields are text inputs.
 */
async function fillValidForm(user) {
  await user.type(screen.getByPlaceholderText('e.g. Ahmad bin Razali'), 'Ahmad Test');

  // DOB dropdowns — select day, month, year
  const daySelect   = screen.getByRole('combobox', { name: /day/i });
  const monthSelect = screen.getByRole('combobox', { name: /month/i });
  const yearSelect  = screen.getByRole('combobox', { name: /year/i });
  await user.selectOptions(daySelect,   '15');
  await user.selectOptions(monthSelect, '6');
  await user.selectOptions(yearSelect,  '1990');

  // Phone (the inner input, after the +60 prefix)
  await user.type(screen.getByPlaceholderText('1X XXXX XXXX'), '123456789');

  // Password fields
  const [pwInput, confirmInput] = screen.getAllByPlaceholderText(/Min\. 8 characters|Re-enter your password/);
  await user.type(screen.getByPlaceholderText('Min. 8 characters'),        'Password1');
  await user.type(screen.getByPlaceholderText('Re-enter your password'), 'Password1');

  // Terms checkbox
  await user.click(screen.getByRole('checkbox'));
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Signup page — rendering', () => {
  it('renders the name field', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('e.g. Ahmad bin Razali')).toBeInTheDocument();
  });

  it('renders DOB dropdowns', () => {
    renderSignup();
    expect(screen.getByRole('combobox', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /month/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /year/i })).toBeInTheDocument();
  });

  it('renders the phone field with +60 prefix', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('1X XXXX XXXX')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
  });

  it('renders the Send OTP button', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('renders back button to login', () => {
    renderSignup();
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('Signup page — field validation', () => {
  it('shows required errors when all fields are empty on submit', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Please select your full date of birth.')).toBeInTheDocument();
  });

  it('shows error for invalid phone format', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('1X XXXX XXXX'), '999'); // invalid: starts with 9
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    expect(screen.getByText(/valid Malaysian number/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('Min. 8 characters'),        'Password1');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'DifferentPass1');
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows error when password fails strength requirements', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'weak');
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    expect(screen.getByText(/password does not meet/i)).toBeInTheDocument();
  });

  it('shows terms error when checkbox is not ticked', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('e.g. Ahmad bin Razali'), 'Ahmad');
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    expect(screen.getByText(/agree to the Terms/i)).toBeInTheDocument();
  });
});

// ── Successful flow ───────────────────────────────────────────────────────────

describe('Signup page — successful flow', () => {
  beforeEach(() => {
    localStorage.clear();
    // Stub the API to succeed silently
    vi.spyOn(authApiModule, 'sendRegOTP').mockResolvedValue({
      data: { responseCode: '00', responseMessage: 'OTP sent', responseData: { mobileNo: '60123456789' } }
    });
    vi.spyOn(authApiModule, 'regOTPConfirmation').mockResolvedValue({
      data: { responseCode: '00', responseMessage: 'Success', responseData: null }
    });
  });

  it('transitions to OTP screen after valid form submission', async () => {
    const user = userEvent.setup();
    renderSignup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    await waitFor(() => {
      expect(screen.getByText(/verify number/i)).toBeInTheDocument();
    });
  });

  it('redirects to /home after correct OTP entry (dev demo code)', async () => {
    const user = userEvent.setup();
    renderSignup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send otp/i }));
    await waitFor(() => screen.getByText(/verify number/i));

    // Type the 6-digit demo OTP digit by digit into the OTP input boxes
    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
