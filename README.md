# Video Store API

API REST em Node.js, TypeScript e Supabase para gerenciar o catálogo, os clientes e as locações de uma locadora de filmes.

---

## 1. Nome e descrição do projeto

**Nome:** Video Store API.

**Domínio escolhido:** locadora de filmes.

**Problema que resolve:** uma locadora precisa controlar o catálogo de filmes (com gênero, estoque e preço da diária), manter o cadastro dos clientes e registrar cada locação, desde a reserva até a devolução, incluindo prazos e multa por atraso. Esta API centraliza essas informações e aplica as regras de negócio no servidor.

**Objetivo da API:** permitir cadastrar, consultar, atualizar e remover **gêneros**, **filmes**, **clientes** e **locações**, persistindo os dados em um banco PostgreSQL hospedado no Supabase.

Projeto desenvolvido como Avaliação Final da disciplina de Desenvolvimento Back-End, do curso de Engenharia de Software, a partir do projeto iniciado no primeiro bimestre. Na interface web (front-end), a locadora se chama **7 Rent**.

## 2. Integrantes da equipe

- Erick Yuri Maba Silva
- João Henrique Ramos
- Lucas Indalencio Gonçalves de Lima

## 3. Tecnologias utilizadas

- **Node.js** (versão 22.22 ou superior)
- **TypeScript**
- **Express** 5
- **Supabase** (PostgreSQL) com `@supabase/supabase-js`
- **tsx** (execução do TypeScript em desenvolvimento)
- **Vitest** (testes unitários, testes de integração e cobertura, com `@vitest/coverage-v8`)
- **Supertest** (testes de integração dos endpoints)
- **Swagger/OpenAPI** (`swagger-jsdoc` e `swagger-ui-express`)
- **cors**
- **Git** e **GitHub** (versionamento)
- **Postman** (testes manuais e automáticos da API)
- **React, Vite e Tailwind CSS** (front-end complementar, na pasta `frontend/`)

## 4. Entidades e relacionamentos

### Genre (gênero)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único (gerado automaticamente) |
| name | texto | Nome do gênero (obrigatório e único) |
| description | texto | Descrição do gênero |
| active | booleano | Se o gênero está ativo (padrão: `true`) |
| created_at | data/hora | Data de criação (automática) |

### Movie (filme)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único (gerado automaticamente) |
| genre_id | UUID (FK) | Gênero ao qual o filme pertence (obrigatório) |
| title | texto | Título do filme (obrigatório) |
| director | texto | Nome do diretor |
| synopsis | texto | Sinopse do filme |
| year | inteiro | Ano de lançamento (mínimo 1888) |
| duration | inteiro | Duração em minutos (mínimo 1) |
| cover | texto | URL da capa |
| stock | inteiro | Cópias disponíveis em estoque (mínimo 0) |
| daily_price | decimal(10,2) | Preço da diária (mínimo 0) |
| active | booleano | Se o filme está ativo (padrão: `true`) |
| created_at | data/hora | Data de criação (automática) |

### Customer (cliente)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único (gerado automaticamente) |
| name | texto | Nome do cliente (obrigatório) |
| email | texto | E-mail do cliente (obrigatório, válido e único) |
| cpf | texto (11 dígitos) | CPF do cliente (obrigatório, válido e único) |
| phone | texto | Telefone do cliente |
| active | booleano | Se o cliente está ativo (padrão: `true`) |
| created_at | data/hora | Data de criação (automática) |

### Rental (locação)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único (gerado automaticamente) |
| customer_id | UUID (FK) | Cliente que fez a locação |
| movie_id | UUID (FK) | Filme locado |
| days | inteiro | Quantidade de dias (de 1 a 30) |
| daily_price | decimal(10,2) | Diária do filme, copiada no momento da reserva |
| total_price | decimal(10,2) | Valor total (`daily_price` × `days`) |
| late_fee | decimal(10,2) | Multa por atraso (padrão: 0) |
| status | texto | `reserved`, `active`, `returned`, `cancelled` ou `expired` |
| reserved_until | data/hora | Limite para a retirada (24 horas após a reserva) |
| rented_at | data/hora | Data da retirada |
| due_at | data/hora | Data limite para a devolução |
| returned_at | data/hora | Data da devolução |
| created_at | data/hora | Data de criação (automática) |

### Relacionamentos

