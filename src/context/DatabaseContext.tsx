import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DatabaseConfig, CallSign, EventParticipation } from '../config/database';
import { toast } from 'sonner';
import { mysqlClient, initializePool } from "../utils/mysqlClient";
import { v4 as uuidv4 } from 'uuid';

interface DatabaseContextType {
  database: DatabaseConfig;
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  addCallSign: (code: string) => Promise<void>;
  updateCallSign: (id: string, code: string, isActive: boolean) => Promise<void>;
  deleteCallSign: (id: string) => Promise<void>;
  addEventParticipation: (callSignId: string, date: string, departureAirport: string, arrivalAirport: string) => Promise<void>;
  approveEventParticipation: (id: string, showToast?: boolean) => Promise<void>;
  editEventParticipation: (id: string, callSignId: string, date: string, departureAirport: string, arrivalAirport: string, isApproved: boolean) => Promise<void>;
  deleteEventParticipation: (id: string) => Promise<void>;
  getCallSignById: (id: string) => CallSign | undefined;
  getCallSignCode: (id: string) => string;
  getActiveCallSigns: () => CallSign[];
  getPendingParticipations: () => EventParticipation[];
  getApprovedParticipations: () => EventParticipation[];
  getCallSignParticipationCount: (callSignId: string) => number;
  updateManualParticipationCount: (callSignId: string, count: number) => Promise<void>;
  getManualParticipationCount: (callSignId: string) => number;
  initializeDatabase: () => Promise<void>;
  isConnected: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<DatabaseConfig>({
    callSigns: [],
    eventParticipations: [],
    manualParticipationCounts: []
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize the database
  const initializeDatabase = async (): Promise<void> => {
    try {
      // Initialize database connection
      await initializePool();
      
      // Set up tables if they don't exist
      await mysqlClient.setupDatabase();
      
      // Load data
      await loadData();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing database:', error);
      setIsConnected(false);
      throw error;
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  const loadData = async () => {
    try {
      // Load callsigns
      const callSigns = await mysqlClient.executeQuery<any>(
        'SELECT * FROM callsigns'
      );
      
      // Load event participations
      const eventParticipations = await mysqlClient.executeQuery<any>(
        'SELECT * FROM event_participations'
      );
      
      // Load manual counts
      const manualCounts = await mysqlClient.executeQuery<any>(
        'SELECT * FROM manual_participation_counts'
      );

      // Format data as expected by the app
      const formattedCallSigns = callSigns.map((cs: any) => ({
        id: cs.id,
        code: cs.code,
        isActive: Boolean(cs.is_active)
      }));

      const formattedParticipations = eventParticipations.map((ep: any) => ({
        id: ep.id,
        callSignId: ep.callsign_id,
        date: ep.date,
        departureAirport: ep.departure_airport,
        arrivalAirport: ep.arrival_airport,
        isApproved: Boolean(ep.is_approved),
        submittedAt: ep.submitted_at,
        approvedAt: ep.approved_at
      }));

      const formattedCounts = manualCounts.map((mc: any) => ({
        id: mc.id,
        callSignId: mc.callsign_id,
        count: mc.count,
        updatedAt: mc.updated_at
      }));

      setDatabase({
        callSigns: formattedCallSigns,
        eventParticipations: formattedParticipations,
        manualParticipationCounts: formattedCounts
      });

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading data from mock MySQL:', error);
      toast.error('Error loading data');
    }
  };

  const login = async (password: string): Promise<boolean> => {
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

  const addCallSign = async (code: string) => {
    try {
      const id = uuidv4();
      
      await mysqlClient.executeQuery(
        'INSERT INTO callsigns (id, code, is_active) VALUES (?, ?, ?)',
        [id, code, 1]
      );

      const newCallSign: CallSign = {
        id,
        code,
        isActive: true
      };

      setDatabase(prev => ({
        ...prev,
        callSigns: [...prev.callSigns, newCallSign]
      }));

      toast.success(`Callsign ${code} aggiunto con successo`);
    } catch (error) {
      console.error('Error adding callsign:', error);
      toast.error('Errore nell\'aggiunta del callsign');
    }
  };

  const updateCallSign = async (id: string, code: string, isActive: boolean) => {
    try {
      await mysqlClient.executeQuery(
        'UPDATE callsigns SET code = ?, is_active = ? WHERE id = ?',
        [code, isActive ? 1 : 0, id]
      );

      setDatabase(prev => ({
        ...prev,
        callSigns: prev.callSigns.map(cs => 
          cs.id === id ? { ...cs, code, isActive } : cs
        )
      }));

      toast.success(`Callsign aggiornato con successo`);
    } catch (error) {
      console.error('Error updating callsign:', error);
      toast.error('Errore nell\'aggiornamento del callsign');
    }
  };

  const deleteCallSign = async (id: string) => {
    try {
      // Grazie alle foreign key constraints con ON DELETE CASCADE,
      // MySQL eliminerà automaticamente i record correlati
      await mysqlClient.executeQuery(
        'DELETE FROM callsigns WHERE id = ?',
        [id]
      );

      setDatabase(prev => ({
        ...prev,
        callSigns: prev.callSigns.filter(cs => cs.id !== id),
        eventParticipations: prev.eventParticipations.filter(ep => ep.callSignId !== id),
        manualParticipationCounts: prev.manualParticipationCounts.filter(mpc => mpc.callSignId !== id)
      }));

      toast.success("Callsign eliminato con successo");
    } catch (error) {
      console.error('Error deleting callsign:', error);
      toast.error('Errore nell\'eliminazione del callsign');
    }
  };

  const addEventParticipation = async (callSignId: string, date: string, departureAirport: string, arrivalAirport: string) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      await mysqlClient.executeQuery(
        `INSERT INTO event_participations 
         (id, callsign_id, date, departure_airport, arrival_airport, is_approved, submitted_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, callSignId, date, departureAirport, arrivalAirport, 0, now]
      );

      const newParticipation: EventParticipation = {
        id,
        callSignId,
        date,
        departureAirport,
        arrivalAirport,
        isApproved: false,
        submittedAt: now
      };

      setDatabase(prev => ({
        ...prev,
        eventParticipations: [...prev.eventParticipations, newParticipation]
      }));

      toast.success("Partecipazione all'evento inviata per approvazione");
    } catch (error) {
      console.error('Error adding event participation:', error);
      toast.error('Errore nell\'invio della partecipazione');
    }
  };

  const approveEventParticipation = async (id: string, showToast = true) => {
    try {
      const now = new Date().toISOString();
      
      await mysqlClient.executeQuery(
        'UPDATE event_participations SET is_approved = ?, approved_at = ? WHERE id = ?',
        [1, now, id]
      );

      setDatabase(prev => ({
        ...prev,
        eventParticipations: prev.eventParticipations.map(ep => 
          ep.id === id ? { ...ep, isApproved: true, approvedAt: now } : ep
        )
      }));

      if (showToast) {
        toast.success("Partecipazione all'evento approvata");
      }
    } catch (error) {
      console.error('Error approving event participation:', error);
      toast.error('Errore nell\'approvazione della partecipazione');
    }
  };

  const editEventParticipation = async (id: string, callSignId: string, date: string, departureAirport: string, arrivalAirport: string, isApproved: boolean) => {
    try {
      const existingEvent = database.eventParticipations.find(ep => ep.id === id);
      let approvedAt = null;
      
      if (isApproved && existingEvent && !existingEvent.isApproved) {
        approvedAt = new Date().toISOString();
      } else if (existingEvent && existingEvent.approvedAt) {
        approvedAt = existingEvent.approvedAt;
      }
      
      await mysqlClient.executeQuery(
        `UPDATE event_participations 
         SET callsign_id = ?, date = ?, departure_airport = ?, arrival_airport = ?, 
             is_approved = ?, approved_at = ? 
         WHERE id = ?`,
        [callSignId, date, departureAirport, arrivalAirport, isApproved ? 1 : 0, approvedAt, id]
      );

      setDatabase(prev => ({
        ...prev,
        eventParticipations: prev.eventParticipations.map(ep => {
          if (ep.id === id) {
            return { 
              ...ep, 
              callSignId, 
              date, 
              departureAirport, 
              arrivalAirport, 
              isApproved,
              approvedAt
            };
          }
          return ep;
        })
      }));

      toast.success("Partecipazione all'evento aggiornata");
    } catch (error) {
      console.error('Error editing event participation:', error);
      toast.error('Errore nell\'aggiornamento della partecipazione');
    }
  };

  const deleteEventParticipation = async (id: string) => {
    try {
      await mysqlClient.executeQuery(
        'DELETE FROM event_participations WHERE id = ?',
        [id]
      );

      setDatabase(prev => ({
        ...prev,
        eventParticipations: prev.eventParticipations.filter(ep => ep.id !== id)
      }));

      toast.success("Partecipazione all'evento eliminata");
    } catch (error) {
      console.error('Error deleting event participation:', error);
      toast.error('Errore nell\'eliminazione della partecipazione');
    }
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
    
    const manualCount = getManualParticipationCount(callSignId);
    
    return approvedCount + manualCount;
  };

  const updateManualParticipationCount = async (callSignId: string, count: number) => {
    const existingManualCount = database.manualParticipationCounts.find(
      mpc => mpc.callSignId === callSignId
    );

    try {
      if (existingManualCount) {
        await mysqlClient.executeQuery(
          'UPDATE manual_participation_counts SET count = ?, updated_at = ? WHERE callsign_id = ?',
          [count, new Date().toISOString(), callSignId]
        );

        setDatabase(prev => ({
          ...prev,
          manualParticipationCounts: prev.manualParticipationCounts.map(mpc => 
            mpc.callSignId === callSignId ? { ...mpc, count, updatedAt: new Date().toISOString() } : mpc
          )
        }));
      } else {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        await mysqlClient.executeQuery(
          'INSERT INTO manual_participation_counts (id, callsign_id, count, updated_at) VALUES (?, ?, ?, ?)',
          [id, callSignId, count, now]
        );

        setDatabase(prev => ({
          ...prev,
          manualParticipationCounts: [
            ...prev.manualParticipationCounts, 
            { 
              id, 
              callSignId, 
              count,
              updatedAt: now 
            }
          ]
        }));
      }

      toast.success("Conteggio partecipazioni manuale aggiornato");
    } catch (error) {
      console.error('Error updating manual participation count:', error);
      toast.error('Errore nell\'aggiornamento del conteggio manuale');
    }
  };

  const getManualParticipationCount = (callSignId: string): number => {
    const manualCount = database.manualParticipationCounts.find(
      mpc => mpc.callSignId === callSignId
    );
    return manualCount ? manualCount.count : 0;
  };

  const value: DatabaseContextType = {
    database,
    isAdmin,
    isConnected,
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
    getManualParticipationCount,
    initializeDatabase
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
