/**
 * profileOptions.js — Gender / Race dropdown options shared by Signup, EditProfile and Profile.
 *
 * `value` is what gets saved to the database, so it must match the admin portal:
 *   • Gender → Member.Gender / MobileProfile.Gender ("M" / "F", 1 char)
 *   • Race   → Member.Race / MobileProfile.Race (Race.Type codes from the Race table)
 * `label` is only what the member sees.
 */

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male'   },
  { value: 'F', label: 'Female' },
];

export const RACE_OPTIONS = [
  { value: 'MALAY',   label: 'Malay'   },
  { value: 'CHINESE', label: 'Chinese' },
  { value: 'INDIAN',  label: 'Indian'  },
  { value: 'OTHERS',  label: 'Others'  },
];

/** Turn a stored code into a display label; unknown codes (e.g. set in the admin portal) are shown as-is. */
export function optionLabel(options, value) {
  if (!value) return '';
  return options.find((o) => o.value === value.toUpperCase())?.label || value;
}
