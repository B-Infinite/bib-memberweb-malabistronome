import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import client from '../../api/client';
import {
  profileGetDetail,
  cardPointGet,
  getPointHistoryList,
  outletLocatorList,
  getHighlightPromotionList,
  getPromotionList,
  getSinglePromotion,
  getNotificationSent,
  profileUpdateSendOTP,
  profileUpdateOTPConfirmation,
} from '../../api/member.api';

const mock = new MockAdapter(client);

// Helper: Saku success envelope
const ok = (data) => ({ responseCode: '00', responseMessage: 'Success', responseData: data });

describe('member.api', () => {
  beforeEach(() => { mock.reset(); localStorage.clear(); });
  afterEach(() => mock.reset());

  // ── Profile ─────────────────────────────────────────────────────────────────

  describe('profileGetDetail()', () => {
    it('POSTs to /MobileProfile/ProfileGetDetail', async () => {
      const profileData = { name: 'Ahmad', mobileNo: '60123456789', emailAddress: 'a@b.com' };
      mock.onPost('/MobileProfile/ProfileGetDetail').reply(200, ok(profileData));

      const res = await profileGetDetail();

      expect(res.data.responseData.name).toBe('Ahmad');
      expect(mock.history.post[0].url).toBe('/MobileProfile/ProfileGetDetail');
    });
  });

  describe('profileUpdateSendOTP()', () => {
    it('POSTs to /MobileProfile/ProfileUpdateSendOTP', async () => {
      mock.onPost('/MobileProfile/ProfileUpdateSendOTP').reply(200, ok({ mobileNo: '60123456789' }));

      await profileUpdateSendOTP({ emailAddress: 'new@email.com', newMobileNo: '' });

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.emailAddress).toBe('new@email.com');
    });
  });

  describe('profileUpdateOTPConfirmation()', () => {
    it('POSTs to /MobileProfile/ProfileUpdateOTPConfirmation', async () => {
      mock.onPost('/MobileProfile/ProfileUpdateOTPConfirmation').reply(200, ok({ mobileNo: '60123456789' }));

      await profileUpdateOTPConfirmation({ otp: '123456', name: 'Ali', birthdate: '1990-01-01' });

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.otp).toBe('123456');
    });
  });

  // ── Card / Points ────────────────────────────────────────────────────────────

  describe('cardPointGet()', () => {
    it('POSTs to /Card/CardPointGet with cardNo', async () => {
      const pointData = { balPoint: '12450', expiryDate: '2026-12-31', balCash: '0' };
      mock.onPost('/Card/CardPointGet').reply(200, ok(pointData));

      const res = await cardPointGet('0001234567890');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.cardNo).toBe('0001234567890');
      expect(res.data.responseData.balPoint).toBe('12450');
    });
  });

  describe('getPointHistoryList()', () => {
    it('POSTs to /Card/GetPointHistoryList with pagination params', async () => {
      const historyData = { pointHistoryList: [], totalEarned: '1000', totalRedeemed: '500' };
      mock.onPost('/Card/GetPointHistoryList').reply(200, ok(historyData));

      await getPointHistoryList('0001234567890', 1, 20);

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.cardNo).toBe('0001234567890');
      expect(body.startIndex).toBe('1');
      expect(body.endIndex).toBe('20');
    });

    it('converts startIndex and endIndex to strings', async () => {
      mock.onPost('/Card/GetPointHistoryList').reply(200, ok({ pointHistoryList: [] }));

      await getPointHistoryList('card123', 5, 25);

      const body = JSON.parse(mock.history.post[0].data);
      expect(typeof body.startIndex).toBe('string');
      expect(body.startIndex).toBe('5');
      expect(body.endIndex).toBe('25');
    });
  });

  // ── Outlets ──────────────────────────────────────────────────────────────────

  describe('outletLocatorList()', () => {
    it('POSTs to /Client/OutletLocatorList with lat/lng', async () => {
      mock.onPost('/Client/OutletLocatorList').reply(200, ok({ outletLocatorListDetail: [] }));

      await outletLocatorList(3.1234, 101.5678);

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.latitude).toBe('3.1234');
      expect(body.longitude).toBe('101.5678');
    });

    it('passes empty strings when no coordinates are given', async () => {
      mock.onPost('/Client/OutletLocatorList').reply(200, ok({ outletLocatorListDetail: [] }));

      await outletLocatorList();

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.latitude).toBe('');
      expect(body.longitude).toBe('');
    });
  });

  // ── Promotions / News ─────────────────────────────────────────────────────────

  describe('getHighlightPromotionList()', () => {
    it('POSTs to /Promotion/GetHighlightPromotionList', async () => {
      mock.onPost('/Promotion/GetHighlightPromotionList').reply(200, ok({ highlightPromotionList: [] }));

      await getHighlightPromotionList();

      expect(mock.history.post[0].url).toBe('/Promotion/GetHighlightPromotionList');
    });
  });

  describe('getPromotionList()', () => {
    it('POSTs to /Promotion/GetPromotionList', async () => {
      mock.onPost('/Promotion/GetPromotionList').reply(200, ok({ promotionList: [], promotionCategoryList: [] }));

      await getPromotionList();

      expect(mock.history.post[0].url).toBe('/Promotion/GetPromotionList');
    });
  });

  describe('getSinglePromotion()', () => {
    it('POSTs to /Promotion/GetSinglePromotion with promotionID', async () => {
      mock.onPost('/Promotion/GetSinglePromotion').reply(200, ok({ promotionDetail: { promotionID: 'p1' } }));

      await getSinglePromotion('p1');

      const body = JSON.parse(mock.history.post[0].data);
      expect(body.promotionID).toBe('p1');
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────────

  describe('getNotificationSent()', () => {
    it('POSTs to /Notification/GetNotificationSent', async () => {
      mock.onPost('/Notification/GetNotificationSent').reply(200, ok({ notificationSentList: [] }));

      await getNotificationSent();

      expect(mock.history.post[0].url).toBe('/Notification/GetNotificationSent');
    });
  });
});
