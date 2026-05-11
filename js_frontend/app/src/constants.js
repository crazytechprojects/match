const ENV_NAME = import.meta.env.VITE_ENV_NAME || "local";
const BACKEND_API_ENDPOINT =
  import.meta.env.VITE_BACKEND_API_ENDPOINT || "http://localhost:8000";

export { BACKEND_API_ENDPOINT, ENV_NAME };
