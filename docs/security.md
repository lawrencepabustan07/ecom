# Security Threat Model

## System Summary
Meridian Atelier is a single-region e-commerce storefront built with Next.js, Prisma, SQLite, Auth.js, and Stripe. The application supports account creation, authenticated cart management, wishlist persistence, checkout, and order history.

## Data Flow
1. Visitors browse the public catalog and product detail pages.
2. Customers create accounts or sign in through credentials or Google.
3. Authenticated users add variants to a Prisma-backed cart and wishlist.
4. Checkout collects shipping details, creates an order, and hands payment collection to Stripe Checkout.
5. Successful payment updates local order/payment records and triggers transactional email hooks.

## Attack Surfaces
- Public route query parameters for catalog search and filtering
- Auth forms and OAuth callback handling
- Server actions for cart, wishlist, profile, and checkout mutations
- Prisma database access for users, carts, and orders
- Stripe session creation and success callback handling
- Environment variables used for auth and payment secrets

## Mitigations
- Input validation: all auth, cart, profile, and checkout mutations are validated with Zod.
- Authentication: account, cart, wishlist, and checkout mutations require a valid Auth.js session.
- Authorization: user-scoped reads and writes filter by the authenticated user ID.
- Least privilege: Stripe and auth secrets are sourced from environment variables only.
- Sensitive data: passwords are hashed with bcrypt; payment card collection is delegated to Stripe Checkout.
- Transport security: production deployment must enforce HTTPS and secure cookies.
- OWASP Top 10 focus:
  - Injection: Prisma parameterization plus strict schema validation
  - Broken authentication: Auth.js session management and hashed credentials
  - Sensitive data exposure: no card storage, env-based secret handling
  - Security misconfiguration: checked-in env example, CI scanning, documented secret handling
  - Vulnerable dependencies: CI dependency review and regular updates expected

## Required Operational Controls
- Run `gitleaks` pre-commit and in CI.
- Enforce unit-test coverage in CI with `vitest` thresholds set to at least 80% across covered security-relevant library logic.
- Generate SBOM artifacts in CI using CycloneDX.
- Run GitHub CodeQL and dependency review in the `sast.yml` workflow.
- Reject builds when `npm audit` reports high or critical production dependency findings.
- Run OWASP ZAP baseline scanning against the locally started application in the `dast.yml` workflow.
- Add IaC scanning and container scanning when deployment assets are introduced.
