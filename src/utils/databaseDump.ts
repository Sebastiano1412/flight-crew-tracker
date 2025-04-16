
import { DatabaseConfig, db } from "../config/database";

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
export const importDatabaseDump = (dump: DatabaseConfig) => {
  // Replace current database with the dump
  db.save(dump);
  console.log("Database imported successfully.");
  return true;
};

// Function to export the current database
export const exportCurrentDatabase = (): DatabaseConfig => {
  const currentDb = db.load();
  console.log("Database exported successfully.");
  return currentDb;
};

// Function to reset database to empty state
export const resetDatabase = () => {
  const emptyDatabase: DatabaseConfig = {
    callSigns: [],
    eventParticipations: []
  };
  db.save(emptyDatabase);
  console.log("Database has been reset.");
  return true;
};
