// Formato dos dados devolvidos pela API (colunas das tabelas do Supabase).

export interface Genre {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    created_at: string;
}

export interface Movie {
    id: string;
    genre_id: string;
    title: string;
    director: string | null;
    synopsis: string | null;
    year: number;
    duration: number;
    cover: string | null;
    stock: number;
    daily_price: number;
    active: boolean;
    created_at: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string | null;
    active: boolean;
    created_at: string;
}

export type RentalStatus = "reserved" | "active" | "returned" | "cancelled" | "expired";

export interface Rental {
    id: string;
    customer_id: string;
    movie_id: string;
    days: number;
    daily_price: number;
    total_price: number;
    late_fee: number;
    status: RentalStatus;
    reserved_until: string;
    rented_at: string | null;
    due_at: string | null;
    returned_at: string | null;
    created_at: string;
}

export interface GenreInput {
    name: string;
    description?: string;
    active?: boolean;
}

export interface MovieInput {
    genre_id: string;
    title: string;
    director?: string;
    synopsis?: string;
    year: number;
    duration: number;
    cover?: string;
    stock: number;
    daily_price: number;
    active?: boolean;
}

export interface CustomerInput {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
    active?: boolean;
}
