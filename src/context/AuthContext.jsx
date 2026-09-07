import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { profileLogin } from '../api/auth.api';
import { profileGetDetail, cardPointGet, CARD_TYPE_ID } from '../api/member.api';

const AuthContext = createContext(null);

// ─── Storage keys — unique per app to prevent session collision across projects ─
const STORAGE_KEYS = {
  mobileNo:  'mala_bistronome__mobileNo',
  authToken: 'mala_bistronome__auth_token',
  user:      'mala_bistronome__user',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storeSession(mobileNo, authToken) {
  sessionStorage.setItem(STORAGE_KEYS.mobileNo,  mobileNo);
  sessionStorage.setItem(STORAGE_KEYS.authToken, authToken);
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEYS.mobileNo);
  sessionStorage.removeItem(STORAGE_KEYS.authToken);
  sessionStorage.removeItem(STORAGE_KEYS.user);
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Build a normalised user object from V2 API responses.
 */
function buildUserObject({ loginData = {}, profileData = {}, pointData = {} }) {
  return {
    // From ProfileLoginV2: { mobileNo, name, token, clientID, cardNo }
    authToken: loginData.token,
    cardNo:    loginData.cardNo   || null,

    // From ProfileGetDetailV2
    mobileNo:         profileData.mobileNo         || loginData.mobileNo,
    name:             profileData.name              || loginData.name,
    accountNumber:    profileData.accountNumber,
    emailAddress:     profileData.emailAddress,
    birthdate:        profileData.birthdate,
    gender:           profileData.gender,
    address:          profileData.address,
    state:            profileData.state,
    country:          profileData.country,
    ic:               profileData.ic,
    race:             profileData.race,
    designation:      profileData.designation,
    maritalStatus:    profileData.maritalStatus,
    carPlateNo:       profileData.carPlateNo,
    canEditBirthdate: profileData.canEditBirthdate,
    clientTypeID:     profileData.clientTypeID ?? null,

    // From CardPointGetV2
    points:            pointData.balPoint ? Number(pointData.balPoint) : 0,
    pointsExpiry:      pointData.expiryDate        ?? null,
    balCash:           pointData.balCash           ?? null,
    pointToCashRate:   pointData.pointToCashRate   ?? null,
    cardTypeFeatureID: pointData.cardTypeFeatureID ?? null,

    // Convenience aliases
    phone: profileData.mobileNo || loginData.mobileNo,
    email: profileData.emailAddress ?? null,
  };
}

// ─── Helper: fetch profile + points and return both data objects ──────────────
async function fetchProfileAndPoints(cardNo) {
  let profileData = {};
  try {
    const r = await profileGetDetail();
    profileData = r.data?.responseData ?? {};
  } catch { /* non-fatal */ }

  let pointData = {};
  if (cardNo) {
    try {
      const r = await cardPointGet(cardNo, CARD_TYPE_ID);
      pointData = r.data?.responseData ?? {};
    } catch { /* non-fatal */ }
  }

  return { profileData, pointData };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.authToken);
      if (!token || isTokenExpired(token)) {
        clearSession();
        return null;
      }
      const stored = sessionStorage.getItem(STORAGE_KEYS.user);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── On page load/refresh: re-fetch live data if already logged in ──────────
  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.authToken);
    const stored = sessionStorage.getItem(STORAGE_KEYS.user);
    if (!token || !stored) return;

    if (isTokenExpired(token)) {
      clearSession();
      setUser(null);
      return;
    }

    let savedUser;
    try { savedUser = JSON.parse(stored); } catch { return; }

    const cardNo = savedUser.cardNo || savedUser.accountNumber || '';

    (async () => {
      const { profileData, pointData } = await fetchProfileAndPoints(cardNo);
      setUser((prev) => {
        if (!prev) return prev;
        const updated = buildUserObject({
          loginData:   { token: prev.authToken, mobileNo: prev.mobileNo, name: prev.name, cardNo: prev.cardNo },
          profileData: { ...prev, ...profileData },
          pointData,
        });
        sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
        return updated;
      });
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (mobileNo, password) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate — cardNo is now included in the login response
      const loginRes  = await profileLogin(mobileNo, password);
      const loginData = loginRes.data?.responseData ?? {};

      // 2. Persist session
      storeSession(mobileNo, loginData.token || '');

      // 3. Load profile + points using cardNo from login response
      const cardNo = loginData.cardNo || '';
      const { profileData, pointData } = await fetchProfileAndPoints(cardNo);

      // 4. Build, persist, and expose user object
      const userObj = buildUserObject({ loginData, profileData, pointData });
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userObj));
      setUser(userObj);
      return userObj;

    } catch (err) {
      const msg = err.message || err.response?.data?.responseMessage || 'Login failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // ── Refresh live data (call after redemption, profile update, etc.) ────────
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    const cardNo = user.cardNo || user.accountNumber || '';
    const { profileData, pointData } = await fetchProfileAndPoints(cardNo);

    setUser((prev) => {
      if (!prev) return prev;
      const updated = buildUserObject({
        loginData:   { token: prev.authToken, mobileNo: prev.mobileNo, name: prev.name, cardNo: prev.cardNo },
        profileData: { ...prev, ...profileData },
        pointData,
      });
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  // ── Optimistic local update (e.g. after EditProfile save) ─────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      login, logout, clearError,
      refreshUserData, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
