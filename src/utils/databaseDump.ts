
import { DatabaseConfig, db } from "../config/database";
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
  ]
};

// Function to import a database dump
export const importDatabaseDump = async (dump: DatabaseConfig) => {
  try {
    // Replace current database with the dump
    const success = await db.save(dump);
    if (success) {
      toast.success("Database imported successfully");
      return true;
    } else {
      toast.error("Failed to import database");
      return false;
    }
  } catch (error) {
    console.error("Error importing database dump:", error);
    toast.error("Error importing database");
    return false;
  }
};

// Function to export the current database
export const exportCurrentDatabase = async (): Promise<DatabaseConfig | null> => {
  try {
    const currentDb = await db.load();
    toast.success("Database exported successfully");
    return currentDb;
  } catch (error) {
    console.error("Error exporting database:", error);
    toast.error("Error exporting database");
    return null;
  }
};

// Function to reset database to empty state
export const resetDatabase = async () => {
  try {
    const emptyDatabase: DatabaseConfig = {
      callSigns: [],
      eventParticipations: []
    };
    const success = await db.save(emptyDatabase);
    if (success) {
      toast.success("Database has been reset");
      return true;
    } else {
      toast.error("Failed to reset database");
      return false;
    }
  } catch (error) {
    console.error("Error resetting database:", error);
    toast.error("Error resetting database");
    return false;
  }
};

// SQL schema for reference
/*
CREATE TABLE callsigns (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE event_participations (
  id VARCHAR(50) PRIMARY KEY,
  callSignId VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  departureAirport VARCHAR(10) NOT NULL,
  arrivalAirport VARCHAR(10) NOT NULL,
  isApproved BOOLEAN NOT NULL DEFAULT FALSE,
  submittedAt DATETIME NOT NULL,
  approvedAt DATETIME,
  FOREIGN KEY (callSignId) REFERENCES callsigns(id)
);
*/
