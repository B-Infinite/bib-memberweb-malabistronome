/**
 * appLinks.js — Configurable "About" section links for the Profile page.
 *
 * HOW TO EDIT:
 *   • Change URLs → update the corresponding VITE_LINK_* variable in .env.local
 *   • Hide a link  → set enabled: false below (or leave the env var empty)
 *   • Add a link   → add a new entry here + a VITE_LINK_* var in .env.local
 *   • Change a label → edit the `label` field below
 *
 * Link types:
 *   'external'  — opens URL in a new browser tab
 *   'email'     — opens the user's mail client (prefix handled automatically)
 *   'phone'     — opens the dialler (prefix handled automatically)
 *   'info'      — read-only display row (e.g. app version), no tap action
 */

const e = import.meta.env;

const APP_LINKS = [
  {
    id:      'contact',
    label:   'Contact Us',
    type:    'external',
    url:     e.VITE_LINK_CONTACT_US   || '',
    enabled: true,
  },
  {
    id:      'terms',
    label:   'Terms & Conditions',
    type:    'external',
    url:     e.VITE_LINK_TERMS        || '',
    enabled: true,
  },
  {
    id:      'privacy',
    label:   'Privacy Policy',
    type:    'external',
    url:     e.VITE_LINK_PRIVACY      || '',
    enabled: true,
  },
  {
    id:      'faq',
    label:   'FAQ',
    type:    'external',
    url:     e.VITE_LINK_FAQ          || '',
    enabled: Boolean(e.VITE_LINK_FAQ),   // hidden unless URL is set
  },
  {
    id:      'version',
    label:   'App Version',
    type:    'info',
    value:   e.VITE_APP_VERSION       || '1.0.0',
    enabled: true,
  },
];

export default APP_LINKS;
