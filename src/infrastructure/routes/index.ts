import type { FastifyInstance } from "fastify";

import { resolveAppConfig, type AppConfig } from "../config/app-config.ts";
import { registerHealthRoute } from "./v1/health.route.js";

export type RegisterRoutesOptions = {
    config?: Partial<AppConfig>;
    //   ready?: RegisterReadyRouteOptions;
};


export async function registerRoutes(
    app: FastifyInstance,
    options: RegisterRoutesOptions = {},
): Promise<void> {
    const config = resolveAppConfig(options.config);

    await app.register(
        async (v1) => {
            await registerHealthRoute(v1, {
                appVersion: config.APP_VERSION,
            });
            // await registerReadyRoute(v1, {
            //     ...options.ready,
            //     readyDbTimeoutMs: config.READY_DB_TIMEOUT_MS,
            // });
        },
        { prefix: "/v1" },
    );
}
