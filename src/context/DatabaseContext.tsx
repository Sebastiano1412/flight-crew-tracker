import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DatabaseConfig, CallSign, EventParticipation } from '../config/database';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { sendDiscordNotification } from '../utils/discordNotifications';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: callSigns, error: callSignsError } = await supabase
          .from('callsigns')
          .select('*');
        
        if (callSignsError) throw callSignsError;
        
        const { data: eventParticipations, error: participationsError } = await supabase
          .from('event_participations')
          .select('*');
        
        if (participationsError) throw participationsError;
        
        const { data: manualCounts, error: countsError } = await supabase
          .from('manual_participation_counts')
          .select('*');
        
        if (countsError) throw countsError;

        const formattedCallSigns = callSigns.map(cs => ({
          id: cs.id,
          code: cs.code,
          isActive: cs.is_active
        }));

        const formattedParticipations = eventParticipations.map(ep => ({
          id: ep.id,
          callSignId: ep.callsign_id,
          date: ep.date,
          departureAirport: ep.departure_airport,
          arrivalAirport: ep.arrival_airport,
          isApproved: ep.is_approved,
          submittedAt: ep.submitted_at,
          approvedAt: ep.approved_at
        }));

        const formattedCounts = manualCounts.map(mc => ({
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
        console.error('Error loading data from Supabase:', error);
        toast.error('Errore nel caricamento dei dati');
      }
    };

    loadData();
  }, []);

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
      const { data, error } = await supabase
        .from('callsigns')
        .insert([{ code, is_active: true }])
        .select()
        .single();
      
      if (error) throw error;

      const newCallSign: CallSign = {
        id: data.id,
        code: data.code,
        isActive: data.is_active
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
      const { error } = await supabase
        .from('callsigns')
        .update({ code, is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;

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
      const { error: eventError } = await supabase
        .from('event_participations')
        .delete()
        .eq('callsign_id', id);
      if (eventError) throw eventError;

      const { error: manualError } = await supabase
        .from('manual_participation_counts')
        .delete()
        .eq('callsign_id', id);
      if (manualError) throw manualError;

      const { error } = await supabase
        .from('callsigns')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setDatabase(prev => ({
        ...prev,
        callSigns: prev.callSigns.filter(cs => cs.id !== id),
        eventParticipations: prev.eventParticipations.filter(ep => ep.callSignId !== id),
        manualParticipationCounts: prev.manualParticipationCounts.filter(mpc => mpc.callSignId !== id)
      }));

      toast.success("Callsign eliminato con successo e tutte le partecipazioni associate sono state rimosse");
    } catch (error) {
      console.error('Error deleting callsign and associated records:', error);
      toast.error('Errore nell\'eliminazione del callsign e delle partecipazioni associate');
    }
  };

  const addEventParticipation = async (callSignId: string, date: string, departureAirport: string, arrivalAirport: string) => {
    try {
      const { data, error } = await supabase
        .from('event_participations')
        .insert([{
          callsign_id: callSignId,
          date,
          departure_airport: departureAirport,
          arrival_airport: arrivalAirport,
          is_approved: false
        }])
        .select()
        .single();
      
      if (error) throw error;

      const newParticipation: EventParticipation = {
        id: data.id,
        callSignId: data.callsign_id,
        date: data.date,
        departureAirport: data.departure_airport,
        arrivalAirport: data.arrival_airport,
        isApproved: data.is_approved,
        submittedAt: data.submitted_at
      };

      setDatabase(prev => ({
        ...prev,
        eventParticipations: [...prev.eventParticipations, newParticipation]
      }));

      // Send Discord notification
      const callSignCode = getCallSignCode(callSignId);
      await sendDiscordNotification(callSignCode, date, departureAirport, arrivalAirport);

      toast.success("Partecipazione all'evento inviata per approvazione");
    } catch (error) {
      console.error('Error adding event participation:', error);
      toast.error('Errore nell\'invio della partecipazione');
    }
  };

  const approveEventParticipation = async (id: string, showToast = true) => {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('event_participations')
        .update({ 
          is_approved: true,
          approved_at: now
        })
        .eq('id', id);
      
      if (error) throw error;

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
      const updateData: any = {
        callsign_id: callSignId,
        date,
        departure_airport: departureAirport,
        arrival_airport: arrivalAirport,
        is_approved: isApproved
      };
      
      const existingEvent = database.eventParticipations.find(ep => ep.id === id);
      if (isApproved && existingEvent && !existingEvent.isApproved) {
        updateData.approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('event_participations')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;

      setDatabase(prev => ({
        ...prev,
        eventParticipations: prev.eventParticipations.map(ep => {
          if (ep.id === id) {
            const updatedEp = { 
              ...ep, 
              callSignId, 
              date, 
              departureAirport, 
              arrivalAirport, 
              isApproved
            };
            
            if (isApproved && !ep.isApproved) {
              updatedEp.approvedAt = updateData.approved_at;
            }
            
            return updatedEp;
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
      const { error } = await supabase
        .from('event_participations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

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
        const { error } = await supabase
          .from('manual_participation_counts')
          .update({ count, updated_at: new Date().toISOString() })
          .eq('callsign_id', callSignId);
        
        if (error) throw error;

        setDatabase(prev => ({
          ...prev,
          manualParticipationCounts: prev.manualParticipationCounts.map(mpc => 
            mpc.callSignId === callSignId ? { ...mpc, count, updatedAt: new Date().toISOString() } : mpc
          )
        }));
      } else {
        const { data, error } = await supabase
          .from('manual_participation_counts')
          .insert([{ 
            callsign_id: callSignId, 
            count,
            updated_at: new Date().toISOString() 
          }])
          .select()
          .single();
        
        if (error) throw error;

        setDatabase(prev => ({
          ...prev,
          manualParticipationCounts: [
            ...prev.manualParticipationCounts, 
            { 
              id: data.id, 
              callSignId, 
              count,
              updatedAt: data.updated_at 
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
