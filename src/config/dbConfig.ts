interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// Default values that can be overridden
const defaultConfig: MySQLConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aerosachs_events',
  port: 3306
};

// Export a function that allows setting the configuration
let currentConfig = { ...defaultConfig };

export const setDatabaseConfig = (config: Partial<MySQLConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
  // Save configuration in localStorage to keep it between sessions
  localStorage.setItem('mysql_config', JSON.stringify(currentConfig));
};

export const getDatabaseConfig = (): MySQLConfig => {
  // Get configuration from localStorage if present
  const savedConfig = localStorage.getItem('mysql_config');
  if (savedConfig) {
    try {
      const parsedConfig = JSON.parse(savedConfig);
      return { ...currentConfig, ...parsedConfig };
    } catch (e) {
      console.error('Error parsing saved configuration:', e);
    }
  }
  return currentConfig;
};
