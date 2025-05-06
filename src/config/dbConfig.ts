
interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// Valori di default che possono essere sovrascritti
const defaultConfig: MySQLConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aerosachs_events',
  port: 3306
};

// Esporta una funzione che permette di impostare la configurazione
let currentConfig = { ...defaultConfig };

export const setDatabaseConfig = (config: Partial<MySQLConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
  // Salva la configurazione in localStorage per mantenerla tra le sessioni
  localStorage.setItem('mysql_config', JSON.stringify(currentConfig));
};

export const getDatabaseConfig = (): MySQLConfig => {
  // Recupera la configurazione da localStorage se presente
  const savedConfig = localStorage.getItem('mysql_config');
  if (savedConfig) {
    try {
      const parsedConfig = JSON.parse(savedConfig);
      return { ...currentConfig, ...parsedConfig };
    } catch (e) {
      console.error('Errore nel parsing della configurazione salvata:', e);
    }
  }
  return currentConfig;
};
