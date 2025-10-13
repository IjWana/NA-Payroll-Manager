# Nigerian Army Payroll System (Prototype)

A modern React + TailwindCSS prototype for managing personnel and payroll calculation workflows for the Nigerian Army. This is an educational/demo implementation – not production hardened – illustrating architecture, state management, UI composition, and domain modeling basics.

## Tech Stack
- React 18 + Vite
- React Router v6
- TailwindCSS 3
- lucide-react (icons)
- Context API for state (Auth, Personnel, Payroll)
- Vitest (unit tests placeholder)

## Features (Current)
- App layout with sidebar navigation & topbar context
- Modular UI primitives (Button, Card, Table, Badge, FormInput)
- Mock personnel registry with sample ranks
- Simplified payroll processing: base salary + allowances (housing, transport, uniform) − deductions (tax, pension, NHF)
- Dashboard with aggregated metrics from latest payroll run
- Basic theming + Army-inspired palette

## Planned Enhancements
- Authentication (JWT / role-based access)
- Persistent storage (REST API or GraphQL backend)
- Rank & grade pay scale configuration UI
- Advanced allowance/deduction rules (hazard, deployment, leave, overtime)
- Audit log & export (CSV/PDF)
- Report builder & filtering
- Unit/integration tests coverage
- Internationalization & accessibility review

## Project Structure
```
src/
  components/
    ui/        # Reusable UI primitives
    Layout.jsx # Layout wrapper with Sidebar + Topbar
  pages/       # Route-level pages
  context/     # React Context providers (Auth, Personnel, Payroll)
  lib/         # Domain utilities (e.g. payroll calculations)
  main.jsx     # App bootstrap
  App.jsx      # Router + Providers
```

## Payroll Calculation (Demo Logic)
```
Allowances:
  housing  = 25% of base
  transport = 15% of base
  uniform  = 5% of base
Deductions:
  pension = 7.5% of base
  tax     = 10% of (base + allowances)
  nhf     = 2.5% of base
```
Real Nigerian payroll/tax computation is more complex. Replace with authoritative formulas before production use.

## Getting Started
Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Running Tests (placeholder)
```bash
npm test
```
Add tests under `tests/` or alongside modules using `*.test.js` naming.

## Environment Variables
Not required yet. For future backend integration you may introduce:
```
VITE_API_BASE_URL=https://api.example.com
```

## Security Notice
This prototype does NOT implement real authentication, authorization, input validation hardening, audit logging, or secure data storage. Do not deploy as-is with real personnel data.

## Contributing / Next Steps
1. Expand rank/grade pay scale config in Settings
2. Add persistent backend (Node + PostgreSQL or NestJS + Prisma)
3. Implement authentication & role-based access (admin, finance, auditor)
4. Add pagination & filtering to Personnel
5. Introduce form validation (React Hook Form + Zod)
6. Add printing/export (CSV/PDF) for payroll runs
7. Enrich test coverage (utilities + component rendering + routing guards)

## License
Educational use example. Add your preferred license file.
