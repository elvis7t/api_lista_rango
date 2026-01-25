import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { main } from '@/app'

describe('GET /health', () => {
    let app: FastifyInstance

    beforeAll(async () => {
        process.env.NODE_ENV = 'test'
        app = main().app
        await app.ready()
    })

    afterAll(async () => {
        if (app) {
            await app.close()
        }
    })

    it('returns ok', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/health',
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ status: 'ok' })
    })
})
