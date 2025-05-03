
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
