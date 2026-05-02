import { FastifyInstance } from 'fastify'
import { inject, injectable } from 'tsyringe'
import { Router } from '@/infrastructure/interfaces/routes/router.interface'
import { ConseptionController } from '@/infrastructure/http/controllers/conseption/conseption.controller'

@injectable()
export class ConseptionRouter implements Router {
    constructor(
        @inject(ConseptionController) private readonly controller: ConseptionController
    ) { }
    registerRoutes(app: FastifyInstance, options?: unknown, done?: (err?: Error) => void): FastifyInstance {
        app.post('/conseption', async (request, reply) => {
            return this.controller.create(request, reply)
        })

        if (done) {
            done()
        }
        return app
    }
}
