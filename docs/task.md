# TASKS.md – Plano de Trabalho por Épico

Este arquivo organiza o desenvolvimento da API **Goomer Lista Rango** em **épicos** e **tarefas detalhadas**, na ordem sugerida de implementação.

Cada tarefa contém:
- **Objetivo**
- **Dependências**
- **Passos recomendados**
- **Definição de Pronto (DoD – Definition of Done)**

Você pode ir marcando o progresso adicionando `✓` ao lado de cada tarefa concluída.

---

## Épico 0 – Fundamentos e Ambiente

### Tarefa 0.1 – Inicializar repositório e estrutura básica do projeto

**Objetivo**  
Criar a base do projeto Node.js + TypeScript, com estrutura mínima de pastas, scripts e configuração inicial.

**Dependências**  
- Node.js instalado
- Git configurado

**Passos**  
1. Inicializar o repositório Git.
2. Criar a pasta do projeto e rodar `npm init` ou equivalente.
3. Adicionar TypeScript como dependência e configurar `tsconfig.json`.
4. Definir estrutura inicial de pastas:
   - `src/`
   - `tests/`
   - `docs/`
5. Criar um arquivo de entrada (ex.: `src/server.ts`) apenas com um log simples.
6. Configurar scripts no `package.json`:
   - `dev` (rodando com ts-node-dev ou equivalente).
   - `build` (compila TS para JS).
   - `start` (roda o build).
7. Criar `.editorconfig`, `.gitignore` e, se quiser, configuração inicial de lint (ESLint/Prettier).

**Definição de Pronto**  
- Projeto inicializa, compila e roda sem erros com `npm run dev`.
- Estrutura de pastas básica criada e versionada no Git.

---

### Tarefa 0.2 – Subir Postgres e Redis com Docker Compose

**Objetivo**  
Ter um ambiente local com PostgreSQL e Redis funcionando, acessíveis pela aplicação.

**Dependências**  
- Docker e Docker Compose instalados.
- Tarefa 0.1 concluída.

**Passos**  
1. Criar um arquivo `docker-compose.yml` na raiz do projeto.
2. Definir serviços:
   - `postgres` com:
     - Porta exposta (ex.: 5432).
     - Usuário, senha e database (ex.: `goomer`, `goomer`, `goomer`).
   - `redis` com:
     - Porta exposta (ex.: 6379).