- Um **gênero** possui vários **filmes** (1:N). Cada filme pertence a exatamente um gênero (`movies.genre_id`).
- Um **cliente** possui várias **locações** (1:N). Cada locação pertence a um cliente (`rentals.customer_id`).
- Um **filme** pode estar em várias **locações** (1:N). Cada locação se refere a um filme (`rentals.movie_id`).
- Cliente e filme se relacionam por meio da locação (N:N).

As três chaves estrangeiras usam `on delete restrict`: não é possível remover um registro que ainda possui registros ligados a ele.

## 5. Regras de negócio

**Gênero**

- O nome é obrigatório (espaços nas pontas são removidos) e não pode se repetir; a comparação ignora maiúsculas e minúsculas.
- Pode ser desativado (`active: false`). Um filme só pode ser cadastrado ou movido para um gênero que exista e esteja ativo.
- Não pode ser removido se possuir filmes.

**Filme**

- O título é obrigatório. O diretor e a sinopse, quando informados, devem ser textos.
- O ano deve ser um número inteiro entre 1888 e o ano atual; a duração deve ser um inteiro maior ou igual a 1; o estoque deve ser um inteiro maior ou igual a zero; a diária deve ser maior ou igual a zero.
- A capa, quando informada, deve ser uma URL válida.
- O `genre_id` é obrigatório, deve ser um UUID válido e de um gênero existente e **ativo**.
- Não pode ser removido se possuir locações.

**Cliente**

- O nome é obrigatório (espaços nas pontas são removidos).
- O e-mail deve ter formato válido e não pode se repetir; é guardado em letras minúsculas.
- O CPF deve ser válido (11 dígitos, com dígitos verificadores corretos) e não pode se repetir; aceita pontos e traço, mas é guardado apenas com os números.
- Pode ser desativado (`active: false`). Um cliente inativo não pode fazer reservas.
- Não pode ser removido se possuir locações.

**Locação**

- O fluxo do status é `reserved` → `active` (retirada) → `returned` (devolução). Uma reserva também pode terminar em `cancelled` ou `expired`.
- A reserva exige um cliente existente e **ativo** e um filme existente e **ativo**. A quantidade de dias deve ser um inteiro entre 1 e 30.
- O cliente não pode ter outra reserva ou aluguel em andamento do mesmo filme.
- A reserva é recusada se o filme estiver sem estoque. Ao reservar, uma cópia é separada do estoque.
- A diária é copiada do filme no momento da reserva, e o valor total é a diária × a quantidade de dias.
- A reserva vale por 24 horas (`reserved_until`). Dentro desse prazo, a retirada muda o status para `active`, registra a data da retirada e define a data limite de devolução (retirada + quantidade de dias). Fora do prazo, a retirada é recusada.
- Só uma reserva que ainda não foi retirada pode ter os dias alterados (o total é recalculado) ou ser cancelada. Cancelar devolve a cópia ao estoque.
- Reservas vencidas são expiradas pela rota `POST /rentals/expire-reservations`: elas passam a `expired` e a cópia volta ao estoque. As telas de locações do front-end ("Meus aluguéis" e o painel administrativo) chamam essa rota ao carregar.
- A devolução só é permitida para um aluguel retirado e não pode ser feita duas vezes. Ela devolve a cópia ao estoque e calcula a multa por atraso: 1,5 × a diária por dia (ou fração de dia) de atraso.
- Uma locação em aberto (`reserved` ou `active`) não pode ser removida: é preciso cancelá-la ou devolvê-la antes.

Como o banco usa `on delete restrict`, a tentativa de remover um gênero com filmes, um filme com locações ou um cliente com locações retorna **400** com uma mensagem clara.

## 6. Estrutura do projeto

