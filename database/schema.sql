-- =====================================================
-- Video Store API - estrutura do banco de dados
-- Execute este script no SQL Editor do Supabase.
-- Atenção: ele apaga e recria as tabelas (os dados são perdidos).
-- =====================================================

drop table if exists rentals;
drop table if exists customers;
drop table if exists movies;
drop table if exists genres;

-- tabelas da primeira versão do projeto
drop table if exists filmes;
drop table if exists generos;

-- =====================================================
-- Gêneros
-- =====================================================
create table genres (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create unique index genres_name_unique on genres (lower(name));

-- =====================================================
-- Filmes
-- =====================================================
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

-- =====================================================
-- Clientes
-- =====================================================
create table customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    cpf char(11) not null unique,
    phone text,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

-- =====================================================
-- Locações
-- =====================================================
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

-- =====================================================
-- Segurança: a API acessa o banco com a chave secreta (somente no servidor)
-- =====================================================
alter table genres enable row level security;
alter table movies enable row level security;
alter table customers enable row level security;
alter table rentals enable row level security;
