import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const BACKEND_API_ENDPOINT =
  extra.backendApiEndpoint ||
  process.env.EXPO_PUBLIC_BACKEND_API_ENDPOINT ||
  'http://localhost:8000';

export const ENV_NAME =
  extra.envName ||
  process.env.EXPO_PUBLIC_ENV_NAME ||
  'local';
