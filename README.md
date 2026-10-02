# Video Store API

API REST em Node.js, TypeScript e Supabase para gerenciar o catálogo de filmes de uma locadora, organizados por gênero.

---

## 1. Descrição do projeto

**Problema que resolve:** locadoras precisam manter o catálogo de filmes organizado, com as informações de cada título (diretor, ano de lançamento, preço de locação, disponibilidade) e o gênero ao qual ele pertence. Esta API centraliza esse cadastro.

**Domínio escolhido:** locadora de filmes.

**Objetivo da API:** permitir cadastrar, consultar, atualizar e remover **gêneros** e **filmes**, persistindo os dados em um banco PostgreSQL hospedado no Supabase. A estrutura foi pensada para evoluir, podendo receber novas entidades no futuro (clientes, locações, etc.).

Projeto desenvolvido como Atividade Prática Supervisionada (APS) da disciplina de Desenvolvimento Back-End, do curso de Engenharia de Software.

## 2. Integrantes da equipe

- Erick Yuri Maba Silva
- João Henrique Ramos
- Lucas Indalencio Gonçalves de Lima

## 3. Tecnologias utilizadas

- **Node.js** (v20.6 ou superior)
- **TypeScript**
- **Express** 5
- **Supabase** (PostgreSQL) com `@supabase/supabase-js`
- **tsx** (execução do TypeScript em desenvolvimento)
- **Git** e **GitHub** (versionamento)
- **Postman** (testes da API; a collection está na raiz do repositório)

## 4. Entidades e relacionamento

### Gênero

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único (gerado automaticamente) |
| nome | texto | Nome do gênero (obrigatório) |
| descricao | texto | Descrição do gênero |
| ativo | booleano | Se o gênero está ativo (padrão: `true`) |
| created_at | data/hora | Data de criação (automática) |

### Filme

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único (gerado automaticamente) |
| genero_id | UUID (FK) | Gênero ao qual o filme pertence (obrigatório) |
| titulo | texto | Título do filme (obrigatório) |
| descricao | texto | Sinopse ou descrição |
| ano_lancamento | inteiro | Ano de lançamento |
| diretor | texto | Nome do diretor |
| preco_locacao | decimal(10,2) | Preço da locação |
| disponivel | booleano | Se o filme está disponível para locação (padrão: `true`) |
| ativo | booleano | Se o registro está ativo (padrão: `true`) |
| created_at | data/hora | Data de criação (automática) |

### Relacionamento

Um **Gênero** pode possuir vários **Filmes** (1:N) e cada **Filme** pertence a exatamente um **Gênero**, ligado pela chave estrangeira `genero_id`.

> **Atenção:** a chave estrangeira foi criada com `on delete cascade`. Ao remover um gênero, **todos os filmes desse gênero também são removidos**.

## 5. Estrutura do projeto

```
video-store/
├── database/
│   └── schema.sql                  # script de criação das tabelas
├── src/
│   ├── config/
│   │   └── supabase.ts             # conexão com o Supabase
│   ├── controller/                 # validações e respostas HTTP
│   │   ├── GeneroController.ts
│   │   └── FilmeController.ts
│   ├── models/                     # acesso ao banco de dados
│   │   ├── Genero.ts
│   │   └── Filme.ts
│   ├── routes/                     # definição das rotas
│   │   ├── generoRoutes.ts
│   │   └── filmeRoutes.ts
│   ├── utils/
│   │   └── isUuid.ts               # validação de formato de UUID
│   ├── app.ts                      # configuração do Express, rotas e tratamento global de erros
│   └── server.ts                   # inicialização do servidor
├── .env.example                    # modelo das variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
└── Video Store API.postman_collection.json   # collection de testes do Postman
```

**Responsabilidade de cada camada:**

- **Routes:** ligam o método HTTP + URL à função do controller.
- **Controller:** valida os dados recebidos e decide o código de resposta HTTP.
- **Models:** única camada que conversa com o Supabase.

**Fluxo de uma requisição:** Cliente → Route → Controller → Model → Supabase → resposta em JSON.

## 6. Configuração e execução

**Pré-requisito:** Node.js 20.6 ou superior (`node -v` para conferir).

```bash
# 1. Clonar o repositório
git clone https://github.com/joaoramos14/video-store.git
cd video-store

# 2. Instalar as dependências
npm install

# 3. Criar o arquivo de variáveis de ambiente
cp .env.example .env        # no Windows (cmd): copy .env.example .env
# abra o .env e preencha com as credenciais do seu projeto Supabase

# 4. Criar as tabelas no Supabase
# execute o conteúdo de database/schema.sql no SQL Editor do Supabase

# 5. Iniciar em modo desenvolvimento
npm run dev
```

