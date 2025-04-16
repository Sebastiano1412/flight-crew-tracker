
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
  callSigns: CallSign[];
  eventParticipations: EventParticipation[];
}

// API base URL - update this to your MySQL server API endpoint
const API_BASE_URL = "http://your-mysql-api-server.com/api";

// MySQL database operations
const loadDatabase = async (): Promise<DatabaseConfig> => {
  try {
    // Initial data to use if API fails
    const defaultData: DatabaseConfig = {
      callSigns: [
        { id: "1", code: "VA001", isActive: true },
        { id: "2", code: "VA002", isActive: true },
        { id: "3", code: "VA003", isActive: true },
      ],
      eventParticipations: []
    };
    
    // Try to fetch from API
    const response = await fetch(`${API_BASE_URL}/data`);
    if (!response.ok) {
      console.error("Failed to load from MySQL database", await response.text());
      return defaultData;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error loading database:", error);
    // Return default data if API fails
    return {
      callSigns: [
        { id: "1", code: "VA001", isActive: true },
        { id: "2", code: "VA002", isActive: true },
        { id: "3", code: "VA003", isActive: true },
      ],
      eventParticipations: []
    };
  }
};

const saveDatabase = async (data: DatabaseConfig): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error("Failed to save to MySQL database", await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving database:", error);
    return false;
  }
};

export const db = {
  load: loadDatabase,
  save: saveDatabase
};
