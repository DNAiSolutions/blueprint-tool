import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionProvider } from "@/hooks/useSession";
import { ClientContextProvider } from "@/hooks/useClientContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Content from "./pages/Content";
import Websites from "./pages/Websites";
import Leads from "./pages/Leads";
import AICommand from "./pages/AICommand";
import Finances from "./pages/Finances";
import SettingsPage from "./pages/Settings";
import Canvas from "./pages/Canvas";
import UsersSettings from "./pages/settings/UsersSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SessionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
              <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
              <Route path="/websites" element={<ProtectedRoute><Websites /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AICommand /></ProtectedRoute>} />
              <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
              <Route path="/canvas/:sessionId" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
              <Route path="/settings/users" element={<ProtectedRoute requireAdmin><UsersSettings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