```
video-store/
├── database/
│   └── schema.sql                      # script de criação das tabelas
├── frontend/                           # interface web (React + Vite), complementar
├── postman/
│   └── collections/
│       └── video-store.postman_collection.json
├── src/
│   ├── config/
│   │   ├── supabase.ts                 # conexão com o Supabase
│   │   └── swagger.ts                  # configuração e schemas do Swagger (OpenAPI)
│   ├── controller/                     # lê a requisição, chama o service e monta a resposta HTTP
│   │   ├── GenreController.ts
│   │   ├── MovieController.ts
│   │   ├── CustomerController.ts
│   │   └── RentalController.ts
│   ├── errors/
│   │   ├── NotFoundError.ts            # registro não encontrado (404)
│   │   └── ValidantionError.ts         # regra de negócio violada (400)
│   ├── model/                          # entidades (POO) com as validações dos próprios dados
│   │   ├── Genre.ts
│   │   ├── Movie.ts
│   │   ├── Customer.ts
│   │   └── Rental.ts
│   ├── repositories/                   # única camada que acessa o Supabase
│   │   ├── GenreRepository.ts
│   │   ├── MovieRepository.ts
│   │   ├── CustomerRepository.ts
│   │   └── RentalRepository.ts
│   ├── routes/                         # rotas com a documentação Swagger
│   │   ├── genreRoutes.ts
│   │   ├── movieRoutes.ts
│   │   ├── customerRoutes.ts
│   │   └── rentalRoutes.ts
│   ├── services/                       # regras de negócio que dependem do banco
│   │   ├── GenreService.ts
│   │   ├── MovieService.ts
│   │   ├── CustomerService.ts
│   │   └── RentalService.ts
│   ├── tests/                          # testes unitários e de integração
│   ├── app.ts                          # configuração do Express e das rotas
│   └── server.ts                       # inicialização do servidor
├── .env.example                        # modelo das variáveis de ambiente
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vitest.config.ts                    # configuração dos testes e da cobertura
```

**Responsabilidade de cada camada:**

- **Routes:** ligam o método HTTP + URL à função do controller e documentam o endpoint no Swagger.
- **Controller:** lê `req.params`, `req.query` e `req.body`, chama o service e devolve o código HTTP (`200`, `201`, `400`, `404` ou `500`).
- **Service:** aplica as regras de negócio que dependem do banco (nome repetido, gênero ou cliente inativo, estoque, reserva em andamento, etc.).
- **Model:** classe da entidade, com atributos privados, getters e métodos de alteração que validam os dados do próprio objeto (nome, e-mail, CPF, dias, estado da locação, multa).
- **Repository:** única camada que conversa com o Supabase. Cada repository acessa apenas a própria tabela.
- **Errors:** erros próprios da aplicação (`ValidationError` e `NotFoundError`).

**Fluxo de uma requisição:** Requisição HTTP → Route → Controller → Service → Repository → Supabase → resposta em JSON. O model é usado pelo service e pelo repository.

## 7. Configuração e execução

**Pré-requisito:** Node.js 22.22 ou superior (`node -v` para conferir).

```bash
# 1. Clonar o repositório
git clone https://github.com/joaoramos14/video-store.git
cd video-store

# 2. Instalar as dependências (da API e do front-end, em um só comando)
npm install

# 3. Criar o arquivo de variáveis de ambiente
cp .env.example .env        # no Windows (cmd): copy .env.example .env
# abra o .env e preencha com as credenciais do seu projeto Supabase

# 4. Criar as tabelas no Supabase
# execute o conteúdo de database/schema.sql no SQL Editor do Supabase

# 5. Iniciar em modo desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3000`. Acessando a rota raiz, a API redireciona para a documentação interativa em `http://localhost:3000/api-docs`.

**Scripts disponíveis:**

| Comando | O que faz |
|---|---|
| `npm run dev` | Executa a API em modo desenvolvimento, reiniciando ao salvar arquivos (lê o `.env`) |
| `npm run dev:full` | Executa a API e o front-end juntos (veja a seção 15) |
| `npm run build` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | Executa a versão compilada (`dist/server.js`), lendo o `.env`; rode `npm run build` antes |
| `npm test` | Executa todos os testes (unitários e de integração) |
| `npm run test:watch` | Executa os testes em modo observação |
| `npm run test:coverage` | Executa os testes e gera o relatório de cobertura |

## 8. Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| SUPABASE_URL | URL do projeto no Supabase | `https://seu-projeto.supabase.co` |
| SUPABASE_SECRET_KEY | Chave secreta do Supabase | `sua-chave-secreta-aqui` |
| PORT | Porta do servidor (padrão: 3000) | `3000` |

O repositório inclui o arquivo `.env.example`, apenas com os nomes das variáveis e valores de exemplo. O arquivo `.env`, com as credenciais reais, **não é versionado** (está listado no `.gitignore`). A chave secreta nunca deve ser publicada no GitHub.

O front-end tem o próprio `.env.example`, na pasta `frontend/` (veja a seção 15).

## 9. Banco de dados

