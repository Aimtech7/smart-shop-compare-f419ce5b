# Frontend Systems Requirements Specification (SRS)

**Source:** Compiled from `SRS_Ecommerce_Platform_v3.docx` and mapped against implementation progress.
**Scope:** This document focuses strictly on the **Frontend Application**, UI/UX experiences, and client-side logic extracted from the main commercial SRS.

---

## FR-01: User Registration & Authentication
*The system shall allow new users to register as Seller or Buyer, collect data, verify emails, enforce RBAC, and support OAuth.*

- **What is done (✅):** 
  - Complete UI for `auth/login` and `auth/signup`.
  - Frontend validation and form state management.
  - **Connected to Backend:** Supabase Auth integration is complete! Real authentication, RBAC (Role-Based Access Control), and User Profiles are now active. `ProtectedRoute.tsx` wrapper secures routes.
- **Yet to be done (⏳):**
  - Implement 2FA (Two-factor authentication) UI flow (FR-01.8).
  - Add OAuth 2.0 (Google/Facebook) social login buttons and trigger logic (FR-01.5).

## FR-02: Seller Product Management & Vendor Hub
*The system shall provide a Vendor Hub for sellers to add single/bulk products and view sales analytics.*

- **What is done (✅):** 
  - Layout built for the `/seller` dashboard.
  - Mock UI for standard product tables and stats cards.
- **Yet to be done (⏳):**
  - Wire up form inputs to Supabase DB for manual product additions.
  - Implement Excel (`.xlsx`) parser on the frontend for bulk uploads (FR-02.3).
  - Add logic to display robust analytical charts based on live DB data.
  - Add 30-day price confirmation prompts.

## FR-03: Buyer Search, Price Intelligence & Comparison
*The system shall provide global search, price comparison tables, highlight lowest prices, and an AI-Assisted Buying Tool.*

- **What is done (✅):** 
  - `/search` page built with search bars, advanced filter sidebars, and product grids.
  - Product layout supports displaying prices and basic star ratings.
- **Yet to be done (⏳):**
  - Wire search inputs to hit an actual search API (Elasticsearch/Supabase RPC).
  - Build the detailed `Price Comparison Table` UI component for comparing the exact same SKU across stores.
  - Integrate the "AI-Assisted Buying Tool" visual logic (badges, recommendations).
  - Add "Price History Graph" UI component (FR-03.9).

## FR-04: Shopping Cart & Checkout
*Unified cross-store cart displaying subtotals. Integrated primary and fallback payment gateways.*

- **What is done (✅):** 
  - Cart UI (`/cart`) layout functioning with mock states. Order Summary and Item Cards are fully styled.
- **Yet to be done (⏳):**
  - Integrate stripe/payment gateway UI components directly into checkout flow.
  - Logic to aggregate carts per-vendor (split deliveries).
  - Guest checkout flow UI adjustments.

## FR-05: Landing Page
*Hero search, primary CTAs, top stores, and responsive layouts.*

- **What is done (✅):** 
  - Homepage is 100% styled.
  - Hero banners, featured categories, and promo sections are complete and correctly branded as **"The Buyer"**.
  - Responsiveness (mobile/tablet/desktop) is solid.
- **Yet to be done (⏳):**
  - Populate "Trending Products" and "Top-Rated Stores" components with live Supabase data instead of hardcoded images/mocks.

## FR-06: Social Discussion & Review Module
*Community forum, star-rated product reviews, follow stores functionality.*

- **What is done (✅):** 
  - Review UI built: display rating stars, review cards, and submission forms on the product details view (`/product/:id`).
- **Yet to be done (⏳):**
  - Discussion "threads" generic interface for community forums (FR-06.1).
  - Notification alert UI when "followed" stores add products (FR-06.6).
  - Connect review submissions strictly to verify purchase API constraints.

## FR-07: Company Profile & Static Content Pages
*Company info, Seller Directory, Supplier Directory, Help Center.*

- **What is done (✅):** 
  - Routing and UI completed for `/about`, `/help`, `/how-to-sell`, and `/sellers`.
  - Accordions for standard FAQs.
- **Yet to be done (⏳):**
  - Add dynamic Supplier Directory page and integrate forms with ticketing system for the Help Center.

## FR-08: Platform Administration Suite
*Admin dashboard for managing ecosystems, suspending accounts, settling disputes.*

- **What is done (✅):** 
  - Layout built for the `/admin` route. Includes user management tables and stat grid cards.
- **Yet to be done (⏳):**
  - Connect tables to Supabase admin role to actually execute account suspensions and approve new registered sellers (FR-08.3).
  - Advanced reporting dashboards filterable by period.
  - SEO Management UI inputs (FR-08.6).

---
### Summary
The Frontend framework, theme, and architectural components are highly complete. Auth is physically operational and linked to Supabase. The remainder of the work across Search, Cart, Admin, and Vendor branches involves hooking up the created Frontend mock data structures to live DB calls.
