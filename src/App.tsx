
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { DatabaseProvider } from "./context/DatabaseContext";
import { useEffect } from "react";
import { migrateLocalStorageToSupabase } from "./utils/migrateInitialData";

// Pages
import Home from "./pages/Home";
import ReportPage from "./pages/ReportPage";
import StatisticsPage from "./pages/StatisticsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CallSignsPage from "./pages/admin/CallSignsPage";
import ApprovalPage from "./pages/admin/ApprovalPage";
import EventsPage from "./pages/admin/EventsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    // Migrate data from localStorage to Supabase on first load
    migrateLocalStorageToSupabase();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/callsigns" element={<CallSignsPage />} />
        <Route path="/admin/approve" element={<ApprovalPage />} />
        <Route path="/admin/events" element={<EventsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DatabaseProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </DatabaseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
