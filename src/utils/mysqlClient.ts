
import mysql from 'mysql2/promise';
import { getDatabaseConfig } from '../config/dbConfig';

// Pool di connessioni per gestire le query in modo efficiente
let pool: mysql.Pool | null = null;

// Funzione per inizializzare il pool di connessioni
export const initializePool = async (): Promise<mysql.Pool> => {
  try {
    const config = getDatabaseConfig();
    
    if (pool) {
      await pool.end(); // Chiude il pool esistente se presente
    }
    
    pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Verifica che la connessione funzioni
    await pool.query('SELECT 1');
    console.log('Connessione MySQL stabilita con successo');
    
    return pool;
  } catch (error) {
    console.error('Errore nella connessione a MySQL:', error);
    throw error;
  }
};

// Funzione per eseguire query
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  try {
    if (!pool) {
      await initializePool();
    }
    
    if (!pool) {
      throw new Error('Impossibile inizializzare la connessione MySQL');
    }
    
    const [rows] = await pool.query(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Errore nell\'esecuzione della query:', error);
    throw error;
  }
};

// Funzione per creare le tabelle se non esistono
export const setupDatabase = async (): Promise<void> => {
  try {
    const createCallsignsTable = `
      CREATE TABLE IF NOT EXISTS callsigns (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createEventParticipationsTable = `
      CREATE TABLE IF NOT EXISTS event_participations (
        id VARCHAR(36) PRIMARY KEY,
        callsign_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        departure_airport VARCHAR(5) NOT NULL,
        arrival_airport VARCHAR(5) NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        FOREIGN KEY (callsign_id) REFERENCES callsigns(id) ON DELETE CASCADE
      )
    `;
    
    const createManualParticipationCountsTable = `
      CREATE TABLE IF NOT EXISTS manual_participation_counts (
        id VARCHAR(36) PRIMARY KEY,
        callsign_id VARCHAR(36) NOT NULL,
        count INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(36) NULL,
        FOREIGN KEY (callsign_id) REFERENCES callsigns(id) ON DELETE CASCADE
      )
    `;
    
    await executeQuery(createCallsignsTable);
    await executeQuery(createEventParticipationsTable);
    await executeQuery(createManualParticipationCountsTable);
    
    console.log('Struttura del database creata con successo');
  } catch (error) {
    console.error('Errore nella creazione delle tabelle:', error);
    throw error;
  }
};

// Esporta un oggetto con tutte le funzioni necessarie
export const mysqlClient = {
  initializePool,
  executeQuery,
  setupDatabase
};
