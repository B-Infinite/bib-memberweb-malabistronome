import { useEffect, useState } from 'react';
import { getCardTypeRequiredField } from '../api/auth.api';

/**
 * useCardTypeFields — which optional profile fields this site's card type turns on,
 * from the CardTypeRequiredField table (managed in the admin portal).
 *
 * "On" means the field is shown (still optional); "off" means it's hidden.
 * While loading, or if the call fails, every field stays hidden.
 */

// Module-level cache — fetched once per page load, shared by Signup / EditProfile / Profile
let fieldsPromise = null;

function loadFields() {
  if (!fieldsPromise) {
    fieldsPromise = getCardTypeRequiredField()
      .then((res) => {
        const d = res.data?.responseData ?? {};
        return {
          showGender: d.isRequiredGender === '1',
          showRace:   d.isRequiredRace   === '1',
        };
      })
      .catch(() => {
        fieldsPromise = null; // allow a retry on the next page visit
        return { showGender: false, showRace: false };
      });
  }
  return fieldsPromise;
}

export default function useCardTypeFields() {
  const [fields, setFields] = useState({ showGender: false, showRace: false });

  useEffect(() => {
    let active = true;
    loadFields().then((f) => { if (active) setFields(f); });
    return () => { active = false; };
  }, []);

  return fields;
}
