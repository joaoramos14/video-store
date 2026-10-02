import type { Request, Response } from "express";
import Filme from "../models/Filme.js";
import Genero from "../models/Genero.js";
import { isUuid } from "../utils/isUuid.js";

function validarFilme(body: any): string | null {
    const { titulo, descricao, ano_lancamento, diretor, preco_locacao, disponivel, ativo } = body;

    if (typeof titulo !== "string" || titulo.trim() === "") {
        return "O campo 'titulo' deve ser um texto não vazio.";
    }
    if (descricao !== undefined && typeof descricao !== "string") {
        return "O campo 'descricao' deve ser um texto.";
    }
    if (diretor !== undefined && typeof diretor !== "string") {
        return "O campo 'diretor' deve ser um texto.";
    }
    if (ano_lancamento !== undefined && (!Number.isInteger(ano_lancamento) || ano_lancamento < 1888)) {
        return "O campo 'ano_lancamento' deve ser um número inteiro válido.";
    }
    if (preco_locacao !== undefined && (typeof preco_locacao !== "number" || preco_locacao < 0)) {
        return "O campo 'preco_locacao' deve ser um número maior ou igual a zero.";
    }
    if (disponivel !== undefined && typeof disponivel !== "boolean") {
        return "O campo 'disponivel' deve ser true ou false.";
    }
    if (ativo !== undefined && typeof ativo !== "boolean") {
        return "O campo 'ativo' deve ser true ou false.";
    }
    return null;
}

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

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    try {
        const filme = await Filme.findById(id);

        if (!filme) {
            return res.status(404).json({
                message: "Filme não encontrado."
            });
        }

        res.status(200).json(filme);
    } catch (error) {
        console.error("Erro ao buscar filme: ", error);

        res.status(500).json({
            message: "Erro ao buscar filme.",
        });
    }
}

// GET /generos/:id/filmes
async function getByGenero(req: Request<{ id: string }>, res: Response) {
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

    if (!isUuid(genero_id)) {
        return res.status(400).json({
            message: "O campo 'genero_id' deve ser um UUID válido."
        });
    }

        const erro = validarFilme(req.body);
    if (erro) {
        return res.status(400).json({ message: erro });
    }

    const { descricao, ano_lancamento, diretor, preco_locacao, disponivel, ativo } = req.body;
    const dados = { genero_id, titulo, descricao, ano_lancamento, diretor, preco_locacao, disponivel, ativo };

    try {
        const genero = await Genero.findById(genero_id);

        if (!genero) {
            return res.status(400).json({
                message: "Gênero informado não existe."
            });
        }

        const filme = await Filme.create(dados);

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

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
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

    if (!isUuid(genero_id)) {
        return res.status(400).json({
            message: "O campo 'genero_id' deve ser um UUID válido."
        });
    }

        const erro = validarFilme(req.body);
    if (erro) {
        return res.status(400).json({ message: erro });
    }

    const { descricao, ano_lancamento, diretor, preco_locacao, disponivel, ativo } = req.body;
    const dados = { genero_id, titulo, descricao, ano_lancamento, diretor, preco_locacao, disponivel, ativo };

    try {
        const genero = await Genero.findById(genero_id);

        if (!genero) {
            return res.status(400).json({
                message: "Gênero informado não existe."
            });
        }

        const filme = await Filme.update(id, dados);

        if (!filme) {
            return res.status(404).json({
                message: "Filme não encontrado."
            });
        }

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

    if (!isUuid(id)) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    try {
        const filme = await Filme.remove(id);

        if (!filme) {
            return res.status(404).json({
                message: "Filme não encontrado."
            });
        }

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
