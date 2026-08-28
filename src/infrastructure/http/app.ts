import crypto from "node:crypto";
import type { Server } from "node:http";

import Fastify, { type FastifyHttpOptions } from "fastify";
const isDev = process.env.NODE_ENV !== "production";
type LoggerOption = NonNullable<FastifyHttpOptions<Server>["logger"]>;
export async function createApp() {
    const app = Fastify({
        genReqId: (req) => {
            const requestId = req.headers["x-request-id"];

            return typeof requestId === "string" ? requestId : crypto.randomUUID();
        },
    });

    app.addHook("onClose", async () => {
        // await disconnectPrismaClient();
    });


    // await registerSwagger(app);
    // registerMetrics(app);
    return app;
}