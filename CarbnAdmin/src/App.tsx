import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/auth/ProtectedAdminRoute";

import AdminLoginPage from "./pages/AdminLoginPage";
import InitialAdminSignupPage from "./pages/InitialAdminSignupPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import SupportPage from "./pages/SupportPage";

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AdminAuthProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/setup" element={<InitialAdminSignupPage />} />

            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/applications" element={<ApplicationsPage />} />
              <Route path="/admin/applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="/admin/support" element={<SupportPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AdminAuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