Banco PostgreSQL hospedado no Supabase, com quatro tabelas: `genres`, `movies`, `customers` e `rentals`.

| Tabela | Chave primária | Chaves estrangeiras | Restrições principais |
|---|---|---|---|
| genres | id (uuid) | – | nome único (ignorando maiúsculas e minúsculas) |
| movies | id (uuid) | genre_id → genres(id) | ano ≥ 1888, duração > 0, estoque ≥ 0, diária ≥ 0 |
| customers | id (uuid) | – | e-mail único e CPF único (11 dígitos) |
| rentals | id (uuid) | customer_id → customers(id) e movie_id → movies(id) | dias entre 1 e 30, status limitado aos cinco valores válidos |

Todas as chaves estrangeiras usam `on delete restrict`.

Para reproduzir a estrutura, execute o script `database/schema.sql` no **SQL Editor** do Supabase. Atenção: o script apaga e recria as tabelas (inclusive `filmes` e `generos`, da primeira versão do projeto), então os dados existentes são perdidos. O trecho abaixo mostra apenas a criação das tabelas; os comandos `drop table` ficam no início do arquivo.

```sql
-- Gêneros
create table genres (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create unique index genres_name_unique on genres (lower(name));

-- Filmes
create table movies (
    id uuid primary key default gen_random_uuid(),
    genre_id uuid not null references genres(id) on delete restrict,
    title text not null,
    director text,
    synopsis text,
    year integer not null check (year >= 1888),
    duration integer not null check (duration > 0),
    cover text,
    stock integer not null default 0 check (stock >= 0),
    daily_price numeric(10,2) not null check (daily_price >= 0),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create index idx_movies_genre_id on movies(genre_id);

-- Clientes
create table customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    cpf char(11) not null unique,
    phone text,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Locações
create table rentals (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references customers(id) on delete restrict,
    movie_id uuid not null references movies(id) on delete restrict,
    days integer not null check (days between 1 and 30),
    daily_price numeric(10,2) not null check (daily_price >= 0),
    total_price numeric(10,2) not null check (total_price >= 0),
    late_fee numeric(10,2) not null default 0 check (late_fee >= 0),
    status text not null default 'reserved'
        check (status in ('reserved', 'active', 'returned', 'cancelled', 'expired')),
    reserved_until timestamptz not null,
    rented_at timestamptz,
    due_at timestamptz,
    returned_at timestamptz,
    created_at timestamptz not null default now()
);

create index idx_rentals_customer_id on rentals(customer_id);
create index idx_rentals_movie_id on rentals(movie_id);

-- Segurança: a API acessa o banco com a chave secreta (somente no servidor)
alter table genres enable row level security;
alter table movies enable row level security;
alter table customers enable row level security;
alter table rentals enable row level security;
```

O RLS (Row Level Security) está habilitado nas quatro tabelas. A API acessa o banco com a chave secreta, usada apenas no servidor.

## 10. Endpoints da API

### Geral

| Método | Endpoint | Descrição |
|---|---|---|
| GET | / | Redireciona para a documentação (`/api-docs`) |
| GET | /api-docs | Documentação interativa da API (Swagger UI) |

### Gêneros

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /genres | Lista todos os gêneros (ordenados por nome) |
| GET | /genres/search?keyword= | Busca gêneros por nome ou descrição |
| GET | /genres/:id | Consulta um gênero pelo ID |
| GET | /genres/:id/movies | Lista os filmes de um gênero |
| POST | /genres | Cadastra um gênero |
| PUT | /genres/:id | Atualiza um gênero |
| DELETE | /genres/:id | Remove um gênero |

### Filmes

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /movies | Lista todos os filmes (ordenados por título) |
| GET | /movies/search?keyword= | Busca filmes por título, diretor ou sinopse |
| GET | /movies/:id | Consulta um filme pelo ID |
| POST | /movies | Cadastra um filme |
| PUT | /movies/:id | Atualiza um filme |
| DELETE | /movies/:id | Remove um filme |

### Clientes

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /customers | Lista todos os clientes (ordenados por nome) |
| GET | /customers/search?keyword= | Busca clientes por nome, e-mail ou CPF |
| GET | /customers/:id | Consulta um cliente pelo ID |
| GET | /customers/:id/rentals | Lista as locações de um cliente |
| POST | /customers | Cadastra um cliente |
| PUT | /customers/:id | Atualiza um cliente |
| DELETE | /customers/:id | Remove um cliente |

