import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import client from '../../api/client';
import {
  profileLogin,
  sendRegOTP,
  regOTPConfirmation,
  profileForgotPassword,
  profileLoginGetOTP,
  profileLoginWithOTP,
} from '../../api/auth.api';

const mock = new MockAdapter(client);

// Helper: Saku success envelope
const ok = (data) => ({ responseCode: '00', responseMessage: 'Success', responseData: data });
// Helper: Saku error envelope (HTTP 200 but non-'00' code)
const err = (msg, code = '01') => ({ responseCode: code, responseMessage: msg, responseData: null });

describe('auth.api', () => {
  beforeEach(() => { mock.reset(); localStorage.clear(); });
  afterEach(() => mock.reset());

  // ── profileLogin ────────────────────────────────────────────────────────────

  describe('profileLogin()', () => {
    it('POSTs to /MobileProfile/ProfileLogin with correct body', async () => {
      mock.onPost('/MobileProfile/ProfileLogin').reply(200, ok({ mobileNo: '60123456789', name: 'Ali', token: 'tok1' }));

      const res = await profileLogin('60123456789', 'pass1234');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.mobileNoOrEmailAddress).toBe('60123456789');
      expect(body.password).toBe('pass1234');
      expect(body.isMobileNoOrEmailAddressLogin).toBe('mobileNo');
      expect(res.data.responseData.token).toBe('tok1');
    });

    it('rejects when API returns a non-00 responseCode', async () => {
      mock.onPost('/MobileProfile/ProfileLogin').reply(200, err('Invalid credentials'));

      await expect(profileLogin('60123456789', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  // ── sendRegOTP ──────────────────────────────────────────────────────────────

  describe('sendRegOTP()', () => {
    it('POSTs to /MobileProfile/SendRegOTP', async () => {
      mock.onPost('/MobileProfile/SendRegOTP').reply(200, ok({ mobileNo: '60123456789' }));

      await sendRegOTP('60123456789', 'test@mail.com');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.mobileNo).toBe('60123456789');
      expect(body.emailAddress).toBe('test@mail.com');
    });

    it('uses empty string for emailAddress when omitted', async () => {
      mock.onPost('/MobileProfile/SendRegOTP').reply(200, ok({ mobileNo: '60123456789' }));

      await sendRegOTP('60123456789');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.emailAddress).toBe('');
    });
  });

  // ── regOTPConfirmation ──────────────────────────────────────────────────────

  describe('regOTPConfirmation()', () => {
    it('POSTs to /MobileProfile/RegOTPConfirmation with full payload', async () => {
      mock.onPost('/MobileProfile/RegOTPConfirmation').reply(200, ok(null));

      const payload = {
        mobileNo: '60123456789',
        otp: '123456',
        name: 'Ahmad',
        birthdate: '1990-01-15',
        emailAddress: 'ahmad@email.com',
        password: 'Passw0rd!',
      };
      await regOTPConfirmation(payload);

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.otp).toBe('123456');
      expect(body.name).toBe('Ahmad');
      expect(body.birthdate).toBe('1990-01-15');
    });
  });

  // ── profileForgotPassword ──────────────────────────────────────────────────

  describe('profileForgotPassword()', () => {
    it('POSTs to /MobileProfile/ProfileForgotPassword with mobileNo', async () => {
      mock.onPost('/MobileProfile/ProfileForgotPassword').reply(200, ok(null));

      await profileForgotPassword('60123456789');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.mobileNo).toBe('60123456789');
    });
  });

  // ── profileLoginGetOTP / profileLoginWithOTP ───────────────────────────────

  describe('profileLoginGetOTP()', () => {
    it('POSTs to /MobileProfile/ProfileLoginGetOTP', async () => {
      mock.onPost('/MobileProfile/ProfileLoginGetOTP').reply(200, ok(null));

      await profileLoginGetOTP('60123456789');

      expect(mock.history.post[0].url).toBe('/MobileProfile/ProfileLoginGetOTP');
    });
  });

  describe('profileLoginWithOTP()', () => {
    it('POSTs to /MobileProfile/ProfileLoginWithOTP with mobileNo and otp', async () => {
      mock.onPost('/MobileProfile/ProfileLoginWithOTP').reply(200, ok({ token: 'tok2' }));

      await profileLoginWithOTP('60123456789', '654321');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.otp).toBe('654321');
    });
  });
});
