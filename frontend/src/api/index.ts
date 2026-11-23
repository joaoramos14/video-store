import { api } from "./client";
import type {
    Customer,
    CustomerInput,
    Genre,
    GenreInput,
    Movie,
    MovieInput,
    Rental,
} from "./types";

// Um módulo por recurso da API, com as mesmas rotas documentadas no Swagger.

export const genresApi = {
    list: () => api.get<Genre[]>("/genres"),
    get: (id: string) => api.get<Genre>(`/genres/${id}`),
    create: (data: GenreInput) => api.post<Genre>("/genres", data),
    update: (id: string, data: GenreInput) => api.put<Genre>(`/genres/${id}`, data),
    remove: (id: string) => api.delete<{ message: string }>(`/genres/${id}`),
};

export const moviesApi = {
    list: () => api.get<Movie[]>("/movies"),
    get: (id: string) => api.get<Movie>(`/movies/${id}`),
    create: (data: MovieInput) => api.post<Movie>("/movies", data),
    update: (id: string, data: Partial<MovieInput>) => api.put<Movie>(`/movies/${id}`, data),
    remove: (id: string) => api.delete<{ message: string }>(`/movies/${id}`),
};

export const customersApi = {
    list: () => api.get<Customer[]>("/customers"),
    get: (id: string) => api.get<Customer>(`/customers/${id}`),
    rentals: (id: string) => api.get<Rental[]>(`/customers/${id}/rentals`),
    create: (data: CustomerInput) => api.post<Customer>("/customers", data),
    update: (id: string, data: Partial<CustomerInput>) => api.put<Customer>(`/customers/${id}`, data),
    remove: (id: string) => api.delete<{ message: string }>(`/customers/${id}`),
};

export const rentalsApi = {
    list: () => api.get<Rental[]>("/rentals"),
    search: (status: string) =>
        api.get<Rental[]>(`/rentals/search?keyword=${encodeURIComponent(status)}`),
    create: (data: { customer_id: string; movie_id: string; days: number }) =>
        api.post<Rental>("/rentals", data),
    pickUp: (id: string) => api.post<Rental>(`/rentals/${id}/pickup`),
    returnMovie: (id: string) => api.post<Rental>(`/rentals/${id}/return`),
    cancel: (id: string) => api.post<Rental>(`/rentals/${id}/cancel`),
    // Faz o papel da tarefa agendada do PHP: expira as reservas vencidas antes de listar.
    expireReservations: () => api.post<{ message: string }>("/rentals/expire-reservations"),
};