### Locações

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /rentals | Lista todas as locações (da mais recente para a mais antiga) |
| GET | /rentals/search?keyword= | Busca locações por status (`reserved`, `active`, `late`, `returned`, `cancelled` ou `expired`) |
| GET | /rentals/:id | Consulta uma locação pelo ID |
| POST | /rentals | Reserva um filme para um cliente |
| PUT | /rentals/:id | Altera os dias de uma reserva ainda não retirada |
| DELETE | /rentals/:id | Remove uma locação finalizada |
| POST | /rentals/:id/pickup | Registra a retirada do filme |
| POST | /rentals/:id/return | Registra a devolução e calcula a multa por atraso |
| POST | /rentals/:id/cancel | Cancela uma reserva antes da retirada |
| POST | /rentals/expire-reservations | Expira as reservas vencidas e devolve as cópias ao estoque |

Na busca por status, `late` retorna os aluguéis retirados cuja data limite de devolução já passou, e `active` retorna os que ainda estão no prazo.

### Códigos de resposta HTTP

| Código | Significado | Quando ocorre |
|---|---|---|
| 200 | Requisição bem-sucedida | Consultas, atualizações, remoções e ações sobre locações |
| 201 | Registro criado | `POST` de criação bem-sucedido |
| 400 | Dados inválidos | Regra de negócio violada (`ValidationError`), campo obrigatório ausente ou palavra-chave não informada |
| 404 | Não encontrado | `GET`, `PUT` ou `DELETE` com um `id` que não existe, ou ação de locação (`pickup`, `return`, `cancel`) com um `id` que não existe |
| 500 | Erro interno do servidor | Falha inesperada (por exemplo, erro de conexão com o banco) |

Todas as mensagens de erro são devolvidas em JSON, por exemplo:

```json
{ "message": "Gênero não encontrado." }
```

## 11. Exemplos de requisições

### Criar gênero: `POST /genres`

```json
{
  "name": "Ação",
  "description": "Filmes de ação e aventura"
}
```

Resposta (`201 Created`):

```json
{
  "id": "3f2a9c1e-5b7d-4c8e-9a1f-2d6b8e4c7a10",
  "name": "Ação",
  "description": "Filmes de ação e aventura",
  "active": true,
  "created_at": "2026-11-25T14:30:00.000Z"
}
```

### Atualizar gênero: `PUT /genres/:id`

Aceita campos parciais: apenas os campos informados são alterados.

```json
{
  "name": "Ação e Aventura",
  "description": "Filmes de ação, aventura e suspense",
  "active": true
}
```

### Criar filme: `POST /movies`

O `genre_id` deve ser o `id` de um gênero existente e ativo.

```json
{
  "genre_id": "3f2a9c1e-5b7d-4c8e-9a1f-2d6b8e4c7a10",
  "title": "Matrix",
  "director": "Lana e Lilly Wachowski",
  "synopsis": "Um hacker descobre a verdadeira natureza da realidade.",
  "year": 1999,
  "duration": 136,
  "cover": "https://exemplo.com/matrix.jpg",
  "stock": 5,
  "daily_price": 9.9
}
```

### Atualizar filme: `PUT /movies/:id`

Aceita campos parciais: apenas os campos informados são alterados.

```json
{
  "stock": 3,
  "daily_price": 12.5
}
```

### Criar cliente: `POST /customers`

```json
{
  "name": "Maria da Silva",
  "email": "maria@email.com",
  "cpf": "52998224725",
  "phone": "41999998888"
}
```

Resposta (`201 Created`):

```json
{
  "id": "7b1d3e52-8c4a-4f6b-a3d9-0e5f1c2b9a64",
  "name": "Maria da Silva",
  "email": "maria@email.com",
  "cpf": "52998224725",
  "phone": "41999998888",
  "active": true,
  "created_at": "2026-11-25T14:35:00.000Z"
}
```

### Atualizar cliente: `PUT /customers/:id`

Aceita campos parciais: apenas os campos informados são alterados.

```json
{
  "name": "Maria da Silva Souza",
  "phone": "41988887777",
  "active": true
}
```

### Reservar um filme: `POST /rentals`

```json
{
  "customer_id": "7b1d3e52-8c4a-4f6b-a3d9-0e5f1c2b9a64",
  "movie_id": "c9e8a1b4-2d3f-4a5b-8c6d-7e9f0a1b2c3d",
  "days": 3
}
```

