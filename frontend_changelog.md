# Frontend Change Log & Version Tracker

This document tracks all frontend development history, including UI/UX modifications, new components, layout enhancements, and frontend bug fixes.

---

## 📊 Version Tracking Table

| Date | Version | Change Type | Component/Page | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-03-20 | v0.1.0 | Feature | `App.tsx`, Layouts | Initial setup of main layout, Navbar, and Footer. | ✅ Completed |
| 2026-03-25 | v0.5.0 | Feature | `/auth` | Added Login and Signup UI templates with validation forms. | ✅ Completed |
| 2026-03-28 | v0.8.0 | Feature | Dashboards | Built core Admin, Buyer, and Seller dashboard layouts. | ✅ Completed |
| 2026-04-01 | v0.9.0 | Improvement | `/search`, `/cart` | Integrated advanced search filtering UI and shopping cart functionality. | ✅ Completed |
| 2026-04-05 | v0.9.5 | Feature | `/about`, `/help` | Mapped out static content pages and routed them correctly. | ✅ Completed |
| 2026-04-06 | v1.0.0 | Feature | `/product/:id` | Added Reviews UI, AI recommendation display cards. | ✅ Completed |

---

## Version 1.0.0 – 2026-04-06

### 🎨 UI Added
* **Product Review UI**: Created `ReviewCard`, `RatingStars`, and a review submission form on the product detail page.
* **AI Recommendations**: Added styled suggestion banners (`Sparkles` highlight) for best value store listings.
* **Store Listing Component**: Included `StoreListingCard` specifically for price comparison layout.

### ✨ UI Improved
* **Dashboards Fine-Tuning**: Updated Admin, Buyer, and Seller dashboards to use consistent grid sizing and updated lucide-react icons.
* **Form Inputs**: Added focus rings and distinct error states to UI components.

### 🐛 UI Fixed
* **Table Overflows**: Prevented horizontal scrolling overflow clipping in the Admin Dashboard Users table.
* **Dialog Z-Index**: Fixed floating tooltips rendering beneath sticky headers.

### ♻️ Refactored
* **Status Badges**: Refactored status-to-color mapping logic into reusable dictionaries across all dashboards.

### ⚠️ Known UI Issues
* **Pagination**: Pagination UI controls are missing/mocked on large product search grids.
* **Dark Mode Colors**: Some secondary texts have poor contrast in dark theme.

---

## Version 0.8.0 – 2026-03-28

### 🎨 UI Added
* **Admin Dashboard**: Created `/admin` layout with overview metrics and user management table.
* **Buyer Dashboard**: Developed `/buyer` layout utilizing Tabs for Orders, Reviews, and Wishlist.
* **Seller Dashboard**: Basic scaffolding for product listings and store stats.

### ✨ UI Improved
* **Theme System**: Implemented full Tailwind configuration with unified brand colors, card radii, and spacing variables.

### 🐛 UI Fixed
* None (New feature implementations)

### ♻️ Refactored
* **Component Library**: Established base UI atoms (Button, Badge, Tabs) to eliminate repeated inline styles.

### ⚠️ Known UI Issues
* **Mobile Responsiveness**: Charts and large tables overflow or squish awkwardly on viewports under 768px.

---

## Version 0.1.0 – 2026-03-20

### 🎨 UI Added
* **Core Application Shell**: Implemented `Navbar`, `Footer`, and configured `react-router-dom`.
* **Landing Page**: Built base Hero Section and featured categories skeleton for `/`.

### ✨ UI Improved
* None

### 🐛 UI Fixed
* None

### ♻️ Refactored
* **Routing**: Extracted lazy-loaded page imports and suspended component loading in `App.tsx`.

### ⚠️ Known UI Issues
* **Loading States**: Application lacks cohesive skeleton loaders; currently relies on a generic central spinner.
