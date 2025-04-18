
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const migrateLocalStorageToSupabase = async () => {
  const hasRun = localStorage.getItem("supabaseMigrationCompleted");
  if (hasRun === "true") {
    return;
  }

  console.info("Starting migration from localStorage to Supabase...");

  try {
    // Migrate callsigns
    const localCallsigns = localStorage.getItem("callSigns");
    if (localCallsigns) {
      try {
        const callsigns = JSON.parse(localCallsigns);
        
        // Skip migration if using numeric IDs (incompatible with UUID)
        const hasNumericIds = callsigns.some((cs: any) => 
          typeof cs.id === 'number' || /^\d+$/.test(cs.id)
        );
        
        if (!hasNumericIds && callsigns.length > 0) {
          for (const cs of callsigns) {
            const { error } = await supabase
              .from('callsigns')
              .insert({
                id: cs.id,
                code: cs.code,
                is_active: cs.isActive
              });
            
            if (error) throw error;
          }
        }
      } catch (error) {
        console.error("Error migrating callsigns:", error);
      }
    }

    // Migrate event participations
    const localParticipations = localStorage.getItem("eventParticipations");
    if (localParticipations) {
      try {
        const participations = JSON.parse(localParticipations);
        
        // Check if the callsigns have numeric IDs, if so skip migration
        const hasNumericIds = participations.some((p: any) => 
          typeof p.callSignId === 'number' || /^\d+$/.test(p.callSignId)
        );
        
        if (!hasNumericIds && participations.length > 0) {
          for (const p of participations) {
            const { error } = await supabase
              .from('event_participations')
              .insert({
                id: p.id,
                callsign_id: p.callSignId,
                date: p.date,
                departure_airport: p.departureAirport,
                arrival_airport: p.arrivalAirport,
                is_approved: p.isApproved,
                submitted_at: p.submittedAt,
                approved_at: p.approvedAt
              });
            
            if (error) throw error;
          }
        }
      } catch (error) {
        console.error("Error migrating event participations:", error);
      }
    }

    // Migrate manual participation counts
    const localCounts = localStorage.getItem("manualParticipationCounts");
    if (localCounts) {
      try {
        const counts = JSON.parse(localCounts);
        
        // Check if the callsigns have numeric IDs, if so skip migration
        const hasNumericIds = counts.some((c: any) => 
          typeof c.callSignId === 'number' || /^\d+$/.test(c.callSignId)
        );
        
        if (!hasNumericIds && counts.length > 0) {
          for (const c of counts) {
            const { error } = await supabase
              .from('manual_participation_counts')
              .insert({
                id: c.id,
                callsign_id: c.callSignId,
                count: c.count,
                updated_at: c.updatedAt
              });
            
            if (error) throw error;
          }
        }
      } catch (error) {
        console.error("Error migrating manual participation counts:", error);
      }
    }

    // Mark migration as completed
    localStorage.setItem("supabaseMigrationCompleted", "true");
  } catch (error) {
    console.error("Error during migration:", error);
  }

  console.info("Migration completed.");
};
