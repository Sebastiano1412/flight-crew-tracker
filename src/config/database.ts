
// This is a simple mock database configuration
// In a real application, you would connect to a real database

export interface CallSign {
  id: string;
  code: string;
  isActive: boolean;
}

export interface EventParticipation {
  id: string;
  callSignId: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  isApproved: boolean;
  submittedAt: string;
  approvedAt?: string;
}

export interface DatabaseConfig {
  adminPassword: string;
  callSigns: CallSign[];
  eventParticipations: EventParticipation[];
}

// Load database from localStorage if available, otherwise use default values
const loadDatabase = (): DatabaseConfig => {
  const savedData = localStorage.getItem('flightCrewTracker');
  if (savedData) {
    return JSON.parse(savedData);
  }
  
  return {
    adminPassword: "admin123", // Default password, should be changed in production
    callSigns: [
      { id: "1", code: "VA001", isActive: true },
      { id: "2", code: "VA002", isActive: true },
      { id: "3", code: "VA003", isActive: true },
    ],
    eventParticipations: []
  };
};

// Save database to localStorage
const saveDatabase = (data: DatabaseConfig) => {
  localStorage.setItem('flightCrewTracker', JSON.stringify(data));
};

export const db = {
  load: loadDatabase,
  save: saveDatabase
};
