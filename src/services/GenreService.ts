import { Genre } from "../model/Genre.js";
import GenreRepository from "../repositories/GenreRepository.js";
import MovieRepository from "../repositories/MovieRepository.js";
import { ValidationError } from "../errors/ValidantionError.js";

interface UpdateGenreData {
    name?: string;
    description?: string;
    active?: boolean;
}

async function getAll() {
    return GenreRepository.findAll();
}

async function getById(id: string) {
    return GenreRepository.findById(id);
}

async function getMovies(id: string) {
    await GenreRepository.findById(id);

    return MovieRepository.findByGenreId(id);
}

async function search(keyword: string) {
    return GenreRepository.searchByKeyword(keyword);
}

async function create(name: string, description?: string) {
    const genre = new Genre(name, description);

    const existingGenre = await GenreRepository.findByName(genre.getName());

    if (existingGenre) {
        throw new ValidationError("Já existe um gênero com este nome.");
    }

    return GenreRepository.create(genre);
}

async function update(id: string, data: UpdateGenreData) {
    const genre = await GenreRepository.findById(id);

    if (data.name !== undefined) {
        genre.rename(data.name);

        const existingGenre = await GenreRepository.findByName(genre.getName());

        if (existingGenre && existingGenre.id !== id) {
            throw new ValidationError("Já existe um gênero com este nome.");
        }
    }

    if (data.description !== undefined) {
        genre.changeDescription(data.description);
    }

    if (data.active === true) {
        genre.activate();
    }

    if (data.active === false) {
        genre.deactivate();
    }

    return GenreRepository.update(genre);
}

async function remove(id: string) {
    return GenreRepository.remove(id);
}

export default {
    getAll,
    getById,
    getMovies,
    search,
    create,
    update,
    remove,
}
