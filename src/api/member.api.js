import client from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Shared config — set via .env
// ─────────────────────────────────────────────────────────────────────────────
export const CLIENT_ID    = String(import.meta.env.VITE_CLIENT_ID    || '');
export const CARD_TYPE_ID = String(import.meta.env.VITE_CARD_TYPE_ID || '');

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Get member profile details.
 * V2: no body — uses Authorization header from interceptor.
 *
 * Response: { mobileNo, emailAddress, name, birthdate, canEditBirthdate,
 *             ic, address, state, country, gender, race, designation,
 *             maritalStatus, accountNumber, carPlateNo, clientTypeID }
 */
export const profileGetDetail = () =>
  client.post('/MobileProfile/ProfileGetDetailV2', {});

/**
 * Change password (authenticated user).
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const profileChangePassword = (oldPassword, newPassword) =>
  client.post('/MobileProfile/ProfileChangePasswordV2', { oldPassword, newPassword });

/**
 * Change PIN (authenticated user).
 * @param {string} oldPin - current 6-digit numeric PIN
 * @param {string} newPin - new 6-digit numeric PIN
 */
export const changePin = (oldPin, newPin) =>
  client.post('/Pin/ChangePin', { oldPin, newPin });

/**
 * Reset PIN (authenticated user) — sends a new system-generated 6-digit PIN via SMS
 * to the member's own registered number. No body needed — identity comes from the
 * Authorization header, not from client input (the mobile number is never client-supplied,
 * so nobody can trigger a reset for someone else's account).
 * Server-side rate limit: 3 requests per 10 minutes.
 */
export const resetPin = () =>
  client.post('/Pin/ResetPin', {});

/**
 * Send OTP to verify a profile update (phone / email change).
 * @param {{ emailAddress, newMobileNo }} fields
 */
export const profileUpdateSendOTP = ({ emailAddress = '', newMobileNo = '' } = {}) =>
  client.post('/MobileProfile/ProfileUpdateSendOTPV2', { emailAddress, newMobileNo });

/**
 * Confirm profile update OTP and save new values.
 * @param {{ otp, name, birthdate, emailAddress, newMobileNo,
 *           gender, address, state, country, ic, race,
 *           designation, maritalStatus, carPlateNo, accountNumber }} data
 */
export const profileUpdateOTPConfirmation = (data) =>
  client.post('/MobileProfile/ProfileUpdateOTPConfirmationV2', data);

/**
 * Delete account (authenticated user). No body required.
 */
export const deleteAccount = () =>
  client.post('/MobileProfile/DeleteAccountV2', {});

// ── Card / Points ──────────────────────────────────────────────────────────────

/**
 * Get current point balance for a card.
 * V2: no mobileNo/password needed.
 *
 * Response: { balPoint, balPointInCash, balCash, expiryDate, pointToCashRate,
 *             cardTypeFeatureID } — cardTypeFeatureID: 0 = points + cash (all type),
 *             1 = points only, 2 = cash only.
 *
 * @param {string} cardNo       - member account number
 * @param {string} [cardTypeID]
 */
export const cardPointGet = (cardNo, cardTypeID = CARD_TYPE_ID) =>
  client.post('/Card/CardPointGetV2', { cardNo, cardTypeID });

/**
 * Get paginated transaction history.
 * V2: no mobileNo/password needed.
 *
 * Response: { transactionList, totalPointEarned, totalPointRedeemed,
 *             totalPointExpired, totalCreditTopUp, totalCreditRedeemed }
 *
 * Each item: { transactionCategory, transactionTypeID, transactionType,
 *              description, remark, processDate, amount, amountNumber }
 *
 * @param {string} cardNo
 * @param {string} [cardTypeID]
 * @param {number} [startIndex]
 * @param {number} [endIndex]
 */
export const cardTransactionHistory = (
  cardNo,
  cardTypeID = CARD_TYPE_ID,
  startIndex = 1,
  endIndex   = 20,
) =>
  client.post('/Card/CardTransactionHistoryV2', {
    cardNo,
    cardTypeID,
    startIndex: String(startIndex),
    endIndex:   String(endIndex),
  });

// ── Brands / Tenants ──────────────────────────────────────────────────────────

/**
 * Get brand/tenant list for this client.
 *
 * Response: { brandList (array) }
 * Each item: { merchantHQID, companyName, brandImage, description, category, url }
 *
 * @param {string} [cardNo]
 */
export const getBrandList = (cardNo = '') =>
  client.post('/Client/GetBrandListV2', { cardNo });