Resposta (`201 Created`):

```json
{
  "id": "a41f6c20-9d3b-4e87-b5a2-1c7e8f90d234",
  "customer_id": "7b1d3e52-8c4a-4f6b-a3d9-0e5f1c2b9a64",
  "movie_id": "c9e8a1b4-2d3f-4a5b-8c6d-7e9f0a1b2c3d",
  "days": 3,
  "daily_price": 9.9,
  "total_price": 29.7,
  "late_fee": 0,
  "status": "reserved",
  "reserved_until": "2026-11-26T15:00:00.000Z",
  "rented_at": null,
  "due_at": null,
  "returned_at": null,
  "created_at": "2026-11-25T15:00:00.000Z"
}
```

### Alterar os dias de uma reserva: `PUT /rentals/:id`

Só é permitido enquanto a reserva ainda não foi retirada. O total é recalculado.

```json
{
  "days": 5
}
```

### Ações sobre uma locação

As rotas `POST /rentals/:id/pickup`, `POST /rentals/:id/return` e `POST /rentals/:id/cancel` não recebem corpo. Cada uma devolve a locação atualizada (`pickup` muda o `status` para `active` e preenche `rented_at` e `due_at`; `return` muda para `returned` e preenche `returned_at` e `late_fee`; `cancel` muda para `cancelled`).

### Exemplos de erro

`POST /customers` com CPF inválido (`400 Bad Request`):

```json
{ "message": "O CPF do cliente é inválido." }
```

`POST /rentals` com cliente inativo (`400 Bad Request`):

```json
{ "message": "O cliente informado está inativo." }
```

`DELETE /genres/:id` de um gênero que possui filmes (`400 Bad Request`):

```json
{ "message": "Não é possível remover um gênero que possui filmes." }
```

## 12. Testes automatizados e cobertura

**Ferramentas:** Vitest (execução e cobertura com `@vitest/coverage-v8`) e Supertest (requisições HTTP nos testes de integração).

**Organização dos arquivos** (pasta `src/tests/`):

| Tipo | Arquivos | O que testa |
|---|---|---|
| Unitário do model | `Genre.test.ts`, `Movie.test.ts`, `Customer.test.ts`, `Rental.test.ts` | Regras das classes, sem banco |
| Unitário do service | `GenreService.test.ts`, `MovieService.test.ts`, `CustomerService.test.ts`, `RentalService.test.ts` | Regras de negócio com o repository **mockado** (`vi.mock`) |
| Integração | `Genre.integration.test.ts`, `Movie.integration.test.ts`, `Customer.integration.test.ts`, `Rental.integration.test.ts`, `App.integration.test.ts` | Endpoints com Supertest e Supabase real |
| Erros | `Errors.test.ts` | Classes `NotFoundError` e `ValidationError` |

São 14 arquivos e 269 testes. Os testes de integração cobrem, para as quatro entidades, a criação, a listagem, a consulta por ID, a atualização e a exclusão, além das validações e das regras de negócio, conferindo os códigos HTTP e os dados retornados.

**Como executar:**

```bash
# todos os testes (unitários e de integração)
npm test

# apenas os testes unitários
npx vitest run --exclude "**/*.integration.test.ts"

# apenas os testes de integração
npx vitest run integration

# testes com relatório de cobertura
npm run test:coverage
```

**Configurações necessárias:** os testes de integração usam o Supabase real configurado no `.env`, e o `vitest.config.ts` lê esse arquivo ao iniciar. Por isso, o `.env` precisa existir (copiado do `.env.example` e preenchido) e as tabelas do `database/schema.sql` precisam estar criadas. O `vitest.config.ts` também define o limite de 20 segundos por teste (`testTimeout`), porque cada requisição vai até o Supabase pela internet.

**Cuidados com o banco de testes:**

- Os dados de teste usam `randomUUID()` no nome ou no e-mail (e CPFs válidos gerados aleatoriamente), para não colidir com registros existentes nem entre testes.
- Cada teste de integração remove, ao final, tudo o que criou (inclusive os registros filhos, na ordem correta das chaves estrangeiras). Assim, os testes podem ser executados novamente sem interferência.
- Recomenda-se usar um projeto do Supabase destinado a desenvolvimento, e não um banco com dados reais.

