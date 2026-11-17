import type { Request, Response } from "express";
import MovieService from "../services/MovieService.js";
import { ValidationError } from "../errors/ValidantionError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function getAll(req: Request, res: Response) {
    try {
        const movies = await MovieService.getAll();

        return res.status(200).json(movies);
    } catch (error) {
        console.error("Erro ao buscar filmes:", error);

        return res.status(500).json({
            message: "Erro ao buscar filmes.",
        });
    }
}

async function search(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({
            message: "Palavra-chave não informada.",
        });
    }

    try {
        const movies = await MovieService.search(keyword);

        return res.status(200).json(movies);
    } catch (error) {
        console.error("Erro ao pesquisar filmes:", error);

        return res.status(500).json({
            message: "Erro ao pesquisar filmes.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const movie = await MovieService.getById(id);

        return res.status(200).json({
            id: movie.getId(),
            genre_id: movie.getGenreId(),
            title: movie.getTitle(),
            director: movie.getDirector(),
            synopsis: movie.getSynopsis(),
            year: movie.getYear(),
            duration: movie.getDuration(),
            cover: movie.getCover(),
            stock: movie.getStock(),
            daily_price: movie.getDailyPrice(),
            active: movie.isActive(),
        });
    } catch (error) {
        console.error("Erro ao buscar filme:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar filme.",
        });
    }
}

async function create(req: Request, res: Response) {
    const {
        genre_id,
        title,
        year,
        duration,
        daily_price,
        stock,
        director,
        synopsis,
        cover,
    } = req.body ?? {};

    try {
        const createdMovie = await MovieService.create({
            genre_id,
            title,
            year,
            duration,
            daily_price,
            stock,
            director,
            synopsis,
            cover,
        });

        return res.status(201).json(createdMovie);
    } catch (error) {
        console.error("Erro ao criar filme:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao criar filme.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const {
        genre_id,
        title,
        year,
        duration,
        daily_price,
        stock,
        director,
        synopsis,
        cover,
        active,
    } = req.body ?? {};

    try {
        const updatedMovie = await MovieService.update(id, {
            genre_id,
            title,
            year,
            duration,
            daily_price,
            stock,
            director,
            synopsis,
            cover,
            active,
        });

        return res.status(200).json(updatedMovie);
    } catch (error) {
        console.error("Erro ao atualizar filme:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar filme.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        await MovieService.remove(id);

        return res.status(200).json({
            message: "Filme removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover filme:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao remover filme.",
        });
    }
}

export default {
    getAll,
    search,
    getById,
    create,
    update,
    remove,
};
