# 🧾 SmartShop Compare

> **"Shop Smart, Compare Better"**

*An advanced, multi-store aggregator bridging the gap between value-focused buyers and multi-channel retailers.*

---

## 🚀 Project Overview

SmartShop Compare is a comprehensive **Multi-Store E-Commerce & Price Comparison Platform**. It aggregates product listings from multiple vendors, empowers buyers to effortlessly find the best deals, and provides sellers with an integrated hub to manage their digital storefronts. The application features intelligent AI-assisted buying recommendations that highlight the "Best Value" choices across competing stores.

👉 **CRITICAL: This repository contains the FRONTEND Phase 1 implementation ONLY.** 

There is no live database, active payment processor, or secure backend instance attached. Data is completely mocked locally via the service abstraction layer.

---

## 📚 Master Documentation Suite

This project contains enterprise-grade documentation intended for teams scaling the codebase.

🔗 **[View the Complete Frontend Architecture & Systems Manual](./docs/FRONTEND_DOCUMENTATION.md)**

The master documentation suite covers:
* Application Architecture & Routing Maps
* State Management & Component Ecosystem
* API Contracts
* Testing, Error Handling & Response Bounds
* Deployment Guides

---

## 🎯 Key Capabilities

### Buyer Interface
* Advanced multi-faceted product search grids.
* Interactive side-by-side vendor pricing charts.
* Highlighted AI recommendation cards identifying the optimal purchase.
* Cart management UI preparing for checkout intents.

### Admin Features
* **Dashboard UI:** Platform-wide metrics, active store counts, and revenue overviews.
* **User Management UI:** Interface to toggle active users, verify seller applications, and moderate platform participants.

### General Features
* **Responsive Landing Page:** Engaging hero sections and featured promotional blocks.
* **Authentication UI:** Comprehensive Login and Signup flows catering to both Buyer and Seller roles.

---

## 🏗️ Tech Stack

This platform is built utilizing modern web technologies ensuring speed, type-safety, and incredible user experiences:

* **Next.js** 
* **TypeScript**
* **Tailwind CSS**
* **Zustand / Redux**
* **React Hook Form + Zod**

---

## 📂 Project Structure

The project follows a scalable and modular architecture design:

```
/src
 ├── /pages       # Application views and routing structure
 ├── /components  # Reusable UI elements (Buttons, Cards, Navbars)
 ├── /services    # API interaction layer and mock data
 ├── /store       # Global state management (Zustand configuration)
 ├── /types       # TypeScript interfaces and type definitions
 └── /lib         # Utility functions and shared helpers
```* **Next.js App Router** logic implementations
* **TypeScript** (Strict Mode Enabled)
* **Tailwind CSS** (v3.4 with extended brand layouts)
* **Zustand** (Rapid, slice-based state management)
* **React Hook Form & Zod** (Rigorous payload validation prior to mock-API interception)


---

## ⚙️ Quick Start

### Installation

Clone the repository to your local machine:
```bash
git clone https://github.com/Aimtech7/smartshop-compare.git
cd smartshop-compare
```

Install the dependencies:
```bash
npm install
```

### Scripts

Start the local development server:
```bash
npm run dev
```

Build the application for production:
```bash
npm run build
```

---

## 🔌 API Integration

* Currently, the application relies exclusively on **mock APIs**.
* An API layer abstraction is already prepared within the `/src/services` directory.
* The real backend will be seamlessly integrated into this service layer during the backend development phase, dropping right into the existing async hooks.

---

## 🧩 Database Schema (Frontend Support)

* A type schema file (`/src/types/index.ts`) exists as a blueprint to guide upcoming backend integrations.
* **The Database is NOT implemented in this frontend repository.**
* The internal typings act as a definitive map for the backend team to align data payloads correctly with the UI components.

---

## 🎨 UI/UX Principles

* **Responsive Design:** Fluid layouts ensuring a flawless experience from mobile to ultra-wide desktop monitors.
* **Clean Layout:** Minimalist spacing, high contrast, and a focus on content clarity.
* **Accessibility Considerations:** ARIA attributes, semantic HTML tags, and keyboard-compliant navigation mapping.
* **Fast Performance:** Optimized assets, lazy-loaded page routing, and skeleton loaders for perceivable load speeds.

---

## 📊 Implementation Status

* **Completed:** Core UI layouts (Auth, Admin Dashboard, Buyer Dashboard, Seller Dashboard, Landing Page, Cart, Search, Product Details).
* **In Progress:** Polishing UI micro-animations and ensuring dark-mode contrast standards.
* **Pending:** Real API bindings, backend service integration, and live database connection.

---

## 🔄 Changelog

Our development timeline, UI iteration history, and version milestones are documented thoroughly in the **[Frontend Change Log & Version Tracker](./frontend_changelog.md)**.

---

## 🚧 Limitations (CRITICAL)

Please be aware of the following frontend scoping limitations:
* **No real backend yet:** Data is volatile and simulated locally.
* **No real payment integration:** The checkout flow is a UI mock and processes no actual transactions.
* **No real authentication:** Auth forms simulate login but do not currently yield secure JWT access tokens.

---

## 🛣️ Roadmap

1. **Backend Development Phase:** Map Node.js/PostgreSQL logic to the defined TS interfaces.
2. **End-to-End Testing:** Implement Cypress or Playwright frameworks for full integration tests.
3. **Staging Deployment:** Push the joined stack to a Vercel/AWS staging environment for QA.
4. **Production Release:** Final optimization and public launch.

---

## 🤝 Contribution Guidelines

1. Ensure all code changes match the ESLint configuration and Prettier styles.
2. Rely strictly on `lucide-react` for icon usage.
3. Keep component state local unless necessary for the global `Zustand` store.
4. Submit pull requests pointing to the `develop` branch for review.

---

## 📄 License

MIT License. Copyright (c) 2026 AIMTECH.
