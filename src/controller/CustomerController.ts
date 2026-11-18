import type { Request, Response } from "express";
import CustomerService from "../services/CustomerService.js";
import { ValidationError } from "../errors/ValidantionError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function getAll(req: Request, res: Response) {
    try {
        const customers = await CustomerService.getAll();

        return res.status(200).json(customers);
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);

        return res.status(500).json({
            message: "Erro ao buscar clientes.",
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
        const customers = await CustomerService.search(keyword);

        return res.status(200).json(customers);
    } catch (error) {
        console.error("Erro ao pesquisar clientes:", error);

        return res.status(500).json({
            message: "Erro ao pesquisar clientes.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const customer = await CustomerService.getById(id);

        return res.status(200).json({
            id: customer.getId(),
            name: customer.getName(),
            email: customer.getEmail(),
            cpf: customer.getCpf(),
            phone: customer.getPhone(),
            active: customer.isActive(),
        });
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar cliente.",
        });
    }
}

async function getRentals(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const rentals = await CustomerService.getRentals(id);

        return res.status(200).json(rentals);
    } catch (error) {
        console.error("Erro ao buscar locações do cliente:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar locações do cliente.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { name, email, cpf, phone } = req.body ?? {};

    try {
        const createdCustomer = await CustomerService.create(name, email, cpf, phone);

        return res.status(201).json(createdCustomer);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao criar cliente.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { name, email, cpf, phone, active } = req.body ?? {};

    try {
        const updatedCustomer = await CustomerService.update(id, { name, email, cpf, phone, active });

        return res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar cliente.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        await CustomerService.remove(id);

        return res.status(200).json({
            message: "Cliente removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover cliente:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao remover cliente.",
        });
    }
}

export default {
    getAll,
    search,
    getById,
    getRentals,
    create,
    update,
    remove,
}
