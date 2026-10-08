import { useAuth } from '../context/AuthContext';
import useCardTypeFields from './useCardTypeFields';

/**
 * useProfileCompletion — which optional profile details the member hasn't filled in yet.
 * Drives the red "incomplete" dots on the Profile page rows and the Profile nav tab.
 *
 * Checked fields: Email, plus Gender / Race only when the card type shows them
 * (CardTypeRequiredField) — a hidden field can't be filled, so it never counts as missing.
 */
export default function useProfileCompletion() {
  const { user } = useAuth();
  const { showGender, showRace } = useCardTypeFields();

  const missing = {
    email:  !(user?.email || user?.emailAddress),
    gender: showGender && !user?.gender,
    race:   showRace   && !user?.race,
  };

  return {
    missing,
    isIncomplete: Boolean(user) && (missing.email || missing.gender || missing.race),
  };
}
