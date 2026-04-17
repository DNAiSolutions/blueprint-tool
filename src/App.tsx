import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionProvider } from "@/hooks/useSession";
import { ClientContextProvider } from "@/hooks/useClientContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Admin / Staff pages
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Content from "./pages/Content";
import Websites from "./pages/Websites";
import LeadEngines from "./pages/LeadEngines";
import LeadEngineDetail from "./pages/LeadEngineDetail";
import Leads from "./pages/Leads";
import AICommand from "./pages/AICommand";
import Finances from "./pages/Finances";
import Automations from "./pages/Automations";
import SettingsPage from "./pages/Settings";
import Canvas from "./pages/Canvas";
import UsersSettings from "./pages/settings/UsersSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WebhookLog from "./pages/clients/WebhookLog";
import ClientHealth from "./pages/clients/ClientHealth";
import CostLedger from "./pages/clients/CostLedger";
import TemplateLibrary from "./pages/clients/TemplateLibrary";
import OnboardingPipeline from "./pages/clients/OnboardingPipeline";

// Client Portal pages
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalContent from "./pages/portal/PortalContent";
import PortalWebsite from "./pages/portal/PortalWebsite";
import PortalBrand from "./pages/portal/PortalBrand";
import PortalOnboarding from "./pages/portal/PortalOnboarding";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalReviews from "./pages/portal/PortalReviews";
import PortalEducation from "./pages/portal/PortalEducation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SessionProvider>
          <ClientContextProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/auth" element={<Auth />} />

              {/* Staff-only routes — clients auto-redirect to /portal */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute requireStaff><Pipeline /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute requireStaff><Projects /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute requireStaff><ProjectDetail /></ProtectedRoute>} />
              <Route path="/content" element={<ProtectedRoute requireStaff><Content /></ProtectedRoute>} />
              <Route path="/websites" element={<ProtectedRoute requireStaff><Websites /></ProtectedRoute>} />
              <Route path="/lead-engines" element={<ProtectedRoute requireStaff><LeadEngines /></ProtectedRoute>} />
              <Route path="/lead-engines/:id" element={<ProtectedRoute requireStaff><LeadEngineDetail /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute requireStaff><Leads /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute requireStaff><AICommand /></ProtectedRoute>} />

              {/* Clients hub — nested sub-pages for health, onboarding, costs, templates */}
              <Route path="/clients" element={<ProtectedRoute requireStaff><Pipeline /></ProtectedRoute>} />
              <Route path="/clients/health" element={<ProtectedRoute requireStaff><ClientHealth /></ProtectedRoute>} />
              <Route path="/clients/onboarding" element={<ProtectedRoute requireStaff><OnboardingPipeline /></ProtectedRoute>} />
              <Route path="/clients/costs" element={<ProtectedRoute requireStaff><CostLedger /></ProtectedRoute>} />
              <Route path="/clients/templates" element={<ProtectedRoute requireStaff><TemplateLibrary /></ProtectedRoute>} />
              <Route path="/clients/webhooks" element={<ProtectedRoute requireStaff><WebhookLog /></ProtectedRoute>} />

              {/* Settings hub — absorbs automations, canvas, users */}
              <Route path="/settings" element={<ProtectedRoute requireStaff><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/automations" element={<ProtectedRoute requireStaff><Automations /></ProtectedRoute>} />
              <Route path="/settings/canvas" element={<ProtectedRoute requireStaff><Canvas /></ProtectedRoute>} />
              <Route path="/settings/canvas/:sessionId" element={<ProtectedRoute requireStaff><Canvas /></ProtectedRoute>} />
              <Route path="/settings/users" element={<ProtectedRoute requireAdmin><UsersSettings /></ProtectedRoute>} />

              {/* Legacy routes — keep working for bookmarks/links */}
              <Route path="/finances" element={<ProtectedRoute requireStaff><Finances /></ProtectedRoute>} />
              <Route path="/automations" element={<ProtectedRoute requireStaff><Automations /></ProtectedRoute>} />
              <Route path="/canvas" element={<ProtectedRoute requireStaff><Canvas /></ProtectedRoute>} />
              <Route path="/canvas/:sessionId" element={<ProtectedRoute requireStaff><Canvas /></ProtectedRoute>} />

              {/* Client Portal routes */}
              <Route path="/portal" element={<ProtectedRoute requireClient><PortalDashboard /></ProtectedRoute>} />
              <Route path="/portal/content" element={<ProtectedRoute requireClient><PortalContent /></ProtectedRoute>} />
              <Route path="/portal/website" element={<ProtectedRoute requireClient><PortalWebsite /></ProtectedRoute>} />
              <Route path="/portal/brand" element={<ProtectedRoute requireClient><PortalBrand /></ProtectedRoute>} />
              <Route path="/portal/onboarding" element={<ProtectedRoute requireClient><PortalOnboarding /></ProtectedRoute>} />
              <Route path="/portal/billing" element={<ProtectedRoute requireClient><PortalBilling /></ProtectedRoute>} />
              <Route path="/portal/reviews" element={<ProtectedRoute requireClient><PortalReviews /></ProtectedRoute>} />
              <Route path="/portal/education" element={<ProtectedRoute requireClient><PortalEducation /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </ClientContextProvider>
        </SessionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
