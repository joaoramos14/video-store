import type { Request, Response } from "express";
import GenreService from "../services/GenreService.js";
import { ValidationError } from "../errors/ValidantionError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function getAll(req: Request, res: Response) {
    try {
        const genres = await GenreService.getAll();

        return res.status(200).json(genres);
    } catch (error) {
        console.error("Erro ao buscar gêneros:", error);

        return res.status(500).json({
            message: "Erro ao buscar gêneros.",
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
        const genres = await GenreService.search(keyword);

        return res.status(200).json(genres);
    } catch (error) {
        console.error("Erro ao pesquisar gêneros:", error);

        return res.status(500).json({
            message: "Erro ao pesquisar gêneros.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const genre = await GenreService.getById(id);

        return res.status(200).json({
            id: genre.getId(),
            name: genre.getName(),
            description: genre.getDescription(),
            active: genre.isActive(),
        });
    } catch (error) {
        console.error("Erro ao buscar gênero:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar gênero.",
        });
    }
}

async function getMovies(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const movies = await GenreService.getMovies(id);

        return res.status(200).json(movies);
    } catch (error) {
        console.error("Erro ao buscar filmes do gênero:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar filmes do gênero.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { name, description } = req.body ?? {};

    try {
        const createdGenre = await GenreService.create(name, description);

        return res.status(201).json(createdGenre);
    } catch (error) {
        console.error("Erro ao criar gênero:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao criar gênero.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { name, description, active } = req.body ?? {};

    try {
        const updatedGenre = await GenreService.update(id, { name, description, active });

        return res.status(200).json(updatedGenre);
    } catch (error) {
        console.error("Erro ao atualizar gênero:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar gênero.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        await GenreService.remove(id);

        return res.status(200).json({
            message: "Gênero removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover gênero:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao remover gênero.",
        });
    }
}

export default {
    getAll,
    search,
    getById,
    getMovies,
    create,
    update,
    remove,
}
