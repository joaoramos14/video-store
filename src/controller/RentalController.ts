import type { Request, Response } from "express";
import RentalService from "../services/RentalService.js";
import { ValidationError } from "../errors/ValidantionError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function getAll(req: Request, res: Response) {
    try {
        const rentals = await RentalService.getAll();

        return res.status(200).json(rentals);
    } catch (error) {
        console.error("Erro ao buscar locações:", error);

        return res.status(500).json({
            message: "Erro ao buscar locações.",
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
        const rentals = await RentalService.search(keyword);

        return res.status(200).json(rentals);
    } catch (error) {
        console.error("Erro ao pesquisar locações:", error);

        return res.status(500).json({
            message: "Erro ao pesquisar locações.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const rental = await RentalService.getById(id);

        return res.status(200).json({
            id: rental.getId(),
            customer_id: rental.getCustomerId(),
            movie_id: rental.getMovieId(),
            days: rental.getDays(),
            daily_price: rental.getDailyPrice(),
            total_price: rental.getTotalPrice(),
            late_fee: rental.getLateFee(),
            status: rental.getStatus(),
            reserved_until: rental.getReservedUntil(),
            rented_at: rental.getRentedAt(),
            due_at: rental.getDueAt(),
            returned_at: rental.getReturnedAt(),
        });
    } catch (error) {
        console.error("Erro ao buscar locação:", error);

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao buscar locação.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { customer_id, movie_id, days } = req.body ?? {};

    try {
        const createdRental = await RentalService.create({ customer_id, movie_id, days });

        return res.status(201).json(createdRental);
    } catch (error) {
        console.error("Erro ao criar locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao criar locação.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { days } = req.body ?? {};

    try {
        const updatedRental = await RentalService.update(id, { days });

        return res.status(200).json(updatedRental);
    } catch (error) {
        console.error("Erro ao atualizar locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar locação.",
        });
    }
}

async function pickUp(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const rental = await RentalService.pickUp(id);

        return res.status(200).json(rental);
    } catch (error) {
        console.error("Erro ao retirar locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao retirar locação.",
        });
    }
}

async function returnMovie(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const rental = await RentalService.returnMovie(id);

        return res.status(200).json(rental);
    } catch (error) {
        console.error("Erro ao devolver locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao devolver locação.",
        });
    }
}

async function cancel(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        const rental = await RentalService.cancel(id);

        return res.status(200).json(rental);
    } catch (error) {
        console.error("Erro ao cancelar locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao cancelar locação.",
        });
    }
}

async function expireReservations(req: Request, res: Response) {
    try {
        const count = await RentalService.expireLapsedReservations();

        return res.status(200).json({
            message: `${count} reserva(s) expirada(s).`,
        });
    } catch (error) {
        console.error("Erro ao expirar reservas:", error);

        return res.status(500).json({
            message: "Erro interno ao expirar reservas.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
        await RentalService.remove(id);

        return res.status(200).json({
            message: "Locação removida com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover locação:", error);

        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }

        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Erro interno ao remover locação.",
        });
    }
}

export default {
    getAll,
    search,
    getById,
    create,
    update,
    pickUp,
    returnMovie,
    cancel,
    expireReservations,
    remove,
};