Ao iniciar, o terminal mostra a mensagem de que o servidor está executando. Acessando `http://localhost:3000`, a API responde com um JSON de boas-vindas.

**Scripts disponíveis:**

| Comando | O que faz |
|---|---|
| `npm run dev` | Executa em modo desenvolvimento, reiniciando ao salvar arquivos |
| `npm run build` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | Executa a versão compilada (`dist/server.js`); rode `npm run build` antes |

## 7. Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| SUPABASE_URL | URL do projeto no Supabase | `https://seu-projeto.supabase.co` |
| SUPABASE_SECRET_KEY | Chave secreta do Supabase | `sua-chave-secreta-aqui` |
| PORT | Porta do servidor (padrão: 3000) | `3000` |

O repositório inclui o arquivo `.env.example`, apenas com os nomes das variáveis. O arquivo `.env`, com as credenciais reais, **não é versionado** (está listado no `.gitignore`). A chave secreta nunca deve ser publicada no GitHub.

## 8. Banco de dados

Banco PostgreSQL hospedado no Supabase, com duas tabelas: `generos` e `filmes`. A tabela `filmes` referencia `generos` pela chave estrangeira `genero_id`.

Para reproduzir a estrutura, execute o script `database/schema.sql` no **SQL Editor** do Supabase:

```sql
create table generos (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    descricao text,
    ativo boolean not null default true,
    created_at timestamptz not null default now()
);

create table filmes (
    id uuid primary key default gen_random_uuid(),
    genero_id uuid not null references generos(id) on delete cascade,
    titulo text not null,
    descricao text,
    ano_lancamento integer,
    diretor text,
    preco_locacao numeric(10,2),
    disponivel boolean not null default true,
    ativo boolean not null default true,
    created_at timestamptz not null default now()
);

create index idx_filmes_genero_id on filmes(genero_id);

alter table generos enable row level security;
alter table filmes enable row level security;
```

O RLS (Row Level Security) está habilitado nas duas tabelas. A API acessa o banco com a chave secreta, usada apenas no servidor.

## 9. Documentação dos endpoints

### Rota de verificação

| Método | Endpoint | Descrição |
|---|---|---|
| GET | / | Retorna uma mensagem de boas-vindas e a versão da API |

### Gêneros

| Método | Endpoint | Descrição | Dados necessários |
|---|---|---|---|
| GET | /generos | Lista todos os gêneros (ordenados por nome) | – |
| GET | /generos/:id | Consulta um gênero pelo ID | – |
| POST | /generos | Cadastra um novo gênero | `nome` (obrigatório); `descricao`, `ativo` (opcionais) |
| PUT | /generos/:id | Atualiza um gênero | `nome` (obrigatório); `descricao`, `ativo` (opcionais) |
| DELETE | /generos/:id | Remove um gênero (e seus filmes) | – |
| GET | /generos/:id/filmes | Lista os filmes de um gênero (ordenados por título) | – |

### Filmes

| Método | Endpoint | Descrição | Dados necessários |
|---|---|---|---|
| GET | /filmes | Lista todos os filmes (ordenados por título) | – |
| GET | /filmes/:id | Consulta um filme pelo ID | – |
| POST | /filmes | Cadastra um novo filme | `titulo` e `genero_id` (obrigatórios); `descricao`, `ano_lancamento`, `diretor`, `preco_locacao`, `disponivel`, `ativo` (opcionais) |
| PUT | /filmes/:id | Atualiza um filme | os mesmos campos do POST (`titulo` e `genero_id` continuam obrigatórios) |
| DELETE | /filmes/:id | Remove um filme | – |

O `genero_id` informado deve ser de um gênero já cadastrado.

### Validações

| Campo | Regra |
|---|---|
| `:id` (na URL) e `genero_id` | Devem ser UUIDs válidos |
| `nome` (gênero) | Texto não vazio |
| `titulo` (filme) | Texto não vazio |
| `descricao`, `diretor` | Texto, quando informados |
| `ano_lancamento` | Número inteiro maior ou igual a 1888, quando informado |
| `preco_locacao` | Número maior ou igual a zero, quando informado |
| `ativo`, `disponivel` | Booleanos (`true` ou `false`), quando informados |

Campos que não fazem parte da entidade são ignorados: a API envia ao banco apenas os campos permitidos.

