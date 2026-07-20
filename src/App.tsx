import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PricingConfigProvider } from "@/contexts/PricingConfigContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import ProjectDetails from "./pages/ProjectDetails";
import PostProject from "./pages/PostProject";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminCompanyProject from "./pages/AdminCompanyProject";
import Pricing from "./pages/Pricing";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PricingConfigProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/post" element={<PostProject />} />
              <Route path="/my-listings" element={<Navigate to="/profile?tab=listings" replace />} />
              <Route path="/my-purchases" element={<Navigate to="/profile?tab=purchases" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/checkout/:orderId" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/company-projects/new" element={<AdminCompanyProject />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PricingConfigProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
