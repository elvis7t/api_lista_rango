import { FastifyInstance } from 'fastify'
import { inject, injectable } from 'tsyringe'
import { Router as RouterInterface } from '@/infrastructure/interfaces'

@injectable()
export class Router implements RouterInterface {
    constructor() {}

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

        if (done) {
            done()
        }

        return app
    }
}
