import client from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Voucher module — My Vouchers (V2 where available)
// Members view vouchers they have already claimed and can use / swipe them.
// For the browsable gift catalogue, see gift.api.js.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the member's active voucher list.
 * V2: no mobileNo/password needed.
 *
 * Response: { voucherList (array) }
 * Each voucher: { voucherMemberID, voucherName, voucherImage, brandImage,
 *                 expiryDate, status, voucherID }
 *
 * @param {string} cardNo - member account number
 */
export const getVoucherList = (cardNo) =>
  client.post('/Voucher/GetVoucherListV2', { cardNo });

/**
 * Get the member's voucher history (active, used, expired).
 * V2: no mobileNo/password needed.
 *
 * Response: { voucherHistoryList (array), totalRedeemed, totalExpired }
 *
 * @param {string} cardNo
 * @param {number} [startIndex]
 * @param {number} [endIndex]
 */
export const getVoucherHistoryList = (cardNo, startIndex = 1, endIndex = 20) =>
  client.post('/Voucher/GetVoucherHistoryListV2', {
    cardNo,
    startIndex: String(startIndex),
    endIndex:   String(endIndex),
  });

/**
 * Get full detail for a single voucher the member owns.
 * (No V2 available — uses auth header injected by interceptor.)
 *
 * Response: { voucherMemberID, voucherID, voucherName, voucherImage, brandImage,
 *             description, tnC, expiryDate, status, qty,
 *             minSalesAmount, maxRedeemPerTransaction, pointRequired,
 *             swipeVoucherIndicator, voucherRedeemTypeID,
 *             secondsLeft, voucherTagDisplay (array) }
 *
 * @param {string} voucherMemberID
 */
export const getSingleVoucher = (voucherMemberID) =>
  client.post('/Voucher/GetSingleVoucher', { voucherMemberID });

/**
 * Initiate swipe-to-redeem for a voucher (starts countdown timer).
 * @param {string} voucherMemberID
 */
export const swipeRedeemVoucher = (voucherMemberID) =>
  client.post('/Voucher/SwipeRedeemVoucher', { voucherMemberID });

/**
 * End a swipe redemption session (voucher fully consumed at merchant).
 * @param {string} voucherMemberID
 */
export const endSwipeVoucher = (voucherMemberID) =>
  client.post('/Voucher/EndSwipeVoucher', { voucherMemberID });
