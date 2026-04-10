# SmartShop Compare - Frontend Documentation Suite

Welcome to the definitive frontend engineering manual for the SmartShop Compare platform. This document encapsulates the entire architecture, design patterns, state handling, UI/UX policies, and deployment practices for Phase 1 (Frontend Layouts & Interactions).

> **WARNING:** This module implements **Frontend views and application state ONLY**. Backend integrations, database connections, and active payment gateways are not part of this repository phase.

---

## 1. 📘 FRONTEND OVERVIEW

### Purpose
The frontend serves as the interactive shell for SmartShop Compare. It bridges the gap between shoppers seeking the best deals across multiple vendors and the sellers looking to manage inventory on the platform.

### Scope
Handles client-side routing, state management, form validation, animated UI interactions, and simulated mock-API data fetching. Back-end responsibilities (secure authentication tokens, live database mutations, active payment processing) fall strictly outside this scope.

### Supported Roles
* **Buyer**: Unauthenticated and authenticated users looking to search, compare prices, and purchase products.
* **Seller**: Vendors authorized to access the Vendor Hub, manage store profiles, upload bulk inventory, and process active orders.
* **Admin**: Platform moderators responsible for tracking master metrics, toggling user statuses, and vetting new vendor applications.

### Key Responsibilities
* Delivering millisecond-response navigation.
* Processing complex cart calculations in local state.
* Showcasing an elegant, Shopify-tier aesthetic.

---

## 2. 🏗️ FRONTEND ARCHITECTURE

### Next.js App Router Structure
The application utilizes the modern Next.js App Router (`/app` directory) pattern enabling React Server Components (RSC) and highly nested, optimized route layouts.
*(Note: While the boilerplate was initialized on Vite, the deployment target architecture follows Next.js App routing conventions.)*

### Folder Structure Explanation
```
/app              # Next.js App Router (pages, layouts, loading boundaries, specific error handling)
/components       # Agnostic UI chunks (global buttons, inputs, layouts)
  /ui             # Headless UI primitives (Radix) + Tailwind wrappers
  /features       # Domain-specific components (e.g., CartSummary, ReviewList)
/services         # API contract abstractions (currently pointing to mock arrays)
/store            # Global state bounds (Zustand stores for Cart, User)
/config           # Schemas, environment maps, and static site metadata
/types            # TypeScript strict definitions and DB mimicking schemas
```

### Component Architecture
We employ the **Atomic Design Paradigm**:
1. **Atoms**: Low-level generic wrappers (Button, Input).
2. **Molecules**: Minor grouped behaviors (SearchBar, RatingStars).
3. **Organisms**: Domain-heavy sections (PriceComparisonTable, ProductGrid).

### State Management
* **Zustand**: Fast, slice-based global state for the Shopping Cart, authenticated user metadata, and UI sidebar toggles.
* **React Hook Form**: Form state caching, controlled inputs, and real-time field validation mapped explicitly to Zod schemas.

### API Service Layer (Mocked)
All API calls pass through specific hook files (`useProducts`, `useAuth`). The `/services/api.ts` actively resolving `Promises` asynchronously with hardcoded JSON arrays to emulate network latency and response bounds.

### Routing System
File-based nested routing ensuring code-splitting per chunk.
* Public paths: `/`, `/search`, `/product/[id]`
* Protected paths (Middleware guarded): `/buyer/*`, `/seller/*`, `/admin/*`

---

## 3. 🎨 UI/UX DESIGN SYSTEM

### Design Principles
* **Clean & Modern**: Leveraging generous whitespace and distinct typography similar to Shopify.
* **Action Driven**: CTAs are prominently positioned above the fold. 
* **Trust Factors**: Utilizing verified badges, clear seller ratings, and transparent AI reasoning.

### Color Palette
* **Primary**: `hsl(var(--primary))` - High-conversion blue/indigo for main actions.
* **Background**: `hsl(var(--background))` - Crisp white (light mode) / Deep slate (dark mode).
* **Accent**: `hsl(var(--accent))` - Subtle gray highlights for secondary actions.
* **Validation**: Success (Green), Warning (Amber), Destructive (Crimson).

### Typography
* **Font Family**: Inter (System sans-serif fallback).
* **Headings**: Heavy weight fonts for landing pages; optimized tracking for legibility.

### Spacing System
Tailwind's 4px grid system (`p-4` = 16px).
Container max-width capped at 1280px (`max-w-7xl`).

### Accessibility (WCAG Basics)
* ARIA attributes placed on all generic headless components.
* Strict `tabIndex` flow across dynamic grids and search sidebars.
* Color contrast calculated to exceed AAA standards for text on backgrounds.

---

## 4. 📄 PAGE-BY-PAGE DOCUMENTATION

