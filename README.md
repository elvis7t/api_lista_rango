# API Lista Rango – API Back-end

API em Node.js + TypeScript para gerenciar **restaurantes, produtos, promoções e cardápio** de um restaurante, com foco em código simples, manutenível e pronto para produção.

Este README descreve:

- Objetivo do projeto
- Decisões de arquitetura
- Visão geral do sistema (system design)
- Como rodar o projeto localmente
- Estratégia de testes
- Checklist de implementação por etapas

---

## 1. Objetivo do Projeto

O desafio propõe a criação de uma API capaz de:

- Gerenciar **restaurantes** (CRUD, horários de funcionamento, timezone, paginação).
- Gerenciar **produtos** por restaurante (CRUD, visibilidade, ordenação, promoções).
- Gerenciar **promoções** (CRUD, dias da semana e horários, com intervalos de 15 minutos).
- Retornar um **cardápio consolidado**, aplicando:
  - Visibilidade de produtos.
  - Promoções ativas de acordo com dia/horário e timezone do restaurante.
- Otimizar consultas com:
  - **Paginação**.
  - **Cache de rotas de leitura** (Redis).

Além disso, a solução foi pensada com visão de produção:

- Autenticação via **JWT + refresh token**.
- **API Key** para consumo de rotas públicas (ex.: cardápio).
- Upload de **imagens para armazenamento compatível com S3** (Cloudflare R2).

---

## 2. Decisões de Arquitetura

### 2.1. Stack Principal

- **Linguagem:** Node.js + TypeScript
- **Servidor HTTP:** Fastify (ou Express, sem frameworks que imponham arquitetura como Nest/Adonis)
- **Banco de dados relacional:** PostgreSQL  
  - Utilizado como fonte de verdade e para garantir **ACID** (transações, consistência, integridade referencial).  
  - ORM usado apenas para **migrations**; consultas em **SQL puro**, conforme requisito do desafio.
- **Cache:** Redis  
  - Cache de listagens e cardápio consolidado.  
  - Uso opcional para rate limiting.
- **Armazenamento de imagens:** Cloudflare R2 (compatível com S3 via AWS SDK)
- **Autenticação/Autorização:**
  - **JWT** (access token de curta duração).
  - **Refresh token** persistido em banco.
  - **API Key** para consumidores externos de cardápio.
- **Documentação:** Swagger / OpenAPI
- **Datas e Horários:** biblioteca de datas (ex.: date-fns + date-fns-tz ou Luxon) para:  
  - Respeitar timezone do restaurante.  
  - Tratar conversões entre UTC e horário local.

---

## 3. Visão de System Design

### 3.1. Componentes

- **Clientes / Consumers**
  - Painel/admin (frontend ou ferramentas como Postman/Insomnia).
  - Integrações externas que consomem cardápio via API-Key.

- **API Back-end (Node.js + TS)**
  - Módulo `auth`  
    - Login, emissão de JWT e refresh token.  
    - Rotas de refresh/logout.
  - Módulo `restaurants`  
    - CRUD de restaurantes.  
    - Horários de funcionamento (por dia da semana).  
    - Tratamento de timezone.
  - Módulo `products`  
    - CRUD de produtos por restaurante.  
    - Visibilidade (visível/invisível).  
    - Ordenação de produtos no cardápio.
  - Módulo `promotions`  
    - CRUD de promoções vinculadas a produtos.  
    - Schedules de promoções (dia da semana + horário, múltiplos de 15 min).
  - Módulo `menu`  
    - Montagem do cardápio consolidado com:  
      - Aplicação de promoções ativas.  
      - Filtro de produtos invisíveis.
  - Módulo `files`  
    - Upload de imagens.  
    - Integração com Cloudflare R2 via API S3-compatible.
  - Camada de infraestrutura:  
    - Conexão com PostgreSQL.  
    - Conexão com Redis.  
    - Setup de Swagger.  
    - Autenticação, API-key, rate limiting.  
    - Logging e tratamento global de erros.

- **PostgreSQL**
  - Tabelas principais:
    - `restaurants`, `restaurant_opening_hours`
    - `products`
    - `promotions`, `promotion_schedules`
    - `users`, `refresh_tokens`
    - `api_keys`

