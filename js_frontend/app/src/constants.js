const ENV_NAME = import.meta.env.VITE_ENV_NAME;

let BACKEND_API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT;

if (!ENV_NAME || ENV_NAME === "local") {
  BACKEND_API_ENDPOINT = "http://localhost:8000";
} else if (ENV_NAME === "dev") {
  BACKEND_API_ENDPOINT = "https://i5qx.us-east-2.awsapprunner.com";
}

export { BACKEND_API_ENDPOINT, ENV_NAME };