### Landing Page (`/app/page.tsx`)
* **Purpose**: Primary entrance hook. Drives traffic to Search and categorizes trending hardware.
* **Components**: `HeroSection`, `CategoryScroller`, `TrendingGrid`, `PlatformFeatures`.
* **User Interactions**: Scrolling, clicking CTAs directly routing to `/search` or `/auth/signup`.

### Authentication (`/app/auth/...`)
* **Purpose**: Onboarding interface.
* **Buyer Signup**: Standard flow (Name, Email, Password). 
* **Seller Signup**: Enriched flow demanding **Business Name**, **Tax ID**, and strict consensus on **Commission Checkbox** policies.
* **Edge Cases**: Email already exists, weak password feedback. 

### Buyer Pages
* **Search Results**: Faceted search filtering components triggering debounce re-renders. 
* **Price Comparison Chart**: Custom grid comparing 3+ vendors side-by-side with lowest-price indicators.
* **AI Recommendation UI**: Distinct highlighted card outlining exactly *why* a particular vendor is the safest/best choice.
* **Cart & Checkout**: Real-time total increments, item removal, and mock checkout delivery form.

### Seller Pages (`/app/seller/...`)
* **Vendor Hub Dashboard**: Visual charts depicting incoming traffic vs. conversions. 
* **Product Management**: Data table utilizing pagination to edit stock levels.
* **Bulk Upload UI**: Drag-and-drop zone validating `.csv` mimetypes prior to simulated POST hooks.

### Admin Pages (`/app/admin/...`)
* **Dashboard**: Platform health metrics across system clusters.
* **User Management UI**: Table allowing toggling `isActive` properties to suspend malicious users instantly.

---

## 5. 🔀 USER FLOW DOCUMENTATION

### Buyer Journey
1. Lands on homepage.
2. Uses primary search bar or clicks a featured category.
3. Views `ProductPage`; reads AI's best-value logic and seller reviews.
4. Adds preferred vendor's item to Cart.
5. Proceeds to `/cart`, confirms quantities.
6. Authenticates (if guest) and finalizes mock checkout.

### Seller Journey
1. Navigates to `/how-to-sell` to digest terms.
2. Registers specifically via `/auth/signup?role=seller`.
3. Lands on empty Vendor Hub, prompted to complete onboarding.
4. Uses Bulk Upload to populate 50+ items rapidly.
5. Monitors newly appearing Dashboard statistics over proceeding simulated days.

### Admin Actions
1. Logs into secured `/admin` portal.
2. Checks pending Seller applications in notification tray.
3. Reviews metrics in master charts.
4. Navigates to User Table to deactivate flagged accounts via toggle switches.

---

## 6. 🧩 COMPONENT DOCUMENTATION

### Button
* **Props**: `size` (sm | md | lg), `variant` (default | destructive | ghost | outline)
* **Usage**: Extends HTML button, passing standard `React.ButtonHTMLAttributes`.

### ProductCard
* **Props**: `id`, `name`, `price`, `thumbnail`, `rating`, `sellerCount`.
* **Usage**: Repeated constantly throughout Search and Landing grids pointing to `/product/[id]`.

### SearchBar
* **Props**: `onSearch(query: string)`, `debounceMs`.
* **Usage**: Reusable input catching keystrokes and emitting safe URL queries.

### PriceComparisonTable
* **Props**: `listings`: Array of objects containing vendor info, stock, and pricing.
* **Usage**: Placed inside `ProductPage` to map rows for lowest to highest pricing arrays.

### Forms & Modals
* Leverage Radix Unstyled elements for accessible nested focus trapping.

---

## 7. 🧠 STATE MANAGEMENT 

### Global State Structure (Zustand slices)
* **Auth State**: `{ user: User | null, isAuthenticated: boolean, token: string }`
* **Cart State**: `{ items: CartItem[], addItem(item), removeItem(id), clearCart() }`
* **UI State**: `{ sidebarOpen: boolean, toggleSidebar() }`

*(Product catalogs fetching handles exclusively through React Query / SWR local memory cache rather than heavy global state).*

---

## 8. 📡 FRONTEND API CONTRACT

*(Simulated targets that await backend configuration).*

*   **Auth Payload**
    *   `POST /api/auth/login`
    *   **Req**: `{ email, password }`
    *   **Res**: `{ token, user: { id, role, name } }`

*   **Products Listing**
    *   `GET /api/products?q=query&category=cat&page=1`
    *   **Req**: Params interface.
    *   **Res**: `{ data: Product[], total: number, page: number }`

*   **Checkout Intent**
    *   `POST /api/orders`
    *   **Req**: `{ items: [], paymentMethod: 'cc', totalPrice: number }`
    *   **Res**: `{ orderId: string, status: 'confirmed' }`

---

## 9. 📊 FRONTEND IMPLEMENTATION TRACKER

