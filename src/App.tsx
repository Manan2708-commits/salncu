import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCertTemplates from "./pages/admin/AdminCertTemplates";
import ClubAdminDashboard from "./pages/club-admin/ClubAdminDashboard";
import CreateEvent from "./pages/club-admin/CreateEvent";
import Registrations from "./pages/club-admin/Registrations";
import ClubCertificates from "./pages/club-admin/Certificates";
import EventReport from "./pages/club-admin/EventReport";
import StudentDashboard from "./pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./stores/authStore";

const queryClient = new QueryClient();

function AuthInit() {
  const init = useAuthStore((s) => s.init);
  const initialized = useAuthStore((s) => s.initialized);
  useEffect(() => { if (!initialized) init(); }, [initialized, init]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInit />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/events" element={<Events />} />
          <Route path="/clubs" element={<Clubs />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clubs" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          
          {/* Club Admin Routes */}
          <Route path="/club-admin" element={<ClubAdminDashboard />} />
          <Route path="/club-admin/events" element={<ClubAdminDashboard />} />
          <Route path="/club-admin/create-event" element={<CreateEvent />} />
          <Route path="/club-admin/registrations" element={<ClubAdminDashboard />} />
          <Route path="/club-admin/club-profile" element={<ClubAdminDashboard />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/events" element={<Events />} />
          <Route path="/student/registered" element={<StudentDashboard />} />
          <Route path="/student/clubs" element={<Clubs />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
