import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminPages from "./pages/admin/AdminPages";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminNotifications from "./pages/admin/AdminNotifications";
import StaffAuth from "./pages/StaffAuth";
import StaffProtectedRoute from "./components/StaffProtectedRoute";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffHome from "./pages/staff/StaffHome";
import StaffOrdonnances from "./pages/staff/StaffOrdonnances";
import StaffAppointments from "./pages/staff/StaffAppointments";
import StaffLabResults from "./pages/staff/StaffLabResults";
import DynamicPage from "./pages/DynamicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="produits" element={<AdminProducts />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/blog/:slug" element={<ArticleDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/espace-patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
        <Route path="/espace-patient/rendez-vous" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
        <Route path="/espace-patient/documents" element={<ProtectedRoute><PatientDocuments /></ProtectedRoute>} />
        <Route path="/espace-patient/suivi" element={<ProtectedRoute><PatientHealth /></ProtectedRoute>} />
        <Route path="/espace-patient/profil" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
        <Route path="/page/:slug" element={<DynamicPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
