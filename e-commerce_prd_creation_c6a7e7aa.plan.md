---
name: E-commerce PRD Creation
overview: "Create a comprehensive PRD.md that captures all gathered requirements for the Heir e-commerce platform: a single-vendor physical product store with React/Next.js/Supabase, QPay payments, bilingual (EN/MN), full admin dashboard, and optional limited drops."
todos: []
isProject: false
---

# E-commerce PRD Creation Plan

## Summary of Gathered Requirements


| Area                  | Decision                                                |
| --------------------- | ------------------------------------------------------- |
| **Product type**      | Physical products                                       |
| **Vendor model**      | Single vendor                                           |
| **Customer accounts** | Required to checkout                                    |
| **Auth**              | Email + password + social login                         |
| **Payment**           | QPay (Mongolia)                                         |
| **Tech stack**        | React, Next.js API routes, Supabase                     |
| **Inventory**         | Full (stock tracking, low-stock alerts)                 |
| **Shipping**          | Handled outside website (contract-based)                |
| **Admin**             | Full dashboard (products, orders, customers, analytics) |
| **Currency**          | MNT                                                     |
| **Languages**         | English + Mongolian                                     |
| **Hosting**           | Vercel                                                  |
| **Design reference**  | To be shared when building                              |


---

## Proposed PRD Structure

The PRD will be created at `[PRD.md](PRD.md)` with the following sections:

### 1. Project Overview

- Product name (Heir), vision, target audience
- High-level architecture diagram (Mermaid)

### 2. Tech Stack

- **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes, Server Actions
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + social providers)
- **Payments:** QPay integration (Mongolian Tugrik)
- **Hosting:** Vercel
- **i18n:** next-intl or similar for EN/MN

### 3. User Roles & Personas

- Customer (browsing, checkout, order history)
- Admin (full dashboard access)

### 4. Page Specifications


| Page                     | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| **Landing**              | Hero, featured products, CTAs (reference design to be provided) |
| **Store**                | Product listing, filters, search                                |
| **Product**              | Single product detail, add to cart, variant selection           |
| **Checkout**             | Cart review, shipping info, QPay payment                        |
| **Drop page** (optional) | Limited-time product launches                                   |
| **Admin**                | Products, orders, customers, analytics                          |


### 5. Core Features

- Product catalog with variants (size, color, etc.)
- Cart and checkout flow
- User authentication (email + Google/social)
- Order management
- Inventory tracking with low-stock alerts
- Bilingual UI (EN/MN)
- QPay payment integration

### 6. Data Model (High-Level)

- Users, Products, Orders, OrderItems, Cart, Inventory
- Supabase schema outline

### 7. Integrations

- QPay API (invoice creation, payment confirmation)
- Supabase Auth (OAuth providers)
- Optional: email service for order confirmations

### 8. Non-Functional Requirements

- Responsive (mobile-first)
- SEO considerations
- Performance targets

### 9. Phases / MVP Scope

- Phase 1: Landing, store, product, basic checkout
- Phase 2: Admin dashboard, full order flow
- Phase 3: Limited drops, analytics, polish

### 10. Open Questions & Assumptions

- QPay merchant onboarding timeline
- Exact OAuth providers (Google confirmed; others?)
- Reference design handoff process

---

## Deliverable

A single `[PRD.md](PRD.md)` file at the project root, written in Markdown with clear sections, tables, and a Mermaid architecture diagram. The PRD will serve as the source of truth before implementation begins.

---

## Next Steps After PRD Approval

1. You share the landing page reference image when ready to build
2. Initialize Next.js project with chosen stack
3. Set up Supabase project and schema
4. Implement auth and core pages per PRD phases