### Códigos de resposta HTTP

| Código | Significado | Quando ocorre |
|---|---|---|
| 200 | Requisição bem-sucedida | Consultas, atualizações e remoções |
| 201 | Registro criado | `POST` bem-sucedido |
| 400 | Dados inválidos | Campo obrigatório ausente, tipo inválido, UUID inválido, `genero_id` de um gênero que não existe ou corpo da requisição com JSON malformado |
| 404 | Não encontrado | `GET`, `PUT` ou `DELETE` com um `id` que não existe, ou rota inexistente |
| 500 | Erro interno do servidor | Falha inesperada (por exemplo, erro de conexão com o banco) |

Todas as mensagens de erro são devolvidas em JSON, por exemplo:

```json
{ "message": "Filme não encontrado." }
```

## 10. Exemplos de requisições

### Criar gênero: `POST /generos`

```json
{
  "nome": "Ação",
  "descricao": "Filmes de ação e aventura",
  "ativo": true
}
```

Resposta (`201 Created`):

```json
{
  "id": "3f2a9c1e-5b7d-4c8e-9a1f-2d6b8e4c7a10",
  "nome": "Ação",
  "descricao": "Filmes de ação e aventura",
  "ativo": true,
  "created_at": "2026-10-02T14:30:00.000Z"
}
```

### Atualizar gênero: `PUT /generos/:id`

```json
{
  "nome": "Ação e Aventura",
  "descricao": "Filmes de ação, aventura e suspense",
  "ativo": true
}
```

### Criar filme: `POST /filmes`

O `genero_id` deve ser o `id` de um gênero existente.

```json
{
  "genero_id": "3f2a9c1e-5b7d-4c8e-9a1f-2d6b8e4c7a10",
  "titulo": "Matrix",
  "descricao": "Um hacker descobre a verdadeira natureza da realidade.",
  "ano_lancamento": 1999,
  "diretor": "Lana e Lilly Wachowski",
  "preco_locacao": 9.90,
  "disponivel": true,
  "ativo": true
}
```

### Atualizar filme: `PUT /filmes/:id`

```json
{
  "genero_id": "3f2a9c1e-5b7d-4c8e-9a1f-2d6b8e4c7a10",
  "titulo": "Matrix",
  "descricao": "Um hacker descobre a verdadeira natureza da realidade.",
  "ano_lancamento": 1999,
  "diretor": "Lana e Lilly Wachowski",
  "preco_locacao": 12.50,
  "disponivel": false,
  "ativo": true
}
```

### Exemplos de erro

`POST /filmes` sem título (`400 Bad Request`):

```json
{ "message": "O campo 'titulo' é obrigatório." }
```

`GET /generos/abc` (`400 Bad Request`):

```json
{ "message": "ID inválido." }
```

## 11. Testes com o Postman

O arquivo `Video Store API.postman_collection.json`, na raiz do repositório, contém a collection **Video Store API**, organizada por recurso:

| Pasta | Requisições |
|---|---|
| Gêneros | `GET - List Generos`, `GET - Get Genero by ID`, `POST - Create Genero`, `PUT - Update Genero`, `DELETE - Delete Genero` |
| Filmes | `GET - List Filmes`, `GET - Get Filme by ID`, `GET - List Filmes by Genero`, `POST - Create Filme`, `PUT - Update Filme`, `DELETE - Delete Filme` |

**Como usar:**

1. Inicie a API com `npm run dev`.
2. No Postman, use **Import** e selecione o arquivo da collection.
3. A collection possui a variável `baseUrl` (por padrão, `http://localhost:3000`). Se a API usar outra porta, altere o valor na aba **Variables** da collection.
4. Execute `POST - Create Genero` e copie o `id` retornado na resposta.
5. Nas requisições que precisam de um identificador, complete a URL com o `id` correspondente (por exemplo, `{{baseUrl}}/generos/<id-do-genero>`). Em `GET - List Filmes by Genero`, substitua `idgenero` pelo `id` do gênero.
6. Em `POST - Create Filme` e `PUT - Update Filme`, preencha o campo `genero_id` do corpo com o `id` de um gênero existente.
7. Para consultar, atualizar ou remover um filme, use o `id` retornado por `POST - Create Filme` na URL.

Os corpos de exemplo da collection usam apenas os campos principais de cada entidade. Os campos opcionais restantes (`ativo`, em gêneros; `disponivel` e `ativo`, em filmes) podem ser acrescentados conforme a seção 10.
