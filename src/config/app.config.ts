export const appConfig = {
  name: "Buen Asador",
  locale: "es-BO",
  currency: "BOB",
  timezone: "America/La_Paz",
  http: {
    timeout: 10_000,
    maxRetries: 2,
  },
  pagination: {
    defaultPage: 1,
    defaultPerPage: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
} as const;
