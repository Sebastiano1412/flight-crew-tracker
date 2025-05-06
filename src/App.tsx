
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ReportPage from "./pages/ReportPage";
import StatisticsPage from "./pages/StatisticsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ApprovalPage from "./pages/admin/ApprovalPage";
import CallSignsPage from "./pages/admin/CallSignsPage";
import EventsPage from "./pages/admin/EventsPage";
import NotFound from "./pages/NotFound";
import { useDatabase } from "./context/DatabaseContext";
import DatabaseConfigPage from "./pages/DatabaseConfigPage";
import { toast } from "sonner";

function App() {
  const { isAdmin, isConnected, initializeDatabase } = useDatabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  // Reindirizza alla pagina di configurazione del database se non c'è connessione
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await initializeDatabase();
        setIsInitializing(false);
      } catch (error) {
        setIsInitializing(false);
        if (location.pathname !== "/db-config") {
          toast.error("Impossibile connettersi al database. Configura la connessione.");
          navigate("/db-config");
        }
      }
    };
    
    checkConnection();
  }, [initializeDatabase, navigate, location.pathname]);

  // Proteggi le rotte admin
  const checkAdmin = () => {
    if (!isAdmin) {
      toast.error("Accesso non autorizzato");
      navigate("/admin-login");
      return false;
    }
    return true;
  };

  if (isInitializing) {
    return <div className="flex items-center justify-center h-screen">Inizializzazione database...</div>;
  }

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            !isConnected && location.pathname !== "/db-config" ? (
              <DatabaseConfigPage />
            ) : (
              <Home />
            )
          } 
        />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/db-config" element={<DatabaseConfigPage />} />
        
        {/* Rotte protette */}
        <Route 
          path="/admin" 
          element={
            isAdmin ? <ApprovalPage /> : <AdminLoginPage />
          } 
        />
        <Route 
          path="/admin/approvals" 
          element={
            isAdmin ? <ApprovalPage /> : <AdminLoginPage />
          } 
        />
        <Route 
          path="/admin/callsigns" 
          element={
            isAdmin ? <CallSignsPage /> : <AdminLoginPage />
          } 
        />
        <Route 
          path="/admin/events" 
          element={
            isAdmin ? <EventsPage /> : <AdminLoginPage />
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
