export interface AppConfig {
  endpoint?: string;
  pixabayApiKey?: string;
}

const Environment = {
  Dev: 'Dev',
  Production: 'Production',
};

const getConfig = (env: string): AppConfig => {
  switch (env) {
    case Environment.Production:
    case Environment.Dev:
    default:
      return {
        endpoint: 'https://pixabay.com/api/',
        // Inlined at bundle time from the PIXABAY_API_KEY environment variable
        // (see .env.example); never commit a real key.
        pixabayApiKey: process.env.PIXABAY_API_KEY,
      };
  }
};

export const getAppConfig = (): AppConfig => {
  return getConfig(Environment.Production);
};
