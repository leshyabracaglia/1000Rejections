export const ROUTES = {
  LOGIN: "/(auth)/login",
  RESET_PASSWORD: "/(auth)/reset-password",
  MAIN: "/(main)",
  SETTINGS: "/(main)/settings",
  ADD: "/(main)/add",
  REJECTION: (id: string) => `/(main)/rejection/${id}`,
} as const;
