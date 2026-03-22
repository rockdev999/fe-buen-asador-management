export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "Buen Asador",
  VERSION: import.meta.env.VITE_VERSION ?? "1.0.0",
} as const;