**Cobertura:** o relatório é gerado pelo `@vitest/coverage-v8` e mede todo o código de `src/`, excluindo apenas a configuração (`src/config/**`), a inicialização do servidor (`src/server.ts`) e os próprios testes (`src/tests/**`). Nenhuma camada (controller, service, repository, model ou rotas) é excluída. Os limites mínimos de 60% estão definidos no `vitest.config.ts` para as quatro métricas, e o comando `npm run test:coverage` falha se qualquer uma ficar abaixo disso. Além do relatório no terminal, é gerado um relatório em HTML na pasta `coverage/` (abra `coverage/index.html` no navegador). A pasta `coverage/` não é versionada (está no `.gitignore`); para visualizar o relatório, basta executar `npm run test:coverage`.

Percentuais de cobertura alcançados (resultado de `npm run test:coverage`):

| Métrica | Cobertura | Mínimo exigido |
|---|---|---|
| Linhas (lines) | 89,62% | 60% |
| Instruções (statements) | 89,64% | 60% |
| Funções (functions) | 100% | 60% |
| Ramificações (branches) | 82,23% | 60% |

Cobertura por camada: model, services, routes e errors com 100%; controllers com cerca de 82% e repositories com cerca de 74%. As linhas não cobertas são, em geral, os trechos de erro interno (`500`), que só ocorrem com falha real do banco.

## 13. Documentação Swagger

Com o servidor rodando (`npm run dev`), acesse **http://localhost:3000/api-docs** (a rota raiz `http://localhost:3000/` também redireciona para lá).

Na página é possível:

- ver todos os endpoints agrupados por entidade (**Genres**, **Movies**, **Customers** e **Rentals**), com método, rota e finalidade;
- abrir cada endpoint para ver os parâmetros, o formato do corpo da requisição, exemplos e os códigos de resposta (`200`, `201`, `400`, `404` e `500`);
- testar a API pelo próprio navegador: clique em **Try it out**, preencha os dados e em **Execute**;
- consultar os schemas das entidades (como `Genre`, `CreateGenre` e `UpdateGenre`, e os equivalentes de filmes, clientes e locações) na seção **Schemas**.

A documentação é gerada pelo `swagger-jsdoc` a partir dos comentários `@openapi` que ficam acima de cada rota em `src/routes/`. A configuração geral e os schemas ficam em `src/config/swagger.ts`.

## 14. Testes com o Postman

A collection do Postman está em `postman/collections/video-store.postman_collection.json` e é organizada em pastas: **Root**, uma pasta para cada entidade (Genres, Movies, Customers e Rentals) e **Cleanup** no final, que remove os registros criados durante a execução. São 66 requisições, todas com testes automáticos (`pm.test`) que conferem o código de resposta e os dados retornados, incluindo os cenários de erro (`400` e `404`).

**Como usar:**

1. Inicie a API com `npm run dev`.
2. No Postman, importe o arquivo da collection (**Import**).
3. A collection possui a variável `baseUrl` (por padrão, `http://localhost:3000`). Se a API usar outra porta, altere o valor na aba **Variables**.
4. Clique em **Run** na collection e execute tudo em ordem. As demais variáveis (`genreId`, `movieId`, `customerId`, `rentalId`, etc.) são preenchidas automaticamente durante a execução.

## 15. Front-end (complementar)

A pasta `frontend/` contém uma interface web em React, Vite, TypeScript e Tailwind CSS que consome a API. Ela é complementar e não substitui nenhum requisito do back-end.

- **Usuário:** o cliente é escolhido no cabeçalho (sem autenticação). Ele navega pelo catálogo de filmes (com busca por título, gênero e ano), vê os detalhes do filme, reserva e acompanha ou cancela as próprias reservas em "Meus aluguéis".
- **Admin:** painel para gerenciar gêneros, filmes e clientes (cadastro, edição e exclusão) e para acompanhar as locações, com filtros por status e as ações de retirada e devolução.

```bash
# na raiz do repositório
# instala as dependências da API e, em seguida, as do front-end
# (o script "postinstall" roda "npm --prefix frontend install" automaticamente)
npm install

# executa a API e o front-end juntos
npm run dev:full
```

O front-end abre em `http://localhost:5173` e usa a API em `http://localhost:3000`. Para apontar para outro endereço, copie `frontend/.env.example` para `frontend/.env` e altere a variável `VITE_API_URL`. Também é possível executar só o front-end, com `npm run dev` dentro da pasta `frontend/` (a API precisa estar rodando).
