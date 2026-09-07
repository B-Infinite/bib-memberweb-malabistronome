# Mala Bistronome — Member Portal

A mobile-first React web app for Mala Bistronome members. Members can view their points/credit balance, redeem vouchers, browse tenants, and manage their profile — all from a single progressive web experience that works on both mobile and desktop.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 |
| Build tool | Vite 5 |
| Routing | React Router v7 |
| HTTP client | Axios |
| QR code | qrcode.react |
| Testing | Vitest + React Testing Library |
| Deployment | IIS (Windows Server) |

---

## Project Structure

```
src/
├── api/                  # Axios API wrappers (auth, member endpoints)
├── assets/               # Images — only logo_mala.webp is currently in use
│                         # (logo.webp, logo_login.webp, hero.webp, react.svg,
│                         #  vite.svg are unused leftovers from the template
│                         #  this project was copied from — safe to delete)
├── components/           # Shared UI components
│   ├── AppNav.jsx            # Bottom nav (mobile) + sidebar (desktop)
│   ├── PageHeader.jsx        # Greeting bar + points/credit banner
│   ├── MembershipCard.jsx    # Not currently rendered by any page (dead code,
│                              # only covered by its own test — PageHeader.jsx
│                              # is the live points/credit banner instead)
│   ├── ImageSlider.jsx
│   ├── TenantsSection.jsx
│   ├── VoucherModal.jsx
│   ├── VoucherSheet.jsx
│   ├── QRModal.jsx
│   ├── OtpInput.jsx
│   ├── PullToRefresh.jsx
│   ├── ErrorBoundary.jsx      # Catches render errors app-wide
│   └── ScrollToTop.jsx        # Resets scroll position on route change
├── config/
│   └── appLinks.js       # Configurable About section links (reads from env)
├── context/
│   └── AuthContext.jsx   # Global auth state + login/logout
├── pages/                # One file per route
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ForgotPassword.jsx
│   ├── Home.jsx
│   ├── Vouchers.jsx
│   ├── Transactions.jsx
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   ├── ChangePassword.jsx
│   ├── ChangePin.jsx     # Change PIN + Reset PIN (via SMS) for redemption PIN
│   ├── Tenants.jsx
│   ├── TenantDetailPage.jsx
│   ├── DetailPage.jsx
│   ├── ListAll.jsx
│   ├── News.jsx
│   ├── Outlets.jsx
│   └── NotFound.jsx      # 404 fallback
├── routes/
│   └── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
└── __tests__/            # Unit tests mirroring src structure
```

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Redirects to `/home` |
| `/login` | Public | Phone + password login |
| `/signup` | Public | New member registration |
| `/forgot-password` | Public | SMS password reset |
| `/home` | Protected | Dashboard — points, promotions, tenants |
| `/vouchers` | Protected | Voucher catalogue + active vouchers |
| `/transactions` | Protected | Transaction history |
| `/profile` | Protected | Member profile + About links |
| `/edit-profile` | Protected | Update name, phone, DOB, email |
| `/change-password` | Protected | Change account password |
| `/change-pin` | Protected | Change redemption PIN, or reset it via SMS |
| `/tenants` | Protected | Full tenant directory |
| `/tenant-detail` | Protected | Individual tenant page |
| `/news` | Protected | Promotions & announcements |
| `/outlets` | Protected | Mall outlet listing |
| `/all-news` | Protected | Paginated list view |
| `/news-detail` | Protected | News/promotion detail |
| `*` | Public | 404 — anything unmatched |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Access to the backend API

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment

Env vars are split across files, all loaded together by Vite:

- **`.env`** — vars shared across every environment (About-section links, app version, login tagline, home tenants limit). Already checked in with real defaults — edit in place if these need to change.
- **`.env.development` / `.env.staging` / `.env.production`** — one file per mode, holding the API connection details that differ per environment. Copy whichever mode you're setting up and fill in real values (they aren't committed with real credentials by default).

| Variable | Where it lives | Description |
|---|---|---|
| `VITE_API_BASE_URL` | per-mode | Backend API base URL |
| `VITE_AUTHORIZATION_KEY` | per-mode | API authorization key |
| `VITE_CLIENT_ID` | per-mode | Mall client ID |
| `VITE_CARD_TYPE_ID` | per-mode | Membership card type ID |
| `VITE_LINK_CONTACT_US` | `.env` | Contact Us URL (Profile > About) |
| `VITE_LINK_TERMS` | `.env` | Terms & Conditions URL |
| `VITE_LINK_PRIVACY` | `.env` | Privacy Policy URL |
| `VITE_LINK_FAQ` | `.env` | FAQ URL (leave blank to hide the row) |
| `VITE_APP_VERSION` | `.env` | App version shown in the About section |
| `VITE_LOGIN_TAGLINE` | `.env` | Subtitle under the Login page headline (falls back to a default string if blank) |
| `VITE_HOME_TENANTS_LIMIT` | `.env` | Max tenants shown in the Home page's tenants preview section |

### 3. Start dev server
```bash
npm run dev            # development mode (.env.development)
npm run dev:staging    # staging mode (.env.staging), same dev server otherwise
```
App runs at `http://localhost:5173` by default.

