import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ServiceCallsPage from "@/pages/ServiceCallsPage";
import InsurancePage from "@/pages/InsurancePage";
import VehiclesPage from "@/pages/VehiclesPage";
import AgentsPage from "@/pages/AgentsPage";
import UploadPage from "@/pages/UploadPage";
import ReportsPage from "@/pages/ReportsPage";
import MyCallsPage from "@/pages/MyCallsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/service-calls" element={<ServiceCallsPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/my-calls" element={<MyCallsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show chat button only for authenticated users */}
      {isAuthenticated && <FloatingChatButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
