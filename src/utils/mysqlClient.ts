
// This file implements a browser-compatible mock of MySQL functionality
// using localStorage instead of actual MySQL connections

import { getDatabaseConfig } from '../config/dbConfig';

// Flag to track connection status
let isConnected = false;

// Initialize the connection to our mock database
export const initializePool = async (): Promise<any> => {
  try {
    // Check if we can access localStorage (this could throw in some contexts)
    localStorage.getItem('test');
    
    // We'll consider the connection successful if we can access localStorage
    isConnected = true;
    console.log('Mock MySQL connection established');
    
    return { connected: true };
  } catch (error) {
    console.error('Error establishing mock MySQL connection:', error);
    isConnected = false;
    throw error;
  }
};

// Execute a query on our mock database (localStorage)
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  try {
    // Load all data from localStorage
    const data = loadAllData();
    
    // Parse the query to determine operation and table
    if (query.toUpperCase().startsWith('SELECT')) {
      return handleSelect(query, data);
    } else if (query.toUpperCase().startsWith('INSERT')) {
      return handleInsert(query, params, data);
    } else if (query.toUpperCase().startsWith('UPDATE')) {
      return handleUpdate(query, params, data);
    } else if (query.toUpperCase().startsWith('DELETE')) {
      return handleDelete(query, params, data);
    } else if (query.toUpperCase().startsWith('CREATE TABLE')) {
      return handleCreateTable(query, data);
    }
    
    return [] as T[];
  } catch (error) {
    console.error('Error in mock query execution:', error);
    throw error;
  }
};

// Function to create database tables if they don't exist
export const setupDatabase = async (): Promise<void> => {
  try {
    // Initialize tables if they don't exist
    const data = loadAllData();
    
    if (!data.callsigns) {
      data.callsigns = [];
      saveTable('callsigns', data.callsigns);
    }
    
    if (!data.event_participations) {
      data.event_participations = [];
      saveTable('event_participations', data.event_participations);
    }
    
    if (!data.manual_participation_counts) {
      data.manual_participation_counts = [];
      saveTable('manual_participation_counts', data.manual_participation_counts);
    }
    
    console.log('Mock database tables initialized');
  } catch (error) {
    console.error('Error in mock database setup:', error);
    throw error;
  }
};

// Helper functions for data manipulation
function loadAllData() {
  const dataStr = localStorage.getItem('mock_mysql_data');
  return dataStr ? JSON.parse(dataStr) : {};
}

function saveAllData(data: any) {
  localStorage.setItem('mock_mysql_data', JSON.stringify(data));
}

function loadTable(tableName: string) {
  const data = loadAllData();
  return data[tableName] || [];
}

function saveTable(tableName: string, tableData: any[]) {
  const data = loadAllData();
  data[tableName] = tableData;
  saveAllData(data);
}

// Query handlers
function handleSelect(query: string, data: any) {
  // Extract table name from the query
  // This is a simplified parser, in a real app we'd use a proper SQL parser
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (!tableMatch || !tableMatch[1]) {
    return [];
  }
  
  const tableName = tableMatch[1].toLowerCase();
  return data[tableName] || [];
}

function handleInsert(query: string, params: any[], data: any) {
  // Extract table name from the query
  const tableMatch = query.match(/INTO\s+(\w+)/i);
  if (!tableMatch || !tableMatch[1]) {
    return [];
  }
  
  const tableName = tableMatch[1].toLowerCase();
  let tableData = data[tableName] || [];
  
  // Create a new record from params
  // This is very simplified - in a real implementation we'd parse the field names
  let record: any = {};
  
  // Extract column names from query
  const columnsMatch = query.match(/\(([^)]+)\)/);
  if (columnsMatch && columnsMatch[1]) {
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    
    // Map params to columns
    columns.forEach((column, index) => {
      if (index < params.length) {
        record[column] = params[index];
      }
    });
  }
  
  // Add record to table
  tableData.push(record);
  
  // Save updated table
  data[tableName] = tableData;
  saveAllData(data);
  
  return [record];
}

function handleUpdate(query: string, params: any[], data: any) {
  // Extract table name
  const tableMatch = query.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch || !tableMatch[1]) {
    return [];
  }
  
  const tableName = tableMatch[1].toLowerCase();
  let tableData = data[tableName] || [];
  
  // Extract WHERE clause
  const whereMatch = query.match(/WHERE\s+([\w\s.=?]+)/i);
  if (whereMatch && whereMatch[1]) {
    const whereColumn = whereMatch[1].split('=')[0].trim();
    const paramIndex = params.length - 1; // Assuming the WHERE param is the last one
    
    // Extract SET clauses
    const setMatch = query.match(/SET\s+([\w\s,.=?]+)/i);
    if (setMatch && setMatch[1]) {
      const setClauses = setMatch[1].split(',').map(clause => clause.trim());
      
      // Update matching records
      tableData = tableData.map(record => {
        if (record[whereColumn] === params[paramIndex]) {
          let updatedRecord = { ...record };
          
          setClauses.forEach((clause, index) => {
            const columnName = clause.split('=')[0].trim();
            updatedRecord[columnName] = params[index];
          });
          
          return updatedRecord;
        }
        return record;
      });
      
      // Save updated table
      data[tableName] = tableData;
      saveAllData(data);
    }
  }
  
  return tableData;
}

function handleDelete(query: string, params: any[], data: any) {
  // Extract table name
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (!tableMatch || !tableMatch[1]) {
    return [];
  }
  
  const tableName = tableMatch[1].toLowerCase();
  let tableData = data[tableName] || [];
  
  // Extract WHERE clause
  const whereMatch = query.match(/WHERE\s+([\w\s.=?]+)/i);
  if (whereMatch && whereMatch[1]) {
    const whereColumn = whereMatch[1].split('=')[0].trim();
    
    // Filter out the record(s) to delete
    tableData = tableData.filter(record => record[whereColumn] !== params[0]);
    
    // Also handle CASCADE delete
    if (tableName === 'callsigns') {
      // Handle ON DELETE CASCADE for event_participations
      let epData = data.event_participations || [];
      epData = epData.filter(ep => ep.callsign_id !== params[0]);
      data.event_participations = epData;
      
      // Handle ON DELETE CASCADE for manual_participation_counts
      let mpcData = data.manual_participation_counts || [];
      mpcData = mpcData.filter(mpc => mpc.callsign_id !== params[0]);
      data.manual_participation_counts = mpcData;
    }
    
    // Save updated table
    data[tableName] = tableData;
    saveAllData(data);
  }
  
  return tableData;
}

function handleCreateTable(query: string, data: any) {
  // Extract table name
  const tableMatch = query.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i);
  if (!tableMatch || !tableMatch[1]) {
    return [];
  }
  
  const tableName = tableMatch[1].toLowerCase();
  
  // Initialize the table if it doesn't exist
  if (!data[tableName]) {
    data[tableName] = [];
    saveAllData(data);
  }
  
  return [];
}

// Export a client object with all the functions
export const mysqlClient = {
  initializePool,
  executeQuery,
  setupDatabase,
  isConnected: () => isConnected
};
