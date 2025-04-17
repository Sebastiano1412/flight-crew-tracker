
import { supabase } from "@/integrations/supabase/client";
import { db } from "../config/database";

export const migrateLocalStorageToSupabase = async () => {
  try {
    // Check if migration has been done
    const { data: existingCallsigns } = await supabase
      .from('callsigns')
      .select('count')
      .single();
    
    // If there are already callsigns, skip migration
    if (existingCallsigns && existingCallsigns.count > 0) {
      console.log('Migration already completed. Skipping...');
      return;
    }
    
    // Load local storage data
    const localData = db.load();
    
    // Check if we have data to migrate
    if (!localData.callSigns || localData.callSigns.length === 0) {
      console.log('No local data to migrate.');
      return;
    }
    
    console.log('Starting migration from localStorage to Supabase...');
    
    // Prepare data for insert
    const callsigns = localData.callSigns.map(cs => ({
      id: cs.id,
      code: cs.code,
      is_active: cs.isActive
    }));
    
    const eventParticipations = localData.eventParticipations.map(ep => ({
      id: ep.id,
      callsign_id: ep.callSignId,
      date: ep.date,
      departure_airport: ep.departureAirport,
      arrival_airport: ep.arrivalAirport,
      is_approved: ep.isApproved,
      submitted_at: ep.submittedAt,
      approved_at: ep.approvedAt
    }));
    
    const manualCounts = localData.manualParticipationCounts.map(mc => ({
      id: mc.id,
      callsign_id: mc.callSignId,
      count: mc.count,
      updated_at: mc.updatedAt
    }));
    
    // Insert data into Supabase
    if (callsigns.length > 0) {
      const { error: callsignsError } = await supabase
        .from('callsigns')
        .upsert(callsigns);
      
      if (callsignsError) {
        console.error('Error migrating callsigns:', callsignsError);
      } else {
        console.log(`Migrated ${callsigns.length} callsigns.`);
      }
    }
    
    if (eventParticipations.length > 0) {
      const { error: eventsError } = await supabase
        .from('event_participations')
        .upsert(eventParticipations);
      
      if (eventsError) {
        console.error('Error migrating event participations:', eventsError);
      } else {
        console.log(`Migrated ${eventParticipations.length} event participations.`);
      }
    }
    
    if (manualCounts.length > 0) {
      const { error: countsError } = await supabase
        .from('manual_participation_counts')
        .upsert(manualCounts);
      
      if (countsError) {
        console.error('Error migrating manual counts:', countsError);
      } else {
        console.log(`Migrated ${manualCounts.length} manual participation counts.`);
      }
    }
    
    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
