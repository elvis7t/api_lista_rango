import { config } from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

// Carrega o arquivo .env correto
if (process.env.NODE_ENV === 'test') {
    config({ path: resolve(process.cwd(), '.env.test') });
} else {
    config({ path: resolve(process.cwd(), '.env') });
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().default(3070),
    DEV_PORT: z.coerce.number().default(3077),
    API_HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z.string().default('*'),
    DATABASE_CLIENT: z.string().default(''),
    DATABASE_URL: z.string().default('postgres://user:password@db:5432/apisolid'),
    DATABASE_URL_LOCAL: z.string().default('postgres://user:password@db:5432/apisolid'),
    DATABASE_PORT: z.coerce.number().default(5432),
    DATABASE_USERNAME: z.string().default('root'),
    DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD é obrigatório'),
    DATABASE_NAME: z.string().default('apisolid'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Erro de validação de ambiente:', _env.error.format());
    throw new Error('Falha ao carregar as variáveis de ambiente.');
}

// Exporta as variáveis de forma tipada diretamente
export const env = {
    ..._env.data,
    DATABASE_URL: process.env.NODE_ENV === 'production'
        ? _env.data.DATABASE_URL
        : _env.data.DATABASE_URL_LOCAL,
};
