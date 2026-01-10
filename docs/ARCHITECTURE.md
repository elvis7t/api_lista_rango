# Arquitetura – Goomer Lista Rango

Este documento detalha a arquitetura da API **Goomer Lista Rango**, complementando o README principal com foco em **system design**, **fluxos principais** e **decisões técnicas**.

---

## 1. Visão Geral

A aplicação foi desenhada como um **monólito modular** em Node.js + TypeScript, organizado em **módulos de domínio** (restaurants, products, promotions, menu, auth, files) e camadas claras de infraestrutura (banco, cache, storage, segurança).

O objetivo é:

- Atender ao desafio técnico com uma API coesa e bem estruturada.
- Facilitar manutenção e evolução futura (separação por módulos).
- Permitir, no futuro, uma migração gradual para microserviços, caso necessário.

---

## 2. Visão Lógica (Camadas)

### 2.1. Camadas Principais

1. **Camada de Interface (HTTP)**
   - Framework HTTP (Fastify/Express).
   - Rotas REST organizadas por módulo:
     - `/restaurants`, `/products`, `/promotions`, `/menu`, `/auth`, `/files`.
   - Middlewares globais:
     - Logger de requisição/resposta.
     - Tratamento global de erros.
     - Parser de JSON.
   - Middlewares específicos:
     - Autenticação JWT.
     - Validação de API-Key.
     - (Opcional) Rate limiting.

2. **Camada de Aplicação (Serviços / Use Cases)**
   - Implementa os **casos de uso** da aplicação.
   - Exemplos:
     - `CreateRestaurant`
     - `ListRestaurants`
     - `CreateProduct`
     - `CreatePromotion`
     - `GetMenu`
     - `Login`, `RefreshToken`
   - Responsável por:
     - Orquestrar chamadas a repositórios.
     - Coordenar transações.
     - Invocar lógica de domínio (ex.: regras de promoções ativas).

3. **Camada de Domínio**
   - Modelos e regras de negócio puras (sem dependência de infraestrutura).
   - Entidades:
     - Restaurant, Product, Promotion.
   - Value Objects:
     - OpeningHours, PromotionSchedule, Money (opcional).
   - Regras de negócio:
     - Validação de horários (intervalos, 15 minutos).
     - Determinação de promoções ativas.
     - Cálculo do preço atual (normal vs promocional).

4. **Camada de Infraestrutura**
   - Comunicação com serviços externos:
     - PostgreSQL (repositórios).
     - Redis (cache, rate limit).
     - Cloudflare R2 (upload de imagens).
   - Implementação de interfaces definidas na camada de aplicação/domínio:
     - Interfaces de repositório.
     - Interface de storage.
   - Configuração de:
     - Pool de conexões.
     - Transações.
     - Clientes de cache/storage.

---

## 3. Visão Física (Componentes)

### 3.1. Componentes e Interações

- **Clientes**
  - Frontend/admin ou ferramentas como Postman.
  - Sistemas externos que consomem o cardápio via API-Key.

- **API Server (Node.js)**
  - Recebe as requisições HTTP.
  - Aplica middlewares de autenticação, API-Key e validações.
  - Encaminha para os serviços de aplicação.

- **PostgreSQL**
  - Armazena:
    - Restaurantes e seus horários de funcionamento.
    - Produtos, suas categorias, visibilidade e ordenação.
    - Promoções e seus schedules.
    - Usuários/admins.
    - Refresh tokens.
    - API Keys.

- **Redis**
  - Cache de:
    - Listas (restaurantes, produtos).
    - Cardápio consolidado.
  - (Opcional) Rate limit.

- **Cloudflare R2**
  - Armazena as imagens:
    - Foto do restaurante.
    - Foto do produto.
  - Banco guarda apenas as URLs.

---

## 4. Fluxos Principais

### 4.1. Fluxo de Autenticação (JWT + Refresh Token)

1. **Login (`POST /auth/login`)**
   - Cliente envia email/senha.
   - API valida credenciais no banco.
   - Em caso de sucesso:
     - Gera **access token (JWT)** com:
       - `sub` (id do usuário).
       - `role` (perfil).
       - Tempo de expiração curto (ex.: 15 min).
     - Gera **refresh token** (string ou JWT separado):
       - Persistido em banco (hash) com vínculo ao usuário.
     - Retorna ambos ao cliente.

2. **Uso do access token**
   - Em rotas protegidas, o cliente envia `Authorization: Bearer <token>`.
   - Middleware JWT:
     - Valida assinatura e expiração.
     - Extrai `sub` e `role` para o contexto da requisição.

3. **Renovação de token (`POST /auth/refresh`)**
   - Cliente envia o refresh token.
   - API:
     - Valida formato.
     - Verifica se existe em banco e não está revogado.
     - Emite novo access token.
   - Opcionalmente, gera novo refresh token.

4. **Logout (`POST /auth/logout`)**
   - Cliente envia refresh token.
   - API marca o token como revogado no banco.

### 4.2. Fluxo de Validação de API-Key

- Usado em rotas como `GET /restaurants/:id/menu`.
- Cliente envia header `x-api-key`.
- Middleware:
  - Localiza hash da chave em `api_keys`.
  - Verifica se a chave está ativa.
  - Em caso de falha, retorna erro 401/403.
- Permite:
  - Diferenciar consumo interno/externo.
  - Aplicar rate limit por chave.

---

### 4.3. Fluxo de Cadastro de Restaurante

1. Cliente envia requisição para `POST /restaurants` com:
   - Dados do restaurante.
   - Lista de horários de funcionamento.

