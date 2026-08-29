import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";
const envFile = isTest ? ".env.test" : ".env";
const envPath = resolve(process.cwd(), envFile);

if (existsSync(envPath)) {
    config({ path: envPath });
}

const requiredString = (name: string) => z.string().trim().min(1, `${name} is required`);
const optionalString = z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
    z.string().trim().optional(),
);
const requiredStringWithTestDefault = (name: string, defaultValue: string) => {
    const schema = requiredString(name);

    return isTest ? schema.default(defaultValue) : schema;
};
const testDatabaseUrl = "postgresql://user:password@localhost:5432/escalaai_test";
const testJwtSecret = "test-secret";

const envSchema = z.object({
    API_PORT: z.coerce.number().int().positive().default(3000),
    API_HOST: z.string().trim().default("0.0.0.0"),
    APP_VERSION: z.string().trim().default("dev"),
    CORS_ORIGIN: z.string().trim().default("*"),
    DATABASE_CLIENT: z.string().trim().default("postgresql"),
    DATABASE_HOST: z.string().trim().default("localhost"),
    DATABASE_NAME: z.string().trim().default("escalaai"),
    DATABASE_PASSWORD: z.string().trim().default("password"),
    DATABASE_PORT: z.coerce.number().int().positive().default(5432),
    DATABASE_URL: requiredStringWithTestDefault("DATABASE_URL", testDatabaseUrl),
    DATABASE_URL_LOCAL: optionalString,
    DATABASE_USER: z.string().trim().default("user"),
    DEV_PORT: z.coerce.number().int().positive().default(3007),
    ENABLE_SENTRY_TEST_ROUTE: z.enum(["true", "false"]).default("false"),
    JWT_ACCESS_TTL: z.string().trim().default("15m"),
    JWT_REFRESH_TTL: z.string().trim().default("30d"),
    JWT_SECRET: requiredStringWithTestDefault("JWT_SECRET", testJwtSecret),
    LOG_LEVEL: z.string().trim().default("info"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    READY_DB_TIMEOUT_MS: z.coerce.number().int().positive().default(500),
    SENTRY_DSN: z.string().trim().default(""),
    SENTRY_ENABLE_LOGS: z.enum(["true", "false"]).default("false"),
    SENTRY_ENVIRONMENT: optionalString,
    SENTRY_LOG_LEVELS: z.string().trim().default("warn,error,fatal"),
    SENTRY_RELEASE: optionalString,
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Environment validation error:", parsedEnv.error.format());
    throw new Error("Failed to load environment variables.");
}

const data = parsedEnv.data;

export const env = {
    ...data,
    DATABASE_URL:
        data.NODE_ENV === "production"
            ? data.DATABASE_URL
            : (data.DATABASE_URL_LOCAL ?? data.DATABASE_URL),
};

export type Env = typeof env;