// ── Outlets ────────────────────────────────────────────────────────────────────

/**
 * Get nearby outlet list (no V2 available).
 *
 * Response: { outletLocatorListDetail (array) }
 *
 * @param {string|number} latitude
 * @param {string|number} longitude
 */
export const outletLocatorList = (latitude = '', longitude = '') =>
  client.post('/Client/OutletLocatorList', {
    clientID:  CLIENT_ID,
    latitude:  String(latitude),
    longitude: String(longitude),
  });

/**
 * Get details for a single outlet (no V2 available).
 *
 * @param {string} merchantID
 */
export const outletLocatorDetails = (merchantID) =>
  client.post('/Client/OutletLocatorDetails', {
    clientID: CLIENT_ID,
    merchantID,
  });

// ── Promotions / News ──────────────────────────────────────────────────────────

/**
 * Get highlight (featured) promotions for the home banner slider.
 * V2: no body needed.
 *
 * Response: { highlightPromotionList (array) }
 */
export const getHighlightPromotionList = () =>
  client.post('/Promotion/GetHighlightPromotionListV2', {});

/**
 * Get full promotion list.
 * V2: no mobileNo/password needed.
 *
 * Response: { promotionList (array), promotionCategoryList (array) }
 *
 * @param {string} [cardNo]
 * @param {string} [cardTypeID]
 */
export const getPromotionList = (cardNo = '', cardTypeID = CARD_TYPE_ID) =>
  client.post('/Promotion/GetPromotionListV2', { cardNo, cardTypeID });

/**
 * Get single promotion detail.
 * V2: no mobileNo/password needed.
 *
 * Response: { promotionDetail (object), outletList (array) }
 *
 * @param {string} promotionID
 */
export const getSinglePromotion = (promotionID) =>
  client.post('/Promotion/GetSinglePromotionV2', { promotionID });

// ── Gifts / Voucher Catalogue ──────────────────────────────────────────────────

/**
 * Get redeemable gift catalogue for a card.
 *
 * Response: { giftList (array) }
 * Each item: { giftID, giftName, description, validPeriod, point, discountPoint,
 *              credit, discountCredit, giftImage, expireDate, tnC,
 *              giftCatagoryID, brandImage }
 *
 * @param {string} cardNo - member account number
 */
export const cardGiftList = (cardNo) =>
  client.post('/Gift/CardGetGiftListV2', { cardNo });

/**
 * Redeem a gift from the catalogue.
 *
 * Response: { responseData: { voucherOTP, voucherSerialNo, expireDate, redeemUrl } }
 *
 * @param {string} cardNo
 * @param {string|number} giftID
 */
export const redeemGift = (cardNo, giftID) =>
  client.post('/Gift/RedeemGiftV2', { cardNo, giftID: String(giftID) });

/**
 * Get active (redeemed) vouchers for a card.
 *
 * Response: { voucherList (array) }
 * Each item: { voucherID, voucherIDName, voucherName, description, tnC,
 *              pointRequired, expiryDate, voucherImage, voucherMemberID, status,
 *              brandImage, voucherTagDisplay, voucherRedeemTypeID,
 *              voucherOTP, voucherSerialNo }
 *
 * @param {string} cardNo
 */
export const getVoucherList = (cardNo) =>
  client.post('/Voucher/GetVoucherListV2', { cardNo });

/**
 * Get used/expired voucher history for a card.
 *
 * Response: { voucherHistoryList (array), totalRedeemed, totalExpired }
 * Each item: { voucherMemberID, voucherName, merchantName, redeemDate,
 *              expiryDate, status, voucherImage, brandImage,
 *              cardNo, memberName, voucherMethodID }
 *
 * @param {string} cardNo
 * @param {number} [startIndex]
 * @param {number} [endIndex]
 */
export const getVoucherHistoryList = (cardNo, startIndex = 1, endIndex = 50) =>
  client.post('/Voucher/GetVoucherHistoryListV2', {
    cardNo,
    startIndex: String(startIndex),
    endIndex:   String(endIndex),
  });

/**
 * Mark an active voucher as used (RedeemVoucherV2).
 * No responseData returned — success = responseCode "00".
 *
 * @param {string} cardNo
 * @param {string} voucherMemberID
 */
export const redeemVoucher = (cardNo, voucherMemberID) =>
  client.post('/Voucher/RedeemVoucherV2', { cardNo, voucherMemberID: String(voucherMemberID) });
