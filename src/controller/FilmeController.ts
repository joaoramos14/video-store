import type { Request, Response } from "express";
import Filme from "../models/Filme.js";
import Genero from "../models/Genero.js";

async function getAll(req: Request, res: Response) {
    try {
        const filmes = await Filme.findAll();

        res.status(200).json(filmes);
    } catch (error) {
        console.error("Erro ao buscar filmes: ", error);

        res.status(500).json({
            message: "Erro ao buscar filmes.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID do filme não informado."
        });
    }

    try {
        const filme = await Filme.findById(id);

        res.status(200).json(filme);
    } catch (error) {
        console.error("Erro ao buscar filme: ", error);

        res.status(404).json({
            message: "Filme não encontrado.",
        });
    }
}

// GET /generos/:id/filmes
async function getByGenero(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID do gênero não informado."
        });
    }

    try {
        const genero = await Genero.findById(id);

        if (!genero) {
            return res.status(404).json({
                message: "Gênero não encontrado."
            });
        }

        const filmes = await Filme.findByGeneroId(id);

        res.status(200).json(filmes);
    } catch (error) {
        console.error("Erro ao buscar filmes do gênero: ", error);

        res.status(500).json({
            message: "Erro ao buscar filmes do gênero.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { genero_id, titulo } = req.body;

    if (!titulo) {
        return res.status(400).json({
            message: "O campo 'titulo' é obrigatório."
        });
    }

    if (!genero_id) {
        return res.status(400).json({
            message: "O campo 'genero_id' é obrigatório."
        });
    }

    try {
        const genero = await Genero.findById(genero_id);

        if (!genero) {
            return res.status(400).json({
                message: "Gênero informado não existe."
            });
        }

        const filme = await Filme.create(req.body);

        res.status(201).json(filme);
    } catch (error) {
        console.error("Erro ao criar filme: ", error);

        res.status(500).json({
            message: "Erro ao criar filme.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { genero_id, titulo } = req.body;

    if (!id) {
        return res.status(400).json({
            message: "ID do filme não informado."
        });
    }

    if (!titulo) {
        return res.status(400).json({
            message: "O campo 'titulo' é obrigatório."
        });
    }

    if (!genero_id) {
        return res.status(400).json({
            message: "O campo 'genero_id' é obrigatório."
        });
    }

    try {
        const genero = await Genero.findById(genero_id);

        if (!genero) {
            return res.status(400).json({
                message: "Gênero informado não existe."
            });
        }

        const filme = await Filme.update(id, req.body);

        res.status(200).json(filme);
    } catch (error) {
        console.error("Erro ao atualizar filme: ", error);

        res.status(500).json({
            message: "Erro ao atualizar filme.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID do filme não informado."
        });
    }

    try {
        await Filme.remove(id);

        res.status(200).json({
            message: "Filme removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover filme: ", error);

        res.status(500).json({
            message: "Erro ao remover filme.",
        });
    }
}

export default {
    getAll,
    getById,
    getByGenero,
    create,
    update,
    remove
}
