import type { FastifyInstance } from 'fastify'

export type Router = {
  registerRoutes(
    app: FastifyInstance,
    options?: unknown,
    done?: (err?: Error) => void,
  ): FastifyInstance
}
