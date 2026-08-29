export type RuntimeEnvironment = "development" | "test" | "production";

export type AppConfig = {
  API_HOST: string;
  API_PORT: number;
  APP_VERSION: string;
  DATABASE_URL: string;
  ENABLE_SENTRY_TEST_ROUTE: "true" | "false";
  JWT_SECRET: string;
  LOG_LEVEL: string;
  NODE_ENV: RuntimeEnvironment;
  READY_DB_TIMEOUT_MS: number;
};

export const defaultAppConfig: AppConfig = {
  API_HOST: "0.0.0.0",
  API_PORT: 3000,
  APP_VERSION: "dev",
  DATABASE_URL: "postgresql://user:password@localhost:5432/escalaai_test",
  ENABLE_SENTRY_TEST_ROUTE: "false",
  JWT_SECRET: "test-secret",
  LOG_LEVEL: "info",
  NODE_ENV: "test",
  READY_DB_TIMEOUT_MS: 500,
};

export function resolveAppConfig(config: Partial<AppConfig> = {}): AppConfig {
  return {
    ...defaultAppConfig,
    ...config,
  };
}