3. Criar arquivo `.env.example` com:
   - `DATABASE_URL`
   - `REDIS_URL`
   - Segredos de JWT (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
   - Configs de R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY`, etc.)
4. Subir os serviços com `docker compose up -d`.
5. Testar conexão manual no Postgres (por exemplo, via psql ou GUI) para garantir que está ok.

**Definição de Pronto**  
- Containers de Postgres e Redis sobem sem erro.
- Variáveis de ambiente de conexão definidas em `.env.example`.

---

### Tarefa 0.3 – Configurar framework de testes e teste inicial

**Objetivo**  
Configurar o ambiente de testes (Jest/Vitest) e garantir que o ciclo de testes está funcionando desde o início.

**Dependências**  
- Tarefa 0.1 concluída.

**Passos**  
1. Instalar Jest ou Vitest como dependência de desenvolvimento.
2. Configurar o runner de testes para TypeScript.
3. Criar um script `test` no `package.json`.
4. Criar um teste simples (ex.: `tests/health.spec.ts`) que verifica algo básico (`expect(true).toBe(true)` ou similar).
5. Rodar `npm test` e garantir que os testes passam.

**Definição de Pronto**  
- `npm test` roda sem erros.
- Ambiente de testes pronto para receber testes de negócio.

---

### Tarefa 0.4 – Configurar servidor HTTP e health-check

**Objetivo**  
Subir um servidor HTTP básico (Fastify/Express) com uma rota de health-check e log mínimo.

**Dependências**  
- Tarefa 0.1 concluída.

**Passos**  
1. Instalar Fastify ou Express.
2. Criar um arquivo de boot (ex.: `src/app.ts`) que:
   - Cria a instância do servidor.
   - Registra middlewares básicos (JSON, logger simples).
   - Registra uma rota `GET /health` que retorna `{ status: 'ok' }`.
3. Criar um arquivo `src/server.ts` que:
   - Importa `app`.
   - Inicia o servidor na porta configurada (ex.: 3000).
4. Configurar logs mínimos (pode ser o logger built-in do Fastify).

**Definição de Pronto**  
- `npm run dev` sobe o servidor.
- `GET /health` responde com status HTTP 200 e um JSON simples.
- Logger básico aparecendo no console.

---

## Épico 1 – Modelagem de Domínio e Banco de Dados

### Tarefa 1.1 – Modelagem conceitual (entidades e relacionamentos)

**Objetivo**  
Desenhar o domínio de dados em alto nível antes de criar tabelas/migrations.

**Dependências**  
- Épico 0 concluído.

**Passos**  
1. Listar entidades principais:
   - Restaurant
   - RestaurantOpeningHour
   - Product
   - Promotion
   - PromotionSchedule
   - User
   - RefreshToken
   - ApiKey
2. Para cada entidade, definir:
   - Campos necessários (nome, tipo, obrigatoriedade).
   - Relacionamentos (one-to-many, many-to-one).
3. Definir:
   - Uso de UUID como chave primária.
   - Campos de auditoria (`created_at`, `updated_at`, `deleted_at` onde fizer sentido).
   - Campos específicos:
     - `price_cents` para valores monetários.
     - `timezone` no restaurante.
     - Flags de `visible` e `active`.
4. Registrar esse desenho em um documento (pode ser `docs/domain-model.md` ou num bloco no ARCHITECTURE.md).

**Definição de Pronto**  
- Modelo conceitual de dados documentado.
- Entidades, campos e relacionamentos claros.

---

### Tarefa 1.2 – Criar migrations do PostgreSQL

**Objetivo**  
Materializar o modelo conceitual em tabelas reais no Postgres utilizando migrations.

**Dependências**  
- Tarefa 1.1 concluída.
- Postgres disponível (épico 0).

**Passos**  
1. Escolher ferramenta de migrations (Prisma/TypeORM/Knex ou outra).
2. Configurar a ferramenta para usar `DATABASE_URL`.
3. Criar migrations para:
   - `restaurants` e `restaurant_opening_hours`.
   - `products`.
   - `promotions` e `promotion_schedules`.
   - `users`, `refresh_tokens`.
   - `api_keys`.
4. Incluir constraints:
   - FKs entre tabelas.
   - Checks para `weekday` (0–6).
   - Campos `NOT NULL` apropriados.
5. Rodar as migrations contra o banco local.
6. Validar estruturas com uma ferramenta (psql, GUI, etc.).

**Definição de Pronto**  
- Todas as tabelas necessárias existem no Postgres.
- Migrations rodam sem erros.
- Estrutura do banco corresponde ao modelo conceitual.

---

### Tarefa 1.3 – Documentar decisões de modelagem no ARCHITECTURE.md

**Objetivo**  
Registrar as decisões de modelagem do domínio de dados, facilitando entendimento de terceiros.

**Dependências**  
- Tarefa 1.2 concluída.

**Passos**  
1. Abrir o `ARCHITECTURE.md`.
2. Adicionar uma seção explicando:
   - Principais entidades.
   - Principais relacionamentos.
   - Escolhas específicas (UUID, price em centavos, timezone, soft delete).
3. Explicar brevemente por que o PostgreSQL foi escolhido como banco principal e o papel da futura separação de leitura/escrita.

**Definição de Pronto**  
- Documento de arquitetura descreve claramente o modelo de dados.
- Alguém que leia o documento entende a base das tabelas sem olhar o código.

---

## Épico 2 – Infra de Acesso a Dados, Cache e Read/Write Split

### Tarefa 2.1 – Configurar camada de acesso ao banco (client de escrita)

**Objetivo**  
Criar uma camada única responsável por fornecer conexões de escrita ao Postgres (banco primário).

**Dependências**  
- Épico 1 concluído.

**Passos**  
1. Definir um módulo central de conexão com Postgres (ex.: `core/db/write-client`).
2. Usar `WRITE_DATABASE_URL` (com fallback para `DATABASE_URL`).
3. Documentar a responsabilidade:
   - Todas as operações de **escrita** (INSERT/UPDATE/DELETE).
   - Leituras que precisam de consistência imediata (por exemplo, ler algo logo após criar).
4. Garantir que exista um único ponto de criação do pool de conexões (para evitar múltiplos pools).

**Definição de Pronto**  
- Existe um módulo que representa a conexão de escrita com o banco.
- As operações futuras de escrita vão referenciar esse client.

---

### Tarefa 2.2 – Configurar camada de acesso de leitura (read replica-ready)

**Objetivo**  
Preparar um client separado para operações de leitura, que possa apontar para uma réplica de leitura em ambientes de produção.

**Dependências**  
- Tarefa 2.1 concluída.

**Passos**  
1. Criar módulo de client de leitura (ex.: `core/db/read-client`).
2. Usar `READ_DATABASE_URL` (com fallback para `WRITE_DATABASE_URL` em dev).
3. Documentar a responsabilidade:
   - Consultas de listagem.
   - Consultas intensivas em leitura (cardápio).
4. Decidir regra:
   - Apenas rotas específicas poderão usar o client de leitura.
   - Leituras logo após escrita continuarão no client de escrita.

**Definição de Pronto**  
- Existe um client de leitura configurado.
- Documentação indica claramente quando usar cada client.

---

### Tarefa 2.3 – Configurar helper de transação (escrita)

**Objetivo**  
Permitir que serviços de aplicação executem blocos de código dentro de transações ACID.

**Dependências**  
- Tarefa 2.1 concluída.

**Passos**  
1. Criar um helper (ex.: `withTransaction`) que:
   - Abra uma transação no client de escrita.
   - Execute uma função callback dentro da transação.
   - Faça `COMMIT` se sucesso, `ROLLBACK` se erro.
2. Definir padrão de uso:
   - Casos de uso que envolvem múltiplas operações relacionadas (ex.: criar restaurante + horários) devem usar esse helper.
3. Documentar no ARCHITECTURE.md a escolha por transações explícitas para garantir ACID.

**Definição de Pronto**  
- Serviços podem ser escritos de forma transacional sem repetir boilerplate.
- Funcionamento testado com um cenário simples (ex.: criação de duas entidades relacionadas).

---

### Tarefa 2.4 – Configurar cliente Redis e convenções de cache

**Objetivo**  
Preparar a infraestrutura de cache para ser usada por módulos de leitura (lista de restaurantes, cardápio, etc.).

**Dependências**  
- Redis em funcionamento (épico 0).
- Tarefas 2.1 e 2.2 concluídas.

**Passos**  
1. Criar módulo `core/cache/redis-client` com:
   - Leitura de `REDIS_URL`.
   - Criação do cliente Redis único.
2. Definir convenções de chaves de cache, por exemplo:
   - `restaurants:list:{page}:{limit}`
   - `menu:{restaurantId}:{timeBucket}`
3. Definir funções utilitárias:
   - `getCache(key)`.
   - `setCache(key, value, ttl)`.
   - `invalidatePattern(pattern)` (ou estratégia similar).
4. Documentar no ARCHITECTURE.md:
   - O que será cacheado.
   - Como as chaves serão construídas.

**Definição de Pronto**  
- Cliente Redis disponível para uso.
- Convenções de chave de cache definidas.
- Arquitetura documentada quanto ao uso de cache.

---

## Épico 3 – Autenticação, Autorização e API-Key

### Tarefa 3.1 – Definir modelo de autenticação e roles

**Objetivo**  
Clarificar como a autenticação vai funcionar e quais perfis de usuário existem.

**Dependências**  
- Épico 1 concluído (tabelas de usuário).

**Passos**  
1. Definir fluxo de login:
   - Credenciais: email + senha.
   - Geração de access token JWT.
   - Geração de refresh token.
2. Definir payload do JWT:
   - `sub`: ID do usuário.
   - `role`: perfil (ex.: `ADMIN`, `RESTAURANT_OWNER`).
3. Definir expirações:
   - Access token (ex.: 15 minutos).
   - Refresh token (ex.: 7–30 dias).
4. Decidir quais rotas exigem qual tipo de autenticação:
   - Painel/admin: JWT.
   - Cardápio público: API-Key.

**Definição de Pronto**  
- Estratégia de autenticação/roles documentada.
- Fica claro quais rotas exigem JWT e quais usam API-Key.

---

### Tarefa 3.2 – Implementar fluxo de login, refresh e logout

**Objetivo**  
Colocar em prática o modelo de autenticação definido, com persistência de refresh tokens.

**Dependências**  
- Tarefa 3.1 concluída.
- Infra de banco OK (épico 2).

**Passos**  
1. Implementar rota `POST /auth/login`:
   - Recebe email/senha.
   - Valida usuário e senha.
   - Gera access e refresh tokens.
   - Salva hash do refresh token em `refresh_tokens`.
2. Implementar rota `POST /auth/refresh`:
   - Recebe refresh token.
   - Valida existência e não revogação.
   - Gera novo access token (e, opcionalmente, novo refresh).
3. Implementar rota `POST /auth/logout`:
   - Recebe refresh token.
   - Marca token como revogado no banco.
4. Garantir respostas claras em caso de erro (credenciais inválidas, token inválido, etc.).

**Definição de Pronto**  
- É possível logar, receber tokens, refresh e fazer logout.
- Refresh tokens são persistidos e podem ser revogados.

---

### Tarefa 3.3 – Middleware de autenticação JWT

**Objetivo**  
Proteger rotas sensíveis utilizando o access token JWT.

**Dependências**  
- Tarefa 3.2 concluída.

**Passos**  
1. Criar middleware que:
   - Leia o header `Authorization: Bearer <token>`.
   - Valide a assinatura e expiração do JWT.
   - Extraia `sub` e `role` para o contexto.
   - Retorne erro 401 em caso de falha.
2. Aplicar esse middleware em rotas:
   - CRUD de restaurantes.
   - CRUD de produtos.
   - CRUD de promoções.
3. (Opcional) Adicionar verificação de role para rotas específicas (ex.: só ADMIN).

**Definição de Pronto**  
- Rotas protegidas não são acessíveis sem token válido.
- Payload do token é acessível dentro da rota para uso de regras de autorização.

---

### Tarefa 3.4 – Modelo e verificação de API-Key

**Objetivo**  
Permitir que consumidores externos acessem rotas específicas (como cardápio) usando API-Key.

**Dependências**  
- Tabela `api_keys` criada (épico 1).
- Infra de banco (épico 2).

**Passos**  
1. Definir como API-Keys são geradas (manual, script, etc.).
2. Implementar middleware que:
   - Leia header `x-api-key`.
   - Busque hash correspondente em `api_keys`.
   - Verifique se está ativa.
   - Retorne erro 401/403 se inválida/inativa.
3. Aplicar middleware em:
   - `GET /restaurants/:id/menu`.
   - Outras rotas públicas relevantes que devam ser controladas.

**Definição de Pronto**  
- Rotas públicas críticas exigem API-Key válida.
- API-Key pode ser revogada no banco para bloquear acesso.

---

## Épico 4 – Módulo de Restaurantes

### Tarefa 4.1 – Implementar CRUD de restaurantes com horários

**Objetivo**  
Permitir criação, leitura, atualização e remoção (soft delete) de restaurantes, incluindo seus horários de funcionamento.

**Dependências**  
- Épico 1 (tabelas).
- Épico 2 (DB infra).
- Autenticação básica (se necessário para proteção de rotas).

**Passos**  
1. Implementar rotas:
   - `POST /restaurants`:
     - Recebe dados do restaurante e lista de horários.
     - Usa transação para criar restaurante + horários.
   - `GET /restaurants`:
     - Retorna lista paginada, sem restaurantes deletados.
   - `GET /restaurants/:id`:
     - Retorna detalhes completos, incluindo horários.
   - `PUT /restaurants/:id`:
     - Atualiza dados principais (nome, endereço, timezone, etc.).
   - `DELETE /restaurants/:id`:
     - Marca `deleted_at` (soft delete).
2. Garantir validações:
   - Timezone válido.
   - Horários com `start < end`.
3. Integrar com client de escrita/leitura conforme apropriado.

**Definição de Pronto**  
- CRUD completo de restaurantes funcionando.
- Horários de funcionamento persistidos corretamente.
- Rotas retornam dados esperados.

---

### Tarefa 4.2 – Paginação e cache da listagem de restaurantes

**Objetivo**  
Otimizar a listagem de restaurantes com paginação consistente e cache em Redis.

**Dependências**  
- Tarefa 4.1 concluída.
- Épico 2 (Redis) concluído.

**Passos**  
1. Definir parâmetros de paginação (ex.: `page` e `limit`).
2. Implementar paginação com `LIMIT` e `OFFSET`.
3. Implementar cache:
   - Chave: `restaurants:list:{page}:{limit}`.
   - TTL razoável (ex.: 60–300 segundos).
4. Invalidação:
   - Ao criar/atualizar/deletar restaurante:
     - Invalida chaves relacionadas à lista (`restaurants:list:*`).
5. Documentar comportamento no README ou ARCHITECTURE.

**Definição de Pronto**  
- Listagem paginada de restaurantes funciona.
- Respostas repetidas para a mesma página são servidas do cache.
- Alterações invalidam o cache de forma previsível.

---

## Épico 5 – Módulo de Produtos

### Tarefa 5.1 – Implementar CRUD de produtos por restaurante

**Objetivo**  
Permitir gerenciar produtos vinculados a um restaurante.

**Dependências**  
- Módulo de restaurantes (épico 4).
- Infra de banco (épico 2).

**Passos**  
1. Implementar rotas:
   - `GET /restaurants/:id/products` (paginada).
   - `POST /restaurants/:id/products`.
   - `GET /restaurants/:id/products/:productId`.
   - `PUT /restaurants/:id/products/:productId`.
   - `DELETE /restaurants/:id/products/:productId` (soft delete).
2. Validar:
   - Existência do restaurante.
   - Categoria válida.
   - `price_cents >= 0`.
3. Definir comportamento padrão:
   - `visible = true` ao criar.
   - `sort_order`: pode ser o maior sort_order + 1.

**Definição de Pronto**  
- CRUD completo de produtos funcionando.
- Produtos sempre vinculados a um restaurante existente.

---

### Tarefa 5.2 – Visibilidade e ordenação de produtos

**Objetivo**  
Permitir que o restaurante esconda temporariamente produtos e controle a ordem no cardápio.

**Dependências**  
- Tarefa 5.1 concluída.

**Passos**  
1. Garantir que produtos têm:
   - Campo `visible` (boolean).
   - Campo `sort_order` (inteiro).
2. Implementar:
   - Atualização de `visible` via `PUT`.
   - Endpoint ou lógica para alterar `sort_order` (por exemplo, receber uma lista de IDs na nova ordem e atualizar em batch).
3. Documentar:
   - O que significa `visible = false` (produto não aparece no cardápio).
   - Como a ordenação influencia o cardápio consolidado.

**Definição de Pronto**  
- Produtos podem ser marcados como invisíveis.
- Ordem dos produtos pode ser controlada e persiste no banco.

---

## Épico 6 – Módulo de Promoções

### Tarefa 6.1 – CRUD de promoções vinculadas a produtos

**Objetivo**  
Permitir criar, ler, atualizar e deletar promoções associadas a produtos.

**Dependências**  
- Módulo de produtos (épico 5).
- Infra de banco (épico 2).

**Passos**  
1. Implementar rotas:
   - `POST /products/:id/promotions`.
   - `GET /products/:id/promotions`.
   - `PUT /promotions/:id`.
   - `DELETE /promotions/:id`.
2. Garantir:
   - Promoção sempre vinculada a produto existente.
   - `promo_price_cents` válido.
   - Campo `active` indicando se a promoção pode ser considerada.

**Definição de Pronto**  
- Promoções podem ser criadas, lidas, atualizadas e removidas.
- Relacionamento produto-promoção funciona corretamente.

---

### Tarefa 6.2 – Configuração de schedules de promoção (dias/horários)

**Objetivo**  
Definir quando cada promoção está ativa, através de dias da semana e intervalos de horário.

**Dependências**  
- Tarefa 6.1 concluída.

**Passos**  
1. Permitir que cada promoção tenha um ou mais schedules:
   - `weekday` (0–6).
   - `start_time` e `end_time` no formato `HH:mm`.
2. Regra: horários em múltiplos de 15 minutos:
   - Validar isso na lógica de negócio.
   - Idealmente, reforçar via constraint no banco.
3. Ao criar ou atualizar promoção:
   - Receber array de schedules.
   - Salvar/atualizar registros em `promotion_schedules`.

**Definição de Pronto**  
- Cada promoção tem seus horários/dias claramente definidos.
- Horários inválidos (não múltiplos de 15 min) são rejeitados.

---

## Épico 7 – Cardápio Consolidado (Menu)

### Tarefa 7.1 – Calcular promoções ativas “agora” por restaurante

**Objetivo**  
Criar a lógica que determina quais promoções estão ativas no momento, respeitando o timezone do restaurante.

**Dependências**  
- Épico 6 concluído (promoções e schedules).
- Timezone do restaurante definido (épico 4).

**Passos**  
1. Para um restaurante:
   - Obter seu timezone.
   - Converter o horário atual para esse timezone.
   - Determinar:
     - Dia da semana local.
     - Horário local.
2. Para cada promoção vinculada a produtos do restaurante:
   - Verificar se existe schedule cujo:
     - `weekday` = dia atual.
     - `start_time <= horaAtual < end_time`.
   - Considerar apenas promoções com `active = true`.

**Definição de Pronto**  
- É possível, via uma função de negócio, determinar se uma promoção está ou não ativa em dado instante.

---

### Tarefa 7.2 – Implementar endpoint de cardápio consolidado

**Objetivo**  
Retornar o cardápio do restaurante com produtos, preços e promoções já aplicados.

**Dependências**  
- Tarefa 7.1 concluída.
- Módulos de restaurantes (épico 4) e produtos (épico 5) prontos.

**Passos**  
1. Implementar `GET /restaurants/:id/menu`.
2. Lógica:
   - Buscar restaurante (timezone).
   - Determinar horário atual no timezone.
   - Buscar produtos visíveis e não deletados.
   - Verificar promoções ativas para cada produto (usando a lógica da Tarefa 7.1).
   - Para cada produto, definir:
     - Preço “atual” (promo vs normal).
3. Formatar resposta:
   - Possível agrupamento por categoria (opcional, mas desejável).
   - Incluir indicadores se o preço exibido é promocional.

**Definição de Pronto**  
- Endpoint retorna cardápio consistente com regras de visibilidade e promoções ativas.

---

### Tarefa 7.3 – Cache do cardápio no Redis com invalidação

**Objetivo**  
Otimizar o endpoint de cardápio, evitando recomputar toda a lógica a cada requisição.

**Dependências**  
- Tarefas 7.1 e 7.2 concluídas.
- Épico 2 (Redis) pronto.

**Passos**  
1. Definir chave de cache:
   - Ex.: `menu:{restaurantId}:{timeBucket}`.
   - `timeBucket` pode ser:
     - A hora atual.
     - Ou intervalos de 15 minutos.
2. Ao receber requisição:
   - Tentar ler do cache.
   - Se existir → retornar.
   - Se não existir:
     - Calcular cardápio.
     - Salvar no cache com TTL configurado.
3. Invalidação:
   - Em alterações de restaurante, produtos ou promoções:
     - Invalidar chaves relacionadas ao restaurante (`menu:{restaurantId}:*`).

**Definição de Pronto**  
- Cardápio passa a ser servido do cache quando possível.
- Invalidações garantem que o cache não fica desatualizado por longos períodos.

---

## Épico 8 – Upload de Imagens (Cloudflare R2)

### Tarefa 8.1 – Configurar integração com Cloudflare R2 (S3-compatible)

**Objetivo**  
Preparar a camada de storage para envio de arquivos ao Cloudflare R2 usando o SDK S3.

**Dependências**  
- Épico 0 (variáveis de ambiente).
- Infra básica do projeto.

**Passos**  
1. Definir variáveis de ambiente:
   - `R2_ENDPOINT`
   - `R2_ACCESS_KEY`
   - `R2_SECRET_KEY`
   - `R2_BUCKET`
2. Criar módulo de storage:
   - Interface genérica (ex.: `FileStorage`) com operações `upload` etc.
   - Implementação específica `R2FileStorage` que:
     - Constrói cliente S3 com as configs da R2.
3. Documentar no ARCHITECTURE.md o papel do storage e por que separar interface/implementação.

**Definição de Pronto**  
- A aplicação consegue se conectar ao bucket R2 e está pronta para enviar arquivos.

---

### Tarefa 8.2 – Endpoints de upload de foto de restaurante e produto

**Objetivo**  
Permitir que o cliente envie fotos e que elas sejam armazenadas no R2, com a URL persistida no banco.

**Dependências**  
- Tarefa 8.1 concluída.
- Módulos de restaurantes e produtos prontos.

**Passos**  
1. Implementar:
   - `POST /restaurants/:id/photo`.
   - `POST /restaurants/:id/products/:productId/photo`.
2. Fluxo:
   - Receber arquivo via multipart/form-data.
   - Validar tipo de arquivo (JPEG/PNG) e tamanho máximo.
   - Gerar chave única (ex.: pasta por restaurante/produto).
   - Enviar para R2 via módulo de storage.
   - Atualizar campo `photo_url` do restaurante/produto com a URL.
3. Documentar endpoints no Swagger.

**Definição de Pronto**  
- É possível enviar uma imagem e vê-la refletida depois ao consultar restaurante/produto.
- Imagens são armazenadas no bucket R2, e apenas URLs ficam no banco.

---

## Épico 9 – Performance, Read/Write Split efetivo e Rate Limiting

### Tarefa 9.1 – Revisar uso de clientes de leitura e escrita

**Objetivo**  
Garantir que rotas estão utilizando corretamente os clients de leitura/escrita.

**Dependências**  
- Épicos 2 a 7 concluídos.

**Passos**  
1. Revisar repositórios:
   - Métodos de **escrita** → client de escrita (primário).
   - Métodos de **leitura pesada** (listas, cardápio) → client de leitura.
2. Listar exceções:
   - Leitura logo após escrita que precisa ser consistente → client de escrita.
3. Documentar no ARCHITECTURE.md:
   - Quais módulos usam leitura em réplica.
   - Cuidados com lag de replicação.

**Definição de Pronto**  
- Uso consciente de read/write split.
- Documentação clara para futuros devs.

---

### Tarefa 9.2 – Ajustes de índices e consultas SQL

**Objetivo**  
Melhorar performance de queries críticas.

**Dependências**  
- Banco em uso com queries reais.

**Passos**  
1. Identificar queries mais sensíveis:
   - Listas de restaurantes.
   - Listas de produtos.
   - Montagem do cardápio.
2. Verificar se há índices adequados:
   - FKs (`restaurant_id`, `product_id`).
   - Campos usados em filtros (`weekday`, `visible`, etc.).
3. Ajustar queries SQL, se necessário, para evitar full scans desnecessários.

**Definição de Pronto**  
- Queries críticas estão utilizando índices de forma eficiente.
- Não há full scans desnecessários nos cenários principais.

---

### Tarefa 9.3 – Rate limiting para rotas sensíveis

**Objetivo**  
Proteger a API contra abuso em endpoints específicos, principalmente os de cardápio.

**Dependências**  
- Redis disponível (épico 2).
- Autenticação e API-Key configuradas (épico 3).

**Passos**  
1. Definir limites (ex.: X requisições/minuto por API-Key ou IP).
2. Implementar middleware de rate limiting usando Redis:
   - Incrementa contador por chave (IP ou API-Key).
   - Expira contador com TTL de 1 minuto.
   - Bloqueia requisições acima do limite.
3. Aplicar middleware em rotas:
   - `GET /restaurants/:id/menu`.
   - Outras rotas públicas intensivas em leitura.

**Definição de Pronto**  
- Excessos de requisição por unidade de tempo são bloqueados nas rotas configuradas.
- Rate limiting documentado no ARCHITECTURE.md.

---

## Épico 10 – Documentação Final e Polimento

### Tarefa 10.1 – Revisar e completar README.md e ARCHITECTURE.md

**Objetivo**  
Garantir que a pessoa avaliadora consiga entender o projeto rapidamente e rodá-lo sem dificuldade.

**Dependências**  
- Principais funcionalidades concluídas.

**Passos**  
1. Revisar o `README.md`:
   - Passo a passo de setup.
   - Explicação de arquitetura em alto nível.
   - Checklist de funcionalidades.
2. Revisar `ARCHITECTURE.md`:
   - Fluxos principais (login, promoções, cardápio, upload).
   - Decisões técnicas (Postgres, Redis, Read/Write split, R2).
3. Ajustar qualquer informação desatualizada.

**Definição de Pronto**  
- Documentos estão claros, atualizados e consistentes com o código.

---

### Tarefa 10.2 – Passar testes, lint e revisão final de código

**Objetivo**  
Entregar o projeto “redondinho”, com testes passando e código limpo.

**Dependências**  
- Demais épicos em estágio avançado.

**Passos**  
1. Rodar todos os testes (`npm test`).
2. Rodar lint/formatador, se configurados.
3. Fazer um code review pessoal:
   - Nome de variáveis, funções e módulos.
   - Remoção de código morto.
   - Comentários supérfluos removidos.
4. Garantir que não há logs de debug desnecessários.

**Definição de Pronto**  
- Todos os testes passam.
- Projeto está consistente, organizado e pronto para ser avaliado.

---

Este **TASKS.md** funciona como um roteiro completo de implementação, separado por épicos e com tarefas detalhadas.  
Você pode adaptar a granularidade conforme o tempo disponível, mas a ordem foi pensada para minimizar retrabalho e manter a arquitetura consistente desde o início.
