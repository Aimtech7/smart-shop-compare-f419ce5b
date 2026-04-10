import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const BuyerDashboard = lazy(() => import("./pages/buyer/BuyerDashboard"));
const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AboutPage = lazy(() => import("./pages/company/AboutPage"));
const SellerDirectory = lazy(() => import("./pages/company/SellerDirectory"));
const HowToSellPage = lazy(() => import("./pages/company/HowToSellPage"));
const HelpCenter = lazy(() => import("./pages/company/HelpCenter"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/buyer" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sellers" element={<SellerDirectory />} />
            <Route path="/how-to-sell" element={<HowToSellPage />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
