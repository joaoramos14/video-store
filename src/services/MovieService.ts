import { Movie } from "../model/Movie.js";
import type { Genre } from "../model/Genre.js";
import MovieRepository from "../repositories/MovieRepository.js";
import GenreRepository from "../repositories/GenreRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

interface CreateMovieData {
    genre_id: string;
    title: string;
    year: number;
    duration: number;
    daily_price: number;
    stock?: number;
    director?: string;
    synopsis?: string;
    cover?: string;
}

interface UpdateMovieData {
    genre_id?: string;
    title?: string;
    year?: number;
    duration?: number;
    daily_price?: number;
    stock?: number;
    director?: string;
    synopsis?: string;
    cover?: string;
    active?: boolean;
}

// Regra que depende do banco: o gênero precisa existir e estar ativo.
async function ensureGenreIsActive(genreId: string): Promise<void> {
    let genre: Genre;

    try {
        genre = await GenreRepository.findById(genreId);
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw new ValidationError("O gênero informado não existe.");
        }

        throw error;
    }

    if (!genre.isActive()) {
        throw new ValidationError("O gênero informado está inativo.");
    }
}

async function getAll() {
    return MovieRepository.findAll();
}

async function getById(id: string) {
    return MovieRepository.findById(id);
}

async function search(keyword: string) {
    return MovieRepository.searchByKeyword(keyword);
}

async function create(data: CreateMovieData) {
    const movie = new Movie(
        data.genre_id,
        data.title,
        data.year,
        data.duration,
        data.daily_price,
        data.stock,
        data.director,
        data.synopsis,
        data.cover,
    );

    await ensureGenreIsActive(movie.getGenreId());

    return MovieRepository.create(movie);
}

async function update(id: string, data: UpdateMovieData) {
    const movie = await MovieRepository.findById(id);

    if (data.genre_id !== undefined) {
        const currentGenreId = movie.getGenreId();

        movie.changeGenre(data.genre_id);

        // Só consulta o gênero quando ele realmente mudou: assim um filme
        // cujo gênero foi desativado depois ainda pode ter outros dados editados.
        if (movie.getGenreId() !== currentGenreId) {
            await ensureGenreIsActive(movie.getGenreId());
        }
    }

    if (data.title !== undefined) {
        movie.rename(data.title);
    }

    if (data.director !== undefined) {
        movie.changeDirector(data.director);
    }

    if (data.synopsis !== undefined) {
        movie.changeSynopsis(data.synopsis);
    }

    if (data.year !== undefined) {
        movie.changeYear(data.year);
    }

    if (data.duration !== undefined) {
        movie.changeDuration(data.duration);
    }

    if (data.cover !== undefined) {
        movie.changeCover(data.cover);
    }

    if (data.stock !== undefined) {
        movie.changeStock(data.stock);
    }

    if (data.daily_price !== undefined) {
        movie.changeDailyPrice(data.daily_price);
    }

    if (data.active === true) {
        movie.activate();
    }

    if (data.active === false) {
        movie.deactivate();
    }

    return MovieRepository.update(movie);
}

async function remove(id: string) {
    return MovieRepository.remove(id);
}

export default {
    getAll,
    getById,
    search,
    create,
    update,
    remove,
};
