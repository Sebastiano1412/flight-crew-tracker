
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to edit call signs in the database
export const editCallSign = async (
  id: string, 
  updatedData: { code?: string; isActive?: boolean }
) => {
  try {
    const { error } = await supabase
      .from('callsigns')
      .update({
        code: updatedData.code,
        is_active: updatedData.isActive
      })
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Call sign aggiornato con successo");
    return true;
  } catch (error) {
    console.error('Error updating callsign:', error);
    toast.error("Errore nell'aggiornamento del callsign");
    return false;
  }
};

// Function to edit event participation in the database
export const editEventParticipation = async (
  id: string,
  updatedData: {
    callSignId?: string;
    date?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    isApproved?: boolean;
  }
) => {
  try {
    const updatePayload: any = {};
    
    if (updatedData.callSignId) updatePayload.callsign_id = updatedData.callSignId;
    if (updatedData.date) updatePayload.date = updatedData.date;
    if (updatedData.departureAirport) updatePayload.departure_airport = updatedData.departureAirport;
    if (updatedData.arrivalAirport) updatePayload.arrival_airport = updatedData.arrivalAirport;
    if (updatedData.isApproved !== undefined) {
      updatePayload.is_approved = updatedData.isApproved;
      // Add approved_at timestamp if approving
      if (updatedData.isApproved) {
        updatePayload.approved_at = new Date().toISOString();
      }
    }
    
    const { error } = await supabase
      .from('event_participations')
      .update(updatePayload)
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Partecipazione evento aggiornata con successo");
    return true;
  } catch (error) {
    console.error('Error updating event participation:', error);
    toast.error("Errore nell'aggiornamento della partecipazione evento");
    return false;
  }
};

// Function to bulk import data
export const bulkImportData = async (data: any) => {
  try {
    // Insert callsigns if provided
    if (data.callSigns && data.callSigns.length > 0) {
      const formattedCallSigns = data.callSigns.map((cs: any) => ({
        id: cs.id,
        code: cs.code,
        is_active: cs.isActive
      }));
      
      const { error: callSignsError } = await supabase
        .from('callsigns')
        .upsert(formattedCallSigns, { onConflict: 'id' });
      
      if (callSignsError) throw callSignsError;
    }
    
    // Insert event participations if provided
    if (data.eventParticipations && data.eventParticipations.length > 0) {
      const formattedParticipations = data.eventParticipations.map((ep: any) => ({
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
        .upsert(formattedParticipations, { onConflict: 'id' });
      
      if (participationsError) throw participationsError;
    }
    
    toast.success("Database aggiornato con successo");
    return true;
  } catch (error) {
    console.error('Error bulk importing data:', error);
    toast.error('Errore nell\'importazione dei dati');
    return false;
  }
};
