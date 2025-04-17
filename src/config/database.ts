
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

export interface ManualParticipationCount {
  id: string;
  callSignId: string;
  count: number;
  updatedAt: string;
}

export interface DatabaseConfig {
  callSigns: CallSign[];
  eventParticipations: EventParticipation[];
  manualParticipationCounts: ManualParticipationCount[];
}

const loadDatabase = (): DatabaseConfig => {
  const savedData = localStorage.getItem('flightCrewTracker');
  if (savedData) {
    // Handle upgrading database structure if manualParticipationCounts is missing
    const parsedData = JSON.parse(savedData);
    if (!parsedData.manualParticipationCounts) {
      parsedData.manualParticipationCounts = [];
    }
    return parsedData;
  }
  
  return {
    callSigns: [
      { id: "1", code: "VA001", isActive: true },
      { id: "2", code: "VA002", isActive: true },
      { id: "3", code: "VA003", isActive: true },
    ],
    eventParticipations: [],
    manualParticipationCounts: []
  };
};

const saveDatabase = (data: DatabaseConfig) => {
  localStorage.setItem('flightCrewTracker', JSON.stringify(data));
};

export const db = {
  load: loadDatabase,
  save: saveDatabase
};
