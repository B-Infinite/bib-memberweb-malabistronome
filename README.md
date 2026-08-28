# KevW Kopitam — Member Portal

A mobile-first React web app for KevW Kopitam members. Members can view their points balance, redeem vouchers, browse tenants, and manage their profile — all from a single progressive web experience that works on both mobile and desktop.

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
├── assets/               # Images (logo.webp, logo_login.webp, etc.)
├── components/           # Shared UI components
│   ├── AppNav.jsx            # Bottom nav (mobile) + sidebar (desktop)
│   ├── PageHeader.jsx        # Greeting bar + points banner
│   ├── MembershipCard.jsx
│   ├── ImageSlider.jsx
│   ├── TenantsSection.jsx
│   ├── VoucherModal.jsx
│   ├── QRModal.jsx
│   ├── OtpInput.jsx
│   └── PullToRefresh.jsx
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
│   ├── Tenants.jsx
│   ├── TenantDetailPage.jsx
│   ├── DetailPage.jsx
│   ├── ListAll.jsx
│   ├── News.jsx
│   └── Outlets.jsx
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
| `/tenants` | Protected | Full tenant directory |
| `/tenant-detail` | Protected | Individual tenant page |
| `/news` | Protected | Promotions & announcements |
| `/outlets` | Protected | Mall outlet listing |
| `/list-all` | Protected | Paginated list view |
| `/detail` | Protected | News/promotion detail |

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
Copy the example env file and fill in your values:
```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_AUTHORIZATION_KEY` | API authorization key |
| `VITE_CLIENT_ID` | Mall client ID |
| `VITE_CARD_TYPE_ID` | Membership card type ID |
| `VITE_LINK_CONTACT_US` | Contact Us URL (Profile > About) |
| `VITE_LINK_TERMS` | Terms & Conditions URL |
| `VITE_LINK_PRIVACY` | Privacy Policy URL |
| `VITE_LINK_FAQ` | FAQ URL (leave blank to hide the row) |
| `VITE_APP_VERSION` | App version shown in the About section |

### 3. Start dev server
```bash
npm run dev
```
App runs at `http://localhost:5173` by default.

---

## Available Scripts

```bash
npm run dev            # Start development server with hot reload
npm run build          # Production build → dist/
npm run preview        # Preview production build locally
npm run lint           # Run ESLint
npm run test           # Run unit tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

---

## Deploying to IIS (Windows Server)

### Prerequisites on the server (one-time setup)
Install **IIS URL Rewrite 2.1** — required for React Router client-side routing to work:
https://www.iis.net/downloads/microsoft/url-rewrite

### Deployment steps

**1. Set the production API URL**

Create or update `.env.production` before building:
```env
VITE_API_BASE_URL=https://your-live-api.com
```

**2. Build for production**
```bash
npm run build
```

**3. Upload `dist/` to your server**

Copy the entire contents of `dist/` to your web root, e.g.:
```
C:\inetpub\wwwroot\thecourts\
```

**4. Configure IIS site**
- IIS Manager → **Add Website**
- Physical path: your `dist/` folder
- App Pool: set to **No Managed Code** (static site, no .NET required)

**5. Verify**

Navigate directly to `/home`, `/vouchers`, etc. — they should load correctly and not return a 404.

> The `public/web.config` is automatically copied into `dist/` on every build. It handles SPA routing fallback, MIME types for `.webp`/`.woff2`, long-term asset caching, and security headers. Never edit the copy inside `dist/` — always edit `public/web.config` and rebuild.

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

Links in **Profile → About** are driven entirely by environment variables — no code changes needed:

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
| `src/assets/logo.webp` | Desktop sidebar (all main pages) |
| `src/assets/logo_login.webp` | Login page hero |

Replace either file in-place to update the logo — no code changes required.
