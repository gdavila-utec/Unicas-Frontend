// Global API configuration
export interface ApiConfig {
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  baseURL: string;
  debug: boolean;
}

// Default configuration
const defaultConfig: ApiConfig = {
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://unicas-nest-backend-production.up.railway.app',
  debug: process.env.NODE_ENV === 'development',
};

// Configuration store
let currentConfig = { ...defaultConfig };

// Configuration methods
export const apiConfig = {
  // Get current configuration
  get(): ApiConfig {
    return { ...currentConfig };
  },

  // Update configuration
  update(config: Partial<ApiConfig>): void {
    currentConfig = {
      ...currentConfig,
      ...config,
    };

    if (currentConfig.debug) {
      console.log('API Configuration updated:', currentConfig);
    }
  },

  // Reset to defaults
  reset(): void {
    currentConfig = { ...defaultConfig };

    if (currentConfig.debug) {
      console.log('API Configuration reset to defaults');
    }
  },

  // Get specific setting
  getSetting<K extends keyof ApiConfig>(key: K): ApiConfig[K] {
    return currentConfig[key];
  },

  // Update specific setting
  setSetting<K extends keyof ApiConfig>(key: K, value: ApiConfig[K]): void {
    currentConfig[key] = value;

    if (currentConfig.debug) {
      console.log(`API Setting "${key}" updated:`, value);
    }
  },
};
