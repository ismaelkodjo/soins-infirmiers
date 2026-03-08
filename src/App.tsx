import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/PatientAppointments";
import PatientDocuments from "./pages/PatientDocuments";
import PatientHealth from "./pages/PatientHealth";
import PatientProfile from "./pages/PatientProfile";
import ArticleDetail from "./pages/ArticleDetail";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/blog/:slug" element={<ArticleDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/espace-patient"
              element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}
            />
            <Route
              path="/espace-patient/rendez-vous"
              element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>}
            />
            <Route
              path="/espace-patient/documents"
              element={<ProtectedRoute><PatientDocuments /></ProtectedRoute>}
            />
            <Route
              path="/espace-patient/suivi"
              element={<ProtectedRoute><PatientHealth /></ProtectedRoute>}
            />
            <Route
              path="/espace-patient/profil"
              element={<ProtectedRoute><PatientProfile /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
