import { FastifyInstance } from 'fastify'
import { inject, injectable } from 'tsyringe'
import { Router as RouterInterface } from '@/infrastructure/interfaces'
import { ConseptionRouter } from './conseption.router'

@injectable()
export class Router implements RouterInterface {
    constructor(
        @inject(ConseptionRouter) private conseptionRouter: ConseptionRouter
    ) {
        this.conseptionRouter = conseptionRouter
    }

    public registerRoutes(
        app: FastifyInstance,
        _options?: unknown,
        done?: (err?: Error) => void,
    ) {
        app.register(async (instance) => {
            // Health Check
            instance.get('/health', {
                schema: {
                    tags: ['Health'],
                    description: 'Verifica se a API está funcionando',
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                status: { type: 'string', example: 'ok' },
                                timestamp: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }, async (_request, reply) => {
                return reply.status(200).send({
                    status: 'ok',
                    timestamp: new Date().toISOString()
                })
            })
        })

        app.register(this.conseptionRouter.registerRoutes.bind(this.conseptionRouter), { prefix: '/v1' })

        if (done) {
            done()
        }

        return app
    }
}