2. API:
   - Valida payload.
   - Inicia **transação no PostgreSQL**.
   - Cria registro do restaurante.
   - Cria registros de horários de funcionamento vinculados.
   - Comita transação.

3. Cache:
   - Invalida cache relacionado à lista de restaurantes.

---

### 4.4. Fluxo de Cadastro de Produto

1. Cliente chama `POST /restaurants/:id/products`.
2. API:
   - Verifica existência do restaurante.
   - Valida dados do produto (nome, categoria, preço).
   - Define `sort_order` inicial (ex.: último + 1).
   - Insere o produto no banco.
3. Cache:
   - Invalida cache de produtos e cardápio do restaurante.

---

### 4.5. Fluxo de Cadastro de Promoção

1. Cliente chama `POST /products/:id/promotions` com:
   - Descrição.
   - Preço promocional.
   - Lista de schedules (dia da semana + horário de início/fim).

2. API:
   - Valida se o produto existe.
   - Valida horários (múltiplos de 15 minutos).
   - Inicia transação:
     - Cria promoção.
     - Cria schedules vinculados.
   - Comita transação.

3. Cache:
   - Invalida cardápio do restaurante do produto.

---

### 4.6. Fluxo de Cardápio Consolidado (`GET /restaurants/:id/menu`)

1. Cliente chama o endpoint, incluindo API-Key (se exigido).
2. Middleware de API-Key valida o acesso.
3. API verifica se o cardápio está no **cache (Redis)**:
   - Se estiver:
     - Retorna direto do cache.
   - Se não estiver:
     1. Obtém dados do restaurante (para timezone).
     2. Calcula horário atual no timezone do restaurante.
     3. Busca no banco:
        - Produtos visíveis não deletados.
        - Promoções vinculadas com schedules compatíveis com o horário atual.
     4. Determina para cada produto:
        - Preço atual (normal vs promocional).
     5. Monta estrutura de cardápio (podendo agrupar por categoria).
     6. Armazena resultado no Redis com chave contendo restaurante e um bucket de tempo.
4. Retorna o cardápio consolidado.

---

### 4.7. Fluxo de Upload de Imagem (Cloudflare R2)

1. Cliente envia arquivo via multipart/form-data para:
   - `POST /restaurants/:id/photo` ou
   - `POST /restaurants/:id/products/:productId/photo`.

2. API:
   - Valida tipo e tamanho do arquivo.
   - Gera nome único para o objeto (ex.: prefixado com o ID do recurso).
   - Envia o arquivo para Cloudflare R2 usando o SDK S3-compatible.
   - Obtém a URL pública (ou path) resultante.
   - Atualiza o registro no banco (restaurante ou produto) com a URL.
   - (Opcional) Invalida cache de cardápio/listas relacionadas.

---

## 5. Estratégia de Cache

### 5.1. O que é cacheado

- **Listagem de restaurantes**
  - Chaves por página e parâmetros de consulta.
  - Invalidação ao criar/editar/deletar restaurante.

- **Cardápio consolidado**
  - Chave:
    - `menu:{restaurantId}:{bucketDeTempo}`
  - `bucketDeTempo` pode ser:
    - A hora atual (ex.: `2025-12-04T14`) ou
    - Intervalos de 15 minutos.
  - Invalidação ao alterar:
    - Produtos do restaurante.
    - Promoções do restaurante.
    - Dados principais do restaurante.

### 5.2. TTL e consistência

- TTL moderado (ex.: alguns minutos) para equilibrar:
  - Performance.
  - Atualização de promoções/preços.
- Como as promoções são sensíveis a horário, a existência de buckets de tempo reduz a chance de inconsistência visual sem exigir invalidações complexas.

---

## 6. Tratamento de Timezone e Horários

### 6.1. Timezone por restaurante

- Cada restaurante possui um campo `timezone` (ex.: `America/Sao_Paulo`).
- Toda lógica de:
  - Horário de funcionamento.
  - Promoções ativas.
  - Cardápio “agora”.
- É feita considerando o horário atual convertido para o timezone do restaurante.

### 6.2. Intervalos de 15 minutos

- Schedules de promoções requerem horários com múltiplos de 15 minutos.
- Validação:
  - Feita em nível de domínio (regra de negócio).
  - Refletida também em constraints no banco, quando possível.

---

## 7. Segurança

- **JWT**:
  - Segredo de assinatura armazenado em variável de ambiente.
  - Tokens com expiração curta para minimizar riscos.
- **Refresh tokens**:
  - Armazenados como hash no banco.
  - Permitem revogação segura.
- **API-Key**:
  - Usada para controlar consumo externo de rotas como cardápio.
  - Permite rate limiting por chave.
- **Validação de entrada**:
  - Payloads de entrada são validados na camada HTTP antes de chegar no domínio.
- **Erros e logs**:
  - Erros críticos são logados.
  - Respostas padronizadas evitam vazar detalhes de implementação.

---

## 8. Possíveis Evoluções Futuras

- Separar módulos (por exemplo, `menu` e `files`) em serviços independentes, se a carga aumentar.
- Adicionar fila de processamento (ex.: para redimensionar imagens de forma assíncrona).
- Integrar monitoramento e métricas (APM, dashboards de performance).
- Adicionar camadas de observabilidade (tracing distribuído).

---

Esta arquitetura foi pensada para ser **prática, legível e extensível**, atendendo ao escopo do desafio técnico enquanto demonstra preocupações típicas de sistemas em produção: segurança, cache, consistência de dados e clareza de responsabilidades.
