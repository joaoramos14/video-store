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