import type { Request, Response } from "express";
import Genero from "../models/genero.js";

async function getAll(req: Request, res: Response) {
    try {
        const generos = await Genero.findAll();
        return res.status(200).json(generos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar gêneros." });
    }
}

async function getById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ message: "ID do gênero não informado." });
        }

        const genero = await Genero.findById(id);

        if (!genero) {
            return res.status(404).json({ message: "Gênero não encontrado." });
        }

        return res.status(200).json(genero);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar o gênero." });
    }
}

async function create(req: Request, res: Response) {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        const novoGenero = await Genero.create(req.body);
        return res.status(201).json(novoGenero);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao cadastrar o gênero." });
    }
}

async function update(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ message: "ID do gênero não informado." });
        }

        const generoAtualizado = await Genero.update(id, req.body);

        if (!generoAtualizado) {
            return res.status(404).json({ message: "Gênero não encontrado." });
        }

        return res.status(200).json(generoAtualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao atualizar o gênero." });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ message: "ID do gênero não informado." });
        }

        const generoRemovido = await Genero.remove(id);

        if (!generoRemovido) {
            return res.status(404).json({ message: "Gênero não encontrado." });
        }

        return res.status(200).json({ message: "Gênero removido com sucesso." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao remover o gênero." });
    }
}

export default { getAll, getById, create, update, remove };