---

## Available Scripts

```bash
npm run dev            # Start dev server — development mode
npm run dev:staging    # Start dev server — staging mode
npm run build          # Production build → dist/production/ (Vite defaults build to production mode)
npm run build:prod     # Same as `build`, just explicit about the mode — kept for clarity/symmetry
npm run build:staging  # Production build → dist/staging/ (staging mode)
npm run preview        # Preview a production build locally
npm run lint           # Run ESLint
npm run test           # Run unit tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

> Vite's `build` command defaults to **production** mode even without `--mode` — there is no development-mode production build. `vite.config.js`'s `outDir` is only ever `dist/staging` (mode `staging`) or `dist/production` (everything else) — always double-check you're using the build script for the environment you're actually deploying to.

---

## Deploying to IIS (Windows Server)

### Prerequisites on the server (one-time setup)
Install **IIS URL Rewrite 2.1** — required for React Router client-side routing to work:
https://www.iis.net/downloads/microsoft/url-rewrite

### Deployment steps

**1. Confirm the target `.env.<mode>` file has the right API URL/credentials for that environment** (staging vs. production point at different backend deployments).

**2. Build for the target environment**
```bash
npm run build:staging   # or: npm run build:prod
```

**3. Upload the build output to your server**

Copy the entire contents of the resulting output folder (e.g. `dist/staging/` or `dist/production/`) to your web root, e.g.:
```
C:\inetpub\wwwroot\malabistronome-staging\
```

**4. Configure IIS site**
- IIS Manager → **Add Website**
- Physical path: your build output folder
- App Pool: set to **No Managed Code** (static site, no .NET required)
- Add the hostname binding for the domain this environment serves (e.g. `staging.yourdomain.com`)

**5. SSL (if serving over HTTPS directly from this IIS site, not behind a proxy that terminates TLS itself)**

Use [win-acme](https://www.win-acme.com/) to issue and auto-renew a free Let's Encrypt certificate for the site's binding. Run `wacs.exe` on the server itself, as Administrator, and follow the interactive prompts (`N: Create certificate (default settings)` → pick the IIS site → confirm the hostname). It installs the cert into the site's binding and sets up a scheduled task for renewal automatically.

> If this domain sits behind Cloudflare (or another reverse proxy) with proxying enabled, the proxy's own edge certificate handles the browser-facing side — win-acme is then only needed if the proxy is set to require HTTPS on the connection to this origin server too (e.g. Cloudflare's "Full strict" mode).

**6. Verify**

Navigate directly to `/home`, `/vouchers`, etc. — they should load correctly and not return a 404.

> The `public/web.config` is automatically copied into the build output on every build. It handles SPA routing fallback, MIME types for `.webp`/`.woff2`, long-term asset caching, and security headers. Never edit the copy inside the build output — always edit `public/web.config` and rebuild.

---

## Points vs. Credit Display (`ClientTypeID`)

Whether a member sees a points balance, a credit balance, or both is **not** a frontend setting — it's driven entirely by the backend, via the `cardTypeFeatureID` field returned from the card/points API (`CardPointGetV2`), which despite its name actually mirrors the **client's** `ClientTypeID` (not a per-card-type setting):

| Value | Meaning | Effect |
|---|---|---|
| `0` | All | Both points and credit shown, side by side |
| `1` | Point only | Only points shown |
| `2` | Cash only | Only credit shown |

This one value fans out to control several places in the UI:
- **`PageHeader.jsx`** — which balance(s) appear in the top banner.
- **`Transactions.jsx`** — whether the Point/Credit category tabs appear at all, and which category the history list is filtered to when they don't.
- **`Vouchers.jsx`** / **`VoucherModal.jsx`** — whether a voucher's cost is shown/redeemed in points, credit, or whichever the member can afford.

If a member reports the wrong balance type showing, or points/credit mixed into the wrong history tab, start by checking `user.cardTypeFeatureID` in `AuthContext` and the actual `Client.ClientTypeID` value in the database — not any frontend config.

---

## Phone Number Handling

All phone fields accept Malaysian numbers in any common format and normalise automatically:

| User input | Normalised to |
|---|---|
| `601234567890` | `1234567890` |
| `01234567890` | `1234567890` |
| `1234567890` | `1234567890` |

The `60` country prefix is appended by the app before every API call.

---

## Configuring the About Section Links

Links in **Profile → About** are driven entirely by environment variables in `.env` — no code changes needed:

```env
VITE_LINK_CONTACT_US=https://yoursite.com/contact
VITE_LINK_TERMS=https://yoursite.com/terms
VITE_LINK_PRIVACY=https://yoursite.com/privacy
VITE_LINK_FAQ=          # leave blank to hide this row entirely
VITE_APP_VERSION=1.0.0
```

To add new links or change the order, edit `src/config/appLinks.js`.

---

## Assets

| File | Used in |
|---|---|
| `src/assets/logo_mala.webp` | Login page hero, error boundary screen, 404 page |
| `public/favicon.webp` | Browser tab icon (referenced directly in `index.html`, not imported in JS) |

Replace either file in-place to update the logo/favicon — no code changes required. The desktop sidebar (`AppNav.jsx`) currently shows no logo image at all.