- **Redis**
  - Cache de:
    - Listagem de restaurantes com paginação.
    - Cardápio consolidado de um restaurante.
  - Possível uso para:
    - Rate limit por IP / API-Key.

- **Cloudflare R2**
  - Armazena:
    - Foto de restaurante.
    - Foto de produto.
  - Banco guarda apenas URLs / paths de objetos.

### 3.2. Regras-chave de Negócio

- Um **restaurante** tem:
  - Timezone próprio.
  - Um conjunto de horários de funcionamento por dia da semana.
- Um **produto**:
  - Pertence a um restaurante.
  - Tem preço base.
  - Pode estar visível ou invisível.
  - Tem um campo de ordenação no cardápio.
- Uma **promoção**:
  - Sempre está vinculada a um produto.
  - Tem preço promocional.
  - Tem descrição.
  - Tem um ou mais horários/dias em que deve estar ativa.
  - Só é considerada ativa se:
    - `active = true`.  
    - Não estiver deletada.  
    - O horário atual (no timezone do restaurante) estiver dentro de um dos intervalos configurados.
- **Cardápio**:
  - Retorna apenas produtos visíveis (por padrão).
  - Para cada produto:
    - Verifica se existe promoção ativa no momento.
    - Determina o “preço atual” (promo vs preço normal).
  - Usa cache de Redis para evitar recomputar toda hora.

---

## 4. Organização do Projeto (visão macro)

> Esta seção descreve a estrutura de forma conceitual; os nomes de pastas/arquivos podem variar, mas a ideia é manter uma separação clara de responsabilidades.

- `src/`  
  - `app` / `server`: inicialização do servidor HTTP.  
  - `config/`: configurações (env, Swagger, etc).  
  - `core/`:  
    - `db/`: conexão com Postgres, helpers de transação.  
    - `cache/`: Redis.  
    - `security/`: JWT, hash de senha, API-key.  
    - `storage/`: interface de storage + implementação R2.  
    - `http/`: middlewares globais (logger, error handler, etc).  
  - `modules/`:  
    - `auth/`  
    - `restaurants/`  
    - `products/`  
    - `promotions/`  
    - `menu/`  
    - `files/`  
- `infra/migrations/`: scripts de migrations do banco.  
- `tests/`: testes unitários e/ou de integração.  
- `docs/`: documentação adicional (ex.: ARCHITECTURE.md).

---

## 5. Como rodar o projeto localmente

> Os comandos abaixo são um guia geral. Podem ser ajustados conforme gerenciador de pacotes ou ferramentas que você utilizar.

### 5.1. Pré-requisitos

- Node.js (versão LTS)
- Docker e Docker Compose (para subir Postgres e Redis)
- Yarn ou npm

### 5.2. Passos para subir ambiente

