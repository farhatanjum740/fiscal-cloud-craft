
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceEditor from "./pages/InvoiceEditor";
import CreditNoteEditor from "./pages/CreditNoteEditor";
import Customers from "./pages/Customers";
import CustomerEditor from "./pages/CustomerEditor";
import Products from "./pages/Products";
import ProductEditor from "./pages/ProductEditor";
import CompanyProfile from "./pages/CompanyProfile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import React from "react";

// Create a query client with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      onError: (error) => {
        console.error("Query error:", error);
      }
    }
  }
});

// Error boundary for the entire app
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm mb-4">
              {this.state.error?.message || "Unknown error"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/new" element={<InvoiceEditor />} />
                <Route path="invoices/edit/:id" element={<InvoiceEditor />} />
                <Route path="invoices/view/:id" element={<InvoiceEditor />} />
                <Route path="credit-notes/new" element={<CreditNoteEditor />} />
                <Route path="credit-notes/edit/:id" element={<CreditNoteEditor />} />
                <Route path="credit-notes/view/:id" element={<CreditNoteEditor />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/new" element={<CustomerEditor />} />
                <Route path="customers/edit/:id" element={<CustomerEditor />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductEditor />} />
                <Route path="products/edit/:id" element={<ProductEditor />} />
                <Route path="settings/company" element={<CompanyProfile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
