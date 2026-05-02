import { Conseption } from '@/domain/conseption/application/use-cases/conseption'
import { FastifyRequest, FastifyReply } from 'fastify'
import { inject, injectable } from 'tsyringe'

@injectable()
export class ConseptionController {
    private readonly service: Conseption
    constructor(@inject(Conseption) service: Conseption) {
        this.service = service
    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        const { Harmonizacao } = request.body as { Harmonizacao: string[]}
        try {
            const result = await this.service.create({ Harmonizacao })
            reply.status(201).send(result)
        } catch (error) {
            reply.status(500).send({ error: 'Failed to create conseption' })
        }
    }
}
