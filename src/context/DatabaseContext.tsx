
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DatabaseConfig, db, CallSign, EventParticipation } from '../config/database';
import { toast } from 'sonner';

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
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with a default empty database structure to prevent undefined errors
  const [database, setDatabase] = useState<DatabaseConfig>({
    callSigns: [],
    eventParticipations: []
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
      toast.success("Admin login successful");
      return true;
    }
    toast.error("Invalid password");
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    toast.success("Logged out successfully");
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
    toast.success(`Call sign ${code} added successfully`);
  };

  const updateCallSign = (id: string, code: string, isActive: boolean) => {
    setDatabase(prev => ({
      ...prev,
      callSigns: prev.callSigns.map(cs => 
        cs.id === id ? { ...cs, code, isActive } : cs
      )
    }));
    toast.success(`Call sign updated successfully`);
  };

  const deleteCallSign = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      callSigns: prev.callSigns.filter(cs => cs.id !== id)
    }));
    toast.success("Call sign deleted successfully");
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
    toast.success("Event participation submitted for approval");
  };

  const approveEventParticipation = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      eventParticipations: prev.eventParticipations.map(ep => 
        ep.id === id ? { ...ep, isApproved: true, approvedAt: new Date().toISOString() } : ep
      )
    }));
    toast.success("Event participation approved");
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
    toast.success("Event participation updated");
  };

  const deleteEventParticipation = (id: string) => {
    setDatabase(prev => ({
      ...prev,
      eventParticipations: prev.eventParticipations.filter(ep => ep.id !== id)
    }));
    toast.success("Event participation deleted");
  };

  const getCallSignById = (id: string): CallSign | undefined => {
    return database.callSigns.find(cs => cs.id === id);
  };

  const getCallSignCode = (id: string): string => {
    const callSign = database.callSigns.find(cs => cs.id === id);
    return callSign ? callSign.code : "Unknown";
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
    return database.eventParticipations.filter(ep => ep.callSignId === callSignId && ep.isApproved).length;
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
    getCallSignParticipationCount
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
