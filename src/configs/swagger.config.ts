import { FastifyInstance } from 'fastify'
import { injectable } from 'tsyringe'

@injectable()
export class SwaggerConfig {
  public async register(app: FastifyInstance) {    
    const port = process.env.NODE_ENV === 'development' 
      ? process.env.DEV_PORT || '3007'
      : process.env.API_PORT || '3000'

    await app.register(import('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'API Lista Rango',
          description: 'API para gerenciar restaurantes, produtos, promoções e cardápio',
          version: '1.0.0',
          contact: {
            name: 'Elvis Leite',
            email: 'elvis@example.com'
          }
        },
        host: `localhost:${port}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'Health', description: 'Verificação de saúde da API' },
          { name: 'Auth', description: 'Autenticação e tokens' },
          { name: 'Restaurants', description: 'Gerenciamento de restaurantes' },
          { name: 'Products', description: 'Gerenciamento de produtos' },
          { name: 'Promotions', description: 'Gerenciamento de promoções' },
          { name: 'Menu', description: 'Cardápio consolidado' },
          { name: 'Files', description: 'Upload de imagens' }
        ],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT Token - formato: Bearer {token}'
          },
          ApiKey: {
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header',
            description: 'API Key para consumo externo'
          }
        },
        security: [
          { Bearer: [] },
          { ApiKey: [] }
        ]
      }
    })

    await app.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClonePath: true
    })
  }
}
