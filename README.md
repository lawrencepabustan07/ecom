# Meridian Atelier

Meridian Atelier is a Next.js storefront MVP for a premium e-commerce experience. It includes:

- product catalog and product detail pages
- Auth.js authentication with credentials and Google
- Prisma + SQLite persistence
- cart, wishlist, checkout, and order history
- Stripe Checkout integration
- unit and E2E test scaffolding

## Quick Start

1. Copy `.env.example` to `.env.local` and fill in secrets.
2. Install dependencies with `npm.cmd install`.
3. Install `gitleaks` locally and enable the pre-commit hook if this folder is initialized as a git repository.
4. Run `npm.cmd run db:generate`.
5. Run `npm.cmd run db:migrate -- --name init`.
6. Run `npm.cmd run db:seed`.
7. Start the app with `npm.cmd run dev`.

## Seed Account

- `customer@example.com`
- `Password123!`
