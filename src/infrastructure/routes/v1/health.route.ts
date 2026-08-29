import type { FastifyInstance } from "fastify";

const healthResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "object",
      additionalProperties: false,
      required: ["status", "uptime", "version", "timestamp"],
      properties: {
        status: {
          type: "string",
          examples: ["ok"],
        },
        uptime: {
          type: "number",
          description: "Uptime in seconds",
        },
        version: {
          type: "string",
          description: "Application version",
        },
        timestamp: {
          type: "string",
          format: "date-time",
        },
      },
    },
  },
} as const;

export type RegisterHealthRouteOptions = {
  appVersion: string;
};

export async function registerHealthRoute(
  app: FastifyInstance,
  options: RegisterHealthRouteOptions,
): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns the current health status of the API.",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => {
      return {
        data: {
          status: "ok",
          uptime: process.uptime(),
          version: options.appVersion,
          timestamp: new Date().toISOString(),
        },
      };
    },
  );
}
