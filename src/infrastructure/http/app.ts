import crypto from "node:crypto";
import type { Server } from "node:http";
import Fastify, { type FastifyHttpOptions } from "fastify";

import { type AppConfig } from "../config/app-config.js";
import { registerRoutes, type RegisterRoutesOptions } from "../routes/index.js";

type LoggerOption = NonNullable<FastifyHttpOptions<Server>["logger"]>;

type CreateAppOptions = {
    // auth?: RegisterRoutesOptions["auth"];
    config?: Partial<AppConfig>;
    logger?: LoggerOption;
    // ready?: RegisterRoutesOptions["ready"];
};

export async function createApp(options: CreateAppOptions = {}) {
    const app = Fastify({
        genReqId: (req) => {
            const requestId = req.headers["x-request-id"];

            return typeof requestId === "string" ? requestId : crypto.randomUUID();
        },
        logger: options.logger,
    });

    app.addHook("onClose", async () => {
        console.log("onClose");
        // await disconnectPrismaClient();
    });

    await registerRoutes(app, {
        config: options.config,
    });

    // await registerSwagger(app);
    // registerMetrics(app);
    return app;
}