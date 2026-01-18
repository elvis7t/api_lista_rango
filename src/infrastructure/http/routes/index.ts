import { FastifyInstance } from 'fastify'
import { injectable } from 'tsyringe'

@injectable()
export class Router {
    constructor() {}

    public registerRoutes(
        app: FastifyInstance,
        _options?: unknown,
        done?: (err?: Error) => void,
    ) {
        app.register(async (instance) => {
            instance.get('/health', async (_request, reply) => {
                return reply.status(200).send({ status: 'ok' })
            })
        })

        if (done) {
            done()
        }

        return app
    }
}
