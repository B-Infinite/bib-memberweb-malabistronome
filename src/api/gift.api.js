import client from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Gift module — Voucher Catalogue (V2)
// Members browse redeemable gifts and redeem them with points.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the full gift/reward catalogue available to this card.
 * V2: no mobileNo/password needed.
 *
 * Response: { giftList (array) }
 * Each gift: { giftID, giftName, giftImage, brandImage, point, credit,
 *              discountPoint, discountCredit, expireDate, giftCatagoryID }
 *
 * @param {string} cardNo - member account number
 */
export const getGiftList = (cardNo) =>
  client.post('/Gift/CardGetGiftListV2', { cardNo });

/**
 * Redeem a gift item — deducts points from the member's balance.
 * V2: no mobileNo/password needed.
 *
 * Response: { expireDate, redeemUrl }
 *
 * @param {string} cardNo
 * @param {string} giftID
 */
export const redeemGift = (cardNo, giftID) =>
  client.post('/Gift/RedeemGiftV2', { cardNo, giftID });
