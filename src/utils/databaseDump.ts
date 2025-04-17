
import { DatabaseConfig } from "../config/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Sample database dump that can be imported
export const databaseDump: DatabaseConfig = {
  callSigns: [
    { id: "1", code: "VA001", isActive: true },
    { id: "2", code: "VA002", isActive: true },
    { id: "3", code: "VA003", isActive: true },
    { id: "4", code: "VA004", isActive: true },
    { id: "5", code: "VA005", isActive: true }
  ],
  eventParticipations: [
    {
      id: "1",
      callSignId: "1",
      date: "2025-04-10",
      departureAirport: "KJFK",
      arrivalAirport: "KLAX",
      isApproved: true,
      submittedAt: "2025-04-05T10:30:00Z",
      approvedAt: "2025-04-06T14:20:00Z"
    },
    {
      id: "2",
      callSignId: "2",
      date: "2025-04-12",
      departureAirport: "EGLL",
      arrivalAirport: "EHAM",
      isApproved: true,
      submittedAt: "2025-04-07T08:15:00Z",
      approvedAt: "2025-04-08T11:45:00Z"
    },
    {
      id: "3",
      callSignId: "3",
      date: "2025-04-15",
      departureAirport: "LFPG",
      arrivalAirport: "LEMD",
      isApproved: false,
      submittedAt: "2025-04-13T16:20:00Z"
    }
  ],
  manualParticipationCounts: []
};

// Function to import a database dump to Supabase
export const importDatabaseDump = async (dump: DatabaseConfig) => {
  try {
    // Clear existing data (optional)
    await resetDatabase();
    
    // Import callsigns
    if (dump.callSigns && dump.callSigns.length > 0) {
      const formattedCallSigns = dump.callSigns.map(cs => ({
        id: cs.id,
        code: cs.code,
        is_active: cs.isActive
      }));
      
      const { error: callSignsError } = await supabase
        .from('callsigns')
        .upsert(formattedCallSigns);
      
      if (callSignsError) throw callSignsError;
    }
    
    // Import event participations
    if (dump.eventParticipations && dump.eventParticipations.length > 0) {
      const formattedParticipations = dump.eventParticipations.map(ep => ({
        id: ep.id,
        callsign_id: ep.callSignId,
        date: ep.date,
        departure_airport: ep.departureAirport,
        arrival_airport: ep.arrivalAirport,
        is_approved: ep.isApproved,
        submitted_at: ep.submittedAt,
        approved_at: ep.approvedAt
      }));
      
      const { error: participationsError } = await supabase
        .from('event_participations')
        .upsert(formattedParticipations);
      
      if (participationsError) throw participationsError;
    }
    
    // Import manual participation counts
    if (dump.manualParticipationCounts && dump.manualParticipationCounts.length > 0) {
      const formattedCounts = dump.manualParticipationCounts.map(mc => ({
        id: mc.id,
        callsign_id: mc.callSignId,
        count: mc.count,
        updated_at: mc.updatedAt
      }));
      
      const { error: countsError } = await supabase
        .from('manual_participation_counts')
        .upsert(formattedCounts);
      
      if (countsError) throw countsError;
    }
    
    console.log("Database imported successfully.");
    toast.success("Database importato con successo");
    return true;
  } catch (error) {
    console.error("Error importing database:", error);
    toast.error("Errore nell'importazione del database");
    return false;
  }
};

// Function to export the current database from Supabase
export const exportCurrentDatabase = async (): Promise<DatabaseConfig> => {
  try {
    // Fetch callsigns
    const { data: callSigns, error: callSignsError } = await supabase
      .from('callsigns')
      .select('*');
    
    if (callSignsError) throw callSignsError;
    
    // Fetch event participations
    const { data: eventParticipations, error: participationsError } = await supabase
      .from('event_participations')
      .select('*');
    
    if (participationsError) throw participationsError;
    
    // Fetch manual participation counts
    const { data: manualCounts, error: countsError } = await supabase
      .from('manual_participation_counts')
      .select('*');
    
    if (countsError) throw countsError;
    
    // Transform data to match our local format
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
    
    const exportedDb: DatabaseConfig = {
      callSigns: formattedCallSigns,
      eventParticipations: formattedParticipations,
      manualParticipationCounts: formattedCounts
    };
    
    console.log("Database exported successfully.");
    toast.success("Database esportato con successo");
    return exportedDb;
  } catch (error) {
    console.error("Error exporting database:", error);
    toast.error("Errore nell'esportazione del database");
    return {
      callSigns: [],
      eventParticipations: [],
      manualParticipationCounts: []
    };
  }
};

// Function to reset database
export const resetDatabase = async () => {
  try {
    // Delete all data from tables
    await supabase.from('manual_participation_counts').delete().neq('id', 'dummy');
    await supabase.from('event_participations').delete().neq('id', 'dummy');
    await supabase.from('callsigns').delete().neq('id', 'dummy');
    
    console.log("Database has been reset.");
    toast.success("Database è stato resettato");
    return true;
  } catch (error) {
    console.error("Error resetting database:", error);
    toast.error("Errore nel reset del database");
    return false;
  }
};
