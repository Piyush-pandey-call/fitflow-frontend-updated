# FitFlow frontend - PDF design implementation

Angular 18 frontend updated from the supplied ZIP. The nine-section Website Experience PDF is the public website reference; Visual UI 2026 is the owner/member/admin application reference.

## Start on Windows

Extract the ZIP, open PowerShell inside `fitflow-frontend`, then run:

```powershell
npm ci
npm start
```

Open http://localhost:4200. Keep your Spring Boot backend running at http://localhost:8080/api. Sign in with an existing owner/member account. No demo account, bypassed authentication or invented live metrics is installed.

Public website works without the backend. Authenticated screens require the corresponding API and real records. The product preview and public marketing examples use the PDF's static sample numbers; logged-in screens use backend data.

## Production build

```powershell
npm run build
```

First set your actual API URL in `src/environments/environment.prod.ts`; the supplied `https://api.yourdomain.com/api` is a placeholder. Production file replacement is configured in angular.json. Build output is `dist/fitflow-frontend/browser`. Configure hosting to send unknown routes to index.html. Allow your frontend origin in backend CORS settings.

## Where the design is implemented

| Reference | Frontend location |
| --- | --- |
| Website PDF pages 1-9 | `/`, nine linked scroll sections, feature preview, pricing, FAQ, inline login |
| Visual PDF page 1 | Public website uses the fuller Website Experience hero |
| Pages 2-3 | `/auth/login`, `/auth/register`; separate `/auth/member-login` |
| Page 4 | `/dashboard/gym-owner`, four cards, two charts, trial banner, attention panel |
| Pages 5-6 | `/members`, `/members/:id`, profile tabs and recent visits |
| Page 7 | `/trainers`, trainer profile cards |
| Page 8 | `/attendance`, daily records and manual/QR check-in |
| Pages 9-10 | `/memberships/plans`, `/memberships/member/:memberId` |
| Page 11 | `/payments` |
| Page 12 | `/wellness`, owner/trainer member selection and two-column plans |
| Page 13 | `/reports`, chart and Excel/PDF export panel |
| Page 14 | `/settings`, gym form and account/support column |
| Pages 15-17 | `/billing/pricing`, `/billing/checkout`, `/billing/expired` |
| Pages 18-19 | `/dashboard/member`, `/wellness`; member sidebar links open attendance/membership/diet/invoices |
| Page 20 | `/dashboard/super-admin`, platform cards and optional trend/recent gym sections |

Shared chrome: `src/app/shared/components/sidebar`, `header`. Shared feature styling: `src/styles/pdf-reference-theme.css`. Public site styling: `src/app/features/landing/pages/welcome/welcome.component.css`. Images are cropped from the supplied PDF; Inter fonts and font license are bundled locally.

## Important differences and backend dependencies

These PDFs contain flattened visual concepts, not editable design files. The implementation recreates the appearance with real HTML, Angular forms and navigation, but is not a guaranteed pixel-for-pixel copy. Actual account names, dates, counts and plans change with backend data. Additional editing, error, empty and loading states remain usable.

- The original ZIP does not contain a SaaS subscription checkout API. Checkout shows a real plan summary and a support activation request; it does not charge, claim successful payment or activate a subscription. The existing gym-member Razorpay/offline payment flows remain in their original feature services.
- The existing owner aggregate lacks expiring-this-week, pending-payment and support-message counts. The attention panel links to those areas rather than displaying invented PDF counts.
- The existing report data lacks attendance-rate, renewal-rate and new-join KPIs. The three report cards use available live metrics. Report exports retain their real existing API calls.
- The super-admin response currently has aggregate counts only. Optional `gymGrowth`, `subscriptionRevenue` and `recentGyms` fields render when supplied; otherwise honest empty states appear. No historical graphs or gym records are fabricated.
- Attendance's inside-now count is explicitly scoped to the loaded records; it is not a complete occupancy total when more records exist.
- Trial enforcement, payment verification and authorization stay on the backend. A frontend redesign cannot add those server capabilities.

## Verification

Production compilation passed. Browser checks covered all nine public sections, owner feature screens, member dashboard/wellness, admin overview, login/signup, and 390px mobile layouts. Fixtures were intercepted only in the test browser; fixture data/tokens are not shipped in the application.

Open `design-preview/index.html` directly to view captured screens with sample API responses. These are visual previews, not evidence of a live backend or completed payment integration.
