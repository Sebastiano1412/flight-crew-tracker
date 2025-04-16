
import { db, DatabaseConfig } from "../config/database";
import { toast } from "sonner";

// Function to edit call signs in the database
export const editCallSign = async (
  id: string, 
  updatedData: { code?: string; isActive?: boolean }
) => {
  try {
    const database = await db.load();
    
    const updatedCallSigns = database.callSigns.map(callSign => 
      callSign.id === id 
        ? { ...callSign, ...updatedData } 
        : callSign
    );
    
    const updatedDatabase = {
      ...database,
      callSigns: updatedCallSigns
    };
    
    const success = await db.save(updatedDatabase);
    if (success) {
      toast.success("Call sign updated successfully");
      return true;
    } else {
      toast.error("Failed to update call sign");
      return false;
    }
  } catch (error) {
    console.error("Error updating call sign:", error);
    toast.error("Error updating call sign");
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
    const database = await db.load();
    
    const updatedParticipations = database.eventParticipations.map(participation => {
      if (participation.id === id) {
        const updated = { ...participation, ...updatedData };
        // Update approvedAt if changing status to approved
        if (updatedData.isApproved === true && !participation.isApproved) {
          updated.approvedAt = new Date().toISOString();
        }
        return updated;
      }
      return participation;
    });
    
    const updatedDatabase = {
      ...database,
      eventParticipations: updatedParticipations
    };
    
    const success = await db.save(updatedDatabase);
    if (success) {
      toast.success("Event participation updated successfully");
      return true;
    } else {
      toast.error("Failed to update event participation");
      return false;
    }
  } catch (error) {
    console.error("Error updating event participation:", error);
    toast.error("Error updating event participation");
    return false;
  }
};

// Function to bulk import data
export const bulkImportData = async (data: Partial<DatabaseConfig>) => {
  try {
    const currentDatabase = await db.load();
    
    const updatedDatabase = {
      ...currentDatabase,
      ...(data.callSigns && { callSigns: data.callSigns }),
      ...(data.eventParticipations && { eventParticipations: data.eventParticipations })
    };
    
    const success = await db.save(updatedDatabase);
    if (success) {
      toast.success("Database updated successfully");
      return true;
    } else {
      toast.error("Failed to update database");
      return false;
    }
  } catch (error) {
    console.error("Error bulk importing data:", error);
    toast.error("Error updating database");
    return false;
  }
};
