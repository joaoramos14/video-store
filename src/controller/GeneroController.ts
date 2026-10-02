import type { Request, Response } from "express";
import Genero from "../models/Genero.js";
import { isUuid } from "../utils/isUuid.js";

async function getAll(req: Request, res: Response) {
    try {
        const generos = await Genero.findAll();

        res.status(200).json(generos);
    } catch (error) {
        console.error("Erro ao buscar gêneros: ", error);

        res.status(500).json({
            message: "Erro ao buscar gêneros.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    try {
        const genero = await Genero.findById(id);

        if (!genero) {
            return res.status(404).json({
                message: "Gênero não encontrado."
            });
        }

        res.status(200).json(genero);
    } catch (error) {
        console.error("Erro ao buscar gênero: ", error);

        res.status(500).json({
            message: "Erro ao buscar gênero.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({
            message: "O campo 'nome' é obrigatório."
        });
    }

    try {
        const genero = await Genero.create(req.body);

        res.status(201).json(genero);
    } catch (error) {
        console.error("Erro ao criar gênero: ", error);

        res.status(500).json({
            message: "Erro ao criar gênero.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { nome } = req.body;

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    if (!nome) {
        return res.status(400).json({
            message: "O campo 'nome' é obrigatório."
        });
    }

    try {
        const genero = await Genero.update(id, req.body);

        if (!genero) {
            return res.status(404).json({
                message: "Gênero não encontrado."
            });
        }

        res.status(200).json(genero);
    } catch (error) {
        console.error("Erro ao atualizar gênero: ", error);

        res.status(500).json({
            message: "Erro ao atualizar gênero.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    try {
        const genero = await Genero.remove(id);

        if (!genero) {
            return res.status(404).json({
                message: "Gênero não encontrado."
            });
        }

        res.status(200).json({
            message: "Gênero removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover gênero: ", error);

        res.status(500).json({
            message: "Erro ao remover gênero.",
        });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
}