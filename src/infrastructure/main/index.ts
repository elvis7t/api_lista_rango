import { env } from '../config/env.js';
import { createApp } from "../http/app.js";


export async function startServer(): Promise<void> {
  const app = await createApp();
  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    }).then((address) => {
      console.info(`🎉 API is running on port: ${address}`)
    });
  } catch (error) {
    app.log.error(error);
    console.error('❌ Error on starting application:', error instanceof Error ? error.stack : error);
    process.exitCode = 1;
    throw error;
  }
}

const isEntrypoint = import.meta.url === `file://${process.argv[1]}`;

if (isEntrypoint) {
  await startServer();
}
