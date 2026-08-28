import client from './client';

const CLIENT_ID    = String(import.meta.env.VITE_CLIENT_ID    || '');
const CARD_TYPE_ID = String(import.meta.env.VITE_CARD_TYPE_ID || '');

// ─────────────────────────────────────────────────────────────────────────────
// Authentication — MobileProfile V2
// V2 endpoints require only the Authorization header (set by interceptor after
// login). They no longer need mobileNo + password in the request body.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login with phone number + password.
 * V2 response: { mobileNo, name, token, clientID }
 *
 * @param {string} mobileNo  - full Malaysian number e.g. "60123456789"
 * @param {string} password
 */
export const profileLogin = (mobileNo, password) =>
  client.post('/MobileProfile/ProfileLoginV2', {
    mobileNoOrEmailAddress:        mobileNo,
    password,
    isMobileNoOrEmailAddressLogin: '1',  // '1' = login by mobile number
    clientID:                      CLIENT_ID,
  });

/**
 * Step 1 of registration — send OTP to mobile number.
 * @param {string} mobileNo
 * @param {string} [emailAddress]
 */
export const sendRegOTP = (mobileNo, emailAddress = '') =>
  client.post('/MobileProfile/SendRegOTPV2', {
    mobileNo,
    emailAddress,
    clientID: CLIENT_ID,
  });

/**
 * Step 2 of registration — confirm OTP and create the account.
 * @param {{ mobileNo, otp, name, birthdate, emailAddress, password }} data
 */
export const regOTPConfirmation = (data) =>
  client.post('/MobileProfile/RegOTPConfirmationV2', {
    ...data,
    clientID:   CLIENT_ID,
    cardTypeID: CARD_TYPE_ID,
  });

/**
 * Forgot password — sends a new temporary password via SMS.
 * @param {string} mobileNo - full Malaysian number e.g. "60123456789"
 */
export const profileForgotPassword = (mobileNo) =>
  client.post('/MobileProfile/ProfileForgotPasswordV2', {
    mobileNoOrEmailAddress:        mobileNo,
    isMobileNoOrEmailAddressLogin: '1',
    clientID:                      CLIENT_ID,
  });