| Feature ID | Feature Name | UI Requirement | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Auth | Login, Signup + Vendor Role checks | ✅ | Integrated Hook Forms |
| FR-02 | Vendor UI | Dashboard Stats, Table grids | ✅ | Responsive implemented |
| FR-03 | Search | Faceted Sidebar, Grid Layout | ✅ | Debounced active |
| FR-04 | Cart | Drawer, Summary, Actions | ✅ | Bound to Zustand state |
| FR-05 | Landing | Hero, Trending | ✅ | Mobile optimization done |
| FR-06 | Reviews | Stars component, Input text | ✅ | Connected strictly UI layout |
| FR-07 | Static | About, Help accordions | ✅ | Fully built |
| FR-08 | Admin | User toggle tables, metric charts | ✅ | Layout completed safely |

---

## 10. 🔄 FRONTEND CHANGELOG SYSTEM

**Versioning Format:** [Semantic Versioning (MAJOR.MINOR.PATCH)](https://semver.org)
**Change Log Structure:**
1. Date & Target version
2. Categorized points: `🎨 UI Added`, `✨ Improved`, `🐛 Bug Fixes`

*Example:*
> **v1.0.0 - 2026-04-06**
> * 🎨 UI Added: Vendor Bulk upload interface layout.
> * ✨ Improved: Button hover animations across Cart.

---

## 11. ⚠️ ERROR HANDLING & EDGE CASES

* **Empty States**: If a search yields zero results, render `EmptyIllustration` component prompting to clear search filters.
* **Invalid Inputs**: Form elements bounce Red bounds utilizing `zod` schemas prior to ever triggering API logic.
* **404 Handling**: Unmatched Next.js routes trigger the central `NotFound` layout offering quick redirect links back to Home or Support.
* **Out of Stock**: Disabled 'Add to Cart' button rendered in grey scale; tooltip actively displays 'Awaiting Restock'.

---

## 12. 📱 RESPONSIVENESS

The platform adheres to a Mobile-First implementation strategy.
* **Mobile (< 768px)**: Hidden sidebars pushed into Hamburger Menus. Grids drop strictly to 1 column vertical stacking.
* **Tablet (768px - 1024px)**: 2-column Product Grids, Sidebar visible but minimized.
* **Desktop (> 1024px)**: Massive utilization of horizontal screen space; 4-column item grids, persistent robust sidebars, and wide table spreads.

---

## 13. 🔐 FRONTEND SECURITY PRACTICES

* **Input Validation**: Client-side execution of `zod` preventing XSS characters actively from entering text arrays.
* **XSS Prevention**: React implicitly sanitizes text bindings `{data}`. Developer guidelines rigidly forbid utilization of `dangerouslySetInnerHTML`.
* **State Protection**: Cart bounds mathematically verify price outputs visually, although backend logic serves entirely as the final gatekeeper for manipulated data limits.

---

## 14. 🧭 ROUTING & NAVIGATION MAP

```text
Public Accessible:
/
/search
/product/[id]
/about
/help
/how-to-sell

Authentication:
/auth/login
/auth/signup

Protected Buyer Layers:
/cart
/buyer (Overview)
/buyer/orders
/buyer/wishlist

Protected Seller Layers:
/seller (Dashboard Hub)
/seller/products
/seller/orders
/seller/settings

Restricted Admin Layers:
/admin (Dashboard Hub)
/admin/users
```

---

## 15. 🧪 FRONTEND TEST PLAN

* **Frameworks**: Vitest (Unit), Playwright (E2E Integration).
* **What to Test**: Core component rendering, Zustand bounds transitions, URL parameter parsing.
* **Key UI Scenarios**:
    * Ensuring adding item X to Cart increments the visual badge.
    * Verifying Seller commission checkbox validation intercepts form requests if unchecked.
* **Form Validations**: Checking negative numbers in cart quantities or missing `@` in email logins.

---

## 16. ⚙️ ENVIRONMENT & CONFIG

The `.env` abstraction schema (utilized strictly as `VITE_` or `NEXT_PUBLIC_` prefixes based on runtime build).

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_STRIPE_KEY=pk_test_sample_mock_only
```

---

## 17. 🚀 DEPLOYMENT PREPARATION

### Build Steps
1. Run `npm run lint` catching any strict typing failures.
2. Execute `npm run build` triggering production obfuscation and chunks.

### Optimization
* Image handling wrapped specifically mapping correct aspect ratios minimizing CLS (Cumulative Layout Shifts).
* Heavy charting libraries (Recharts) lazily loaded reducing Main Thread blocking.

### Hosting (Vercel)
The infrastructure is heavily formatted to deploy continuously directly via Vercel edges.
Connecting GitHub branch `main`, Vercel naturally infers build steps and actively protects preview bounds automatically.