1. **Clonar o repositório**

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd goomer-lista-rango
   ```

2. **Configurar variáveis de ambiente**

   - Copiar o arquivo de exemplo:

     ```bash
     cp .env.example .env
     ```

   - Ajustar:
     - `DATABASE_URL`
     - `REDIS_URL`
     - `JWT_SECRET`, `JWT_REFRESH_SECRET`
     - `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`
     - Outros parâmetros necessários.

3. **Subir serviços de infraestrutura**

   ```bash
   docker compose up -d
   ```

4. **Instalar dependências**

   ```bash
   npm install
   # ou
   yarn
   ```

5. **Rodar migrations**

   ```bash
   npm run migrate
   ```

6. **Rodar a aplicação em modo desenvolvimento**

   ```bash
   npm run dev
   ```

7. **Verificar Swagger / saúde da API**

   - Endpoint de health-check: `GET /health`
   - Documentação Swagger em `/docs` (ou rota configurada).

---

## 6. Estratégia de Testes

A abordagem de testes segue um estilo **pragmático**, inspirado em TDD, mas sem ser estritamente TDD em 100% dos casos:

- Ambiente de testes (framework, scripts) configurado desde o início do projeto.
- Para cada módulo de negócio importante:
  - São definidos os principais cenários de regra de negócio.
  - São criados testes cobrindo:
    - Cenário “feliz”.
    - Pelo menos um cenário de erro/edge case relevante.
- Regras mais sensíveis (por exemplo, **promoções ativas por dia/horário e timezone**) têm foco especial em testes de domínio.

---

## 7. Checklist de Implementação por Etapas

Use esta seção como **plano de ação** e checklist conforme for concluindo o desenvolvimento.

### Fase 0 – Setup, testes e middlewares básicos

- [x] Criar estrutura básica do projeto (Node + TS).
- [x] Configurar lint, scripts de build e dev.
- [x] Subir containers de Postgres e Redis via Docker Compose.
- [x] Configurar framework de testes (Jest/Vitest).
- [X] Criar rota de health-check.
- [X] Configurar Swagger.
- [ ] Adicionar middlewares básicos:
  - [ ] Logger de requisição/resposta.
  - [ ] Tratamento global de erros (formato padrão de resposta).
  - [ ] Parser de JSON.
- [X] Criar pelo menos 1 teste simples (ex.: health-check).

---

### Fase 1 – Modelagem de domínio e migrations

- [ ] Definir modelo de dados (tabelas e relacionamentos) para:
  - [ ] Restaurantes.
  - [ ] Horários de funcionamento.
  - [ ] Produtos.
  - [ ] Promoções.
  - [ ] Schedules de promoção.
  - [ ] Usuários/admins.
  - [ ] Refresh tokens.
  - [ ] API Keys.
- [ ] Implementar migrations no Postgres.
- [ ] Garantir constraints essenciais (FKs, checks de horário, etc).
- [ ] (Opcional) Criar testes de domínio para validação de horários (intervalos de 15 minutos, etc).

---

### Fase 2 – Infra de acesso a dados e cache

- [ ] Implementar camada de acesso ao banco:
  - [ ] Pool de conexões.
  - [ ] Helper de transação (BEGIN/COMMIT/ROLLBACK).
- [ ] Implementar cliente Redis centralizado.
- [ ] Definir convenções de chave de cache.
- [ ] Padronizar modelo de paginação (parâmetros e formato da resposta).

---

### Fase 3 – Autenticação (JWT + refresh) e API-Key

- [ ] Criar modelo de usuários/admins.
- [ ] Implementar fluxo de **login**:
  - [ ] Validação de credenciais.
  - [ ] Emissão de access token (JWT) de curta duração.
  - [ ] Emissão de refresh token de longa duração.
  - [ ] Persistência do refresh token (hash) no banco.
- [ ] Implementar fluxo de **refresh**:
  - [ ] Validação do refresh token.
  - [ ] Emissão de novo access token.
- [ ] Implementar **logout** com revogação de refresh token.
- [ ] Criar middleware de autenticação JWT para rotas protegidas.
- [ ] Criar modelo e lógica de **API-Key**:
  - [ ] Geração e armazenamento de hash da chave.
  - [ ] Middleware que valida header `x-api-key` para rotas específicas (ex.: cardápio).
- [ ] Criar testes básicos de:
  - [ ] Login bem-sucedido.
  - [ ] Refresh token inválido/expirado.

---

### Fase 4 – CRUD de Restaurantes + horários

- [ ] Implementar endpoints:
  - [ ] `POST /restaurants` (criar restaurante + horários).
  - [ ] `GET /restaurants` (lista paginada).
  - [ ] `GET /restaurants/:id`.
  - [ ] `PUT /restaurants/:id`.
  - [ ] `DELETE /restaurants/:id` (soft delete).
- [ ] Respeitar uso de transações ao criar restaurante + horários.
- [ ] Validar timezone e intervalos de horários.
- [ ] Implementar cache da listagem de restaurantes (Redis) com invalidação.
- [ ] Documentar rotas de restaurantes no Swagger.
- [ ] Criar testes para:
  - [ ] Criação de restaurante válido.
  - [ ] Falha ao criar com horários inválidos.

---

### Fase 5 – CRUD de Produtos

- [ ] Implementar endpoints:
  - [ ] `GET /restaurants/:id/products` (paginado).
  - [ ] `POST /restaurants/:id/products`.
  - [ ] `GET /restaurants/:id/products/:productId`.
  - [ ] `PUT /restaurants/:id/products/:productId`.
  - [ ] `DELETE /restaurants/:id/products/:productId`.
- [ ] Implementar lógica de:
  - [ ] Visibilidade (flag visível/invisível).
  - [ ] Ordenação (campo de ordem no cardápio).
- [ ] Cachear listagens relevantes (se necessário) e invalidar corretamente.
- [ ] Documentar rotas de produtos no Swagger.
- [ ] Criar testes básicos para CRUD de produtos.

---

### Fase 6 – CRUD de Promoções + horários da promoção

- [ ] Implementar endpoints:
  - [ ] `POST /products/:id/promotions`.
  - [ ] `GET /products/:id/promotions`.
  - [ ] `PUT /promotions/:id`.
  - [ ] `DELETE /promotions/:id`.
- [ ] Implementar regras:
  - [ ] Promo associada obrigatoriamente a um produto.
  - [ ] Schedules de promoção com:
    - [ ] Dia da semana (0–6).
    - [ ] Horários com intervalos de 15 minutos.
  - [ ] Flag `active` para controlar ativação/pausa da promoção.
- [ ] Garantir uso do timezone do restaurante na interpretação dos horários da promoção.
- [ ] Documentar rotas de promoções no Swagger.
- [ ] Criar testes para:
  - [ ] Validação de múltiplos de 15 minutos.
  - [ ] Promoções ativas vs inativas por horário.

---

### Fase 7 – Cardápio consolidado (menu)

- [ ] Implementar endpoint:
  - [ ] `GET /restaurants/:id/menu`
- [ ] Implementar regra de cardápio:
  - [ ] Considerar apenas produtos visíveis (por padrão).
  - [ ] Verificar promoções ativas no “agora” (timezone do restaurante).
  - [ ] Determinar preço atual (normal vs promocional).
- [ ] Proteger rota com **API-Key** (ou estratégia definida).
- [ ] Implementar **cache de menu** no Redis:
  - [ ] Definir chave por restaurante e bucket de tempo (ex.: hora ou intervalos de 15 min).
  - [ ] Definir TTL adequado.
  - [ ] Invalidação ao alterar restaurante/produto/promo.
- [ ] Documentar rota de cardápio no Swagger.
- [ ] Criar testes de negócio para:
  - [ ] Promoção ativa vs não ativa em horários diferentes.
  - [ ] Comportamento com e sem promoções.

---

### Fase 8 – Upload de imagens (Cloudflare R2)

- [ ] Configurar integração com Cloudflare R2 (S3-compatible).
- [ ] Implementar endpoints:
  - [ ] `POST /restaurants/:id/photo`.
  - [ ] `POST /restaurants/:id/products/:productId/photo`.
- [ ] Implementar regras:
  - [ ] Validar tipo e tamanho de arquivo.
  - [ ] Nomear objetos com keys únicas (ex.: por restaurante/produto).
  - [ ] Salvar apenas URL/path no banco de dados.
- [ ] Documentar endpoints de upload no Swagger.

---

### Fase 9 – Performance extra, cache fino e rate limiting

- [ ] Revisar índices no banco (FKs, campos mais consultados).
- [ ] Ajustar estratégias de cache (TTL, granularidade).
- [ ] Implementar ou refinar rate limiting:
  - [ ] Por IP ou API-Key nas rotas públicas mais sensíveis (ex.: menu).
- [ ] Adicionar logs relevantes para monitorar performance de queries críticas.

---

### Fase 10 – Documentação final e polimento

- [ ] Revisar e completar este `README.md`.
- [ ] Criar (opcional) um `ARCHITECTURE.md` com:
  - [ ] Diagrama de alto nível.
  - [ ] Explicação dos módulos principais.
- [ ] Garantir que o Swagger documenta todas as rotas principais.
- [ ] Rodar todos os testes e garantir que estão passando.
- [ ] Fazer uma última revisão geral no código:
  - [ ] Nomes claros.
  - [ ] Organização de pastas.
  - [ ] Comentários apenas onde necessário.
  - [ ] Remover código morto.

---

## 9. Considerações finais

A solução foi desenhada para:

- Atender completamente aos requisitos do desafio.
- Demonstrar:
  - Organização arquitetural (modularização).
  - Preocupação com escalabilidade (cache, rate limit).
  - Preocupação com manutenibilidade (camadas claras, responsabilidade única).
  - Boas práticas de segurança (JWT, refresh token, API Key).
  - Boas práticas de dados (Postgres, ACID, integridade).

Este README também serve como um **guia de implementação**:  
à medida que cada fase for concluída, as caixas de seleção podem ser marcadas, mostrando de forma transparente o progresso e as decisões adotadas.
