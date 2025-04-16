
import { db, DatabaseConfig } from "../config/database";
import { toast } from "sonner";

// Function to edit call signs in the database
export const editCallSign = (
  id: string, 
  updatedData: { code?: string; isActive?: boolean }
) => {
  const database = db.load();
  
  const updatedCallSigns = database.callSigns.map(callSign => 
    callSign.id === id 
      ? { ...callSign, ...updatedData } 
      : callSign
  );
  
  const updatedDatabase = {
    ...database,
    callSigns: updatedCallSigns
  };
  
  db.save(updatedDatabase);
  toast.success("Call sign updated successfully");
  return true;
};

// Function to edit event participation in the database
export const editEventParticipation = (
  id: string,
  updatedData: {
    callSignId?: string;
    date?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    isApproved?: boolean;
  }
) => {
  const database = db.load();
  
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
  
  db.save(updatedDatabase);
  toast.success("Event participation updated successfully");
  return true;
};

// Function to bulk import data
export const bulkImportData = (data: Partial<DatabaseConfig>) => {
  const currentDatabase = db.load();
  
  const updatedDatabase = {
    ...currentDatabase,
    ...(data.callSigns && { callSigns: data.callSigns }),
    ...(data.eventParticipations && { eventParticipations: data.eventParticipations })
  };
  
  db.save(updatedDatabase);
  toast.success("Database updated successfully");
  return true;
};
