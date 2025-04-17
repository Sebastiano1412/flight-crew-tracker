
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DatabaseConfig, db, CallSign, EventParticipation } from '../config/database';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface DatabaseContextType {
  database: DatabaseConfig;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addCallSign: (code: string) => void;
  updateCallSign: (id: string, code: string, isActive: boolean) => void;
  deleteCallSign: (id: string) => void;
  addEventParticipation: (callSignId: string, date: string, departureAirport: string, arrivalAirport: string) => void;
  approveEventParticipation: (id: string) => void;
  editEventParticipation: (id: string, callSignId: string, date: string, departureAirport: string, arrivalAirport: string, isApproved: boolean) => void;
  deleteEventParticipation: (id: string) => void;
  getCallSignById: (id: string) => CallSign | undefined;
  getCallSignCode: (id: string) => string;
  getActiveCallSigns: () => CallSign[];
  getPendingParticipations: () => EventParticipation[];
  getApprovedParticipations: () => EventParticipation[];
  getCallSignParticipationCount: (callSignId: string) => number;
  updateManualParticipationCount: (callSignId: string, count: number) => void;
  getManualParticipationCount: (callSignId: string) => number;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with a default empty database structure to prevent undefined errors
  const [database, setDatabase] = useState<DatabaseConfig>({
    callSigns: [],
    eventParticipations: [],
    manualParticipationCounts: []
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load database on component mount
  useEffect(() => {
    const loadedDb = db.load();
    setDatabase(loadedDb);
    setIsLoaded(true);
  }, []);

  // Save database whenever it changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      db.save(database);
    }
  }, [database, isLoaded]);

  const login = (password: string): boolean => {
    if (password === "asxeventi10") {
      setIsAdmin(true);
      toast.success("Login admin effettuato");
      return true;
    }
    toast.error("Password non valida");
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    toast.success("Logout effettuato");
  };

  const addCallSign = (code: string) => {
    const newCallSign: CallSign = {
      id: Date.now().toString(),
      code,
      isActive: true
    };
    setDatabase(prev => ({
      ...prev,
      callSigns: [...prev.callSigns, newCallSign]
    }));
    toast.success(`Callsign ${code} aggiunto con successo`);
  };

  const updateCallSign = (id: string, code: string, isActive: boolean) => {
    setDatabase(prev => ({
      ...prev,
      callSigns: prev.callSigns.map(cs => 
        cs.id === id ? { ...cs, code, isActive } : cs
      )
    }));
    toast.success(`Callsign aggiornato con successo`);
  };

  const deleteCallSign = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      callSigns: prev.callSigns.filter(cs => cs.id !== id),
      manualParticipationCounts: prev.manualParticipationCounts.filter(mpc => mpc.callSignId !== id)
    }));
    toast.success("Callsign eliminato con successo");
  };

  const addEventParticipation = (callSignId: string, date: string, departureAirport: string, arrivalAirport: string) => {
    const newParticipation: EventParticipation = {
      id: Date.now().toString(),
      callSignId,
      date,
      departureAirport,
      arrivalAirport,
      isApproved: false,
      submittedAt: new Date().toISOString()
    };
    setDatabase(prev => ({
      ...prev,
      eventParticipations: [...prev.eventParticipations, newParticipation]
    }));
    toast.success("Partecipazione all'evento inviata per approvazione");
  };

  const approveEventParticipation = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      eventParticipations: prev.eventParticipations.map(ep => 
        ep.id === id ? { ...ep, isApproved: true, approvedAt: new Date().toISOString() } : ep
      )
    }));
    toast.success("Partecipazione all'evento approvata");
  };

  const editEventParticipation = (id: string, callSignId: string, date: string, departureAirport: string, arrivalAirport: string, isApproved: boolean) => {
    setDatabase(prev => ({
      ...prev,
      eventParticipations: prev.eventParticipations.map(ep => 
        ep.id === id ? { 
          ...ep, 
          callSignId, 
          date, 
          departureAirport, 
          arrivalAirport, 
          isApproved,
          ...(isApproved && !ep.isApproved ? { approvedAt: new Date().toISOString() } : {})
        } : ep
      )
    }));
    toast.success("Partecipazione all'evento aggiornata");
  };

  const deleteEventParticipation = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      eventParticipations: prev.eventParticipations.filter(ep => ep.id !== id)
    }));
    toast.success("Partecipazione all'evento eliminata");
  };

  const getCallSignById = (id: string): CallSign | undefined => {
    return database.callSigns.find(cs => cs.id === id);
  };

  const getCallSignCode = (id: string): string => {
    const callSign = database.callSigns.find(cs => cs.id === id);
    return callSign ? callSign.code : "Sconosciuto";
  };

  const getActiveCallSigns = (): CallSign[] => {
    return database.callSigns.filter(cs => cs.isActive);
  };

  const getPendingParticipations = (): EventParticipation[] => {
    return database.eventParticipations.filter(ep => !ep.isApproved);
  };

  const getApprovedParticipations = (): EventParticipation[] => {
    return database.eventParticipations.filter(ep => ep.isApproved);
  };

  const getCallSignParticipationCount = (callSignId: string): number => {
    const approvedCount = database.eventParticipations.filter(
      ep => ep.callSignId === callSignId && ep.isApproved
    ).length;
    
    // Add manual count if available
    const manualCount = getManualParticipationCount(callSignId);
    
    return approvedCount + manualCount;
  };

  const updateManualParticipationCount = (callSignId: string, count: number) => {
    // Check if a manual count already exists for this callsign
    const existingManualCount = database.manualParticipationCounts.find(
      mpc => mpc.callSignId === callSignId
    );

    if (existingManualCount) {
      // Update existing count
      setDatabase(prev => ({
        ...prev,
        manualParticipationCounts: prev.manualParticipationCounts.map(mpc => 
          mpc.callSignId === callSignId ? { ...mpc, count } : mpc
        )
      }));
    } else {
      // Add new manual count
      setDatabase(prev => ({
        ...prev,
        manualParticipationCounts: [
          ...prev.manualParticipationCounts, 
          { 
            id: Date.now().toString(), 
            callSignId, 
            count,
            updatedAt: new Date().toISOString() 
          }
        ]
      }));
    }
    toast.success("Conteggio partecipazioni manuale aggiornato");
  };

  const getManualParticipationCount = (callSignId: string): number => {
    const manualCount = database.manualParticipationCounts.find(
      mpc => mpc.callSignId === callSignId
    );
    return manualCount ? manualCount.count : 0;
  };

  const value = {
    database,
    isAdmin,
    login,
    logout,
    addCallSign,
    updateCallSign,
    deleteCallSign,
    addEventParticipation,
    approveEventParticipation,
    editEventParticipation,
    deleteEventParticipation,
    getCallSignById,
    getCallSignCode,
    getActiveCallSigns,
    getPendingParticipations,
    getApprovedParticipations,
    getCallSignParticipationCount,
    updateManualParticipationCount,
    getManualParticipationCount
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
