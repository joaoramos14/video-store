import { Rental } from "../model/Rental.js";
import type { Movie } from "../model/Movie.js";
import RentalRepository from "../repositories/RentalRepository.js";
import CustomerRepository from "../repositories/CustomerRepository.js";
import MovieRepository from "../repositories/MovieRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

interface CreateRentalData {
    customer_id: string;
    movie_id: string;
    days: number;
}

interface UpdateRentalData {
    days?: number;
}

// Regra que depende do banco: o cliente precisa existir.
async function ensureCustomerExists(customerId: string): Promise<void> {
    try {
        await CustomerRepository.findById(customerId);
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw new ValidationError("O cliente informado não existe.");
        }

        throw error;
    }
}

// Regra que depende do banco: o filme precisa existir.
async function findMovie(movieId: string): Promise<Movie> {
    try {
        return await MovieRepository.findById(movieId);
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw new ValidationError("O filme informado não existe.");
        }

        throw error;
    }
}

// Estoque: a reserva separa uma cópia (-1). Cancelar, expirar ou devolver devolve essa cópia (+1).
// Retirar não mexe no estoque, porque a cópia já estava separada.
async function returnCopyToStock(movieId: string): Promise<void> {
    const movie = await MovieRepository.findById(movieId);

    movie.changeStock(movie.getStock() + 1);

    await MovieRepository.update(movie);
}

async function getAll() {
    return RentalRepository.findAll();
}

async function getById(id: string) {
    return RentalRepository.findById(id);
}

async function search(keyword: string) {
    return RentalRepository.searchByKeyword(keyword);
}

async function create(data: CreateRentalData) {
    const rental = new Rental(data.customer_id, data.movie_id, data.days);

    await ensureCustomerExists(rental.getCustomerId());

    const movie = await findMovie(rental.getMovieId());

    const openRentals = await RentalRepository.findOpenByCustomerAndMovie(
        rental.getCustomerId(),
        rental.getMovieId(),
    );

    if (openRentals.length > 0) {
        throw new ValidationError(
            "O cliente já tem uma reserva ou um aluguel em andamento deste filme.",
        );
    }

    if (movie.getStock() <= 0) {
        throw new ValidationError("Filme indisponível no estoque no momento.");
    }

    // A diária é copiada do filme no momento da reserva.
    rental.changeDailyPrice(movie.getDailyPrice());

    const createdRental = await RentalRepository.create(rental);

    // A reserva separa uma cópia do estoque.
    movie.changeStock(movie.getStock() - 1);
    await MovieRepository.update(movie);

    return createdRental;
}

async function update(id: string, data: UpdateRentalData) {
    const rental = await RentalRepository.findById(id);

    if (data.days !== undefined) {
        rental.changeDays(data.days);
    }

    return RentalRepository.update(rental);
}

// Confirma a retirada: é aqui que o prazo de devolução começa a contar.
async function pickUp(id: string) {
    const rental = await RentalRepository.findById(id);

    rental.pickUp();

    return RentalRepository.update(rental);
}

async function returnMovie(id: string) {
    const rental = await RentalRepository.findById(id);

    rental.returnMovie();

    const updatedRental = await RentalRepository.update(rental);

    await returnCopyToStock(rental.getMovieId());

    return updatedRental;
}

async function cancel(id: string) {
    const rental = await RentalRepository.findById(id);

    rental.cancel();

    const updatedRental = await RentalRepository.update(rental);

    await returnCopyToStock(rental.getMovieId());

    return updatedRental;
}

// Expira as reservas que passaram do prazo de retirada e devolve as cópias ao estoque.
// Retorna quantas expirou.
async function expireLapsedReservations() {
    const lapsedRentals = await RentalRepository.findLapsedReservations();

    for (const data of lapsedRentals) {
        const rental = await RentalRepository.findById(data.id);

        rental.expire();
        await RentalRepository.update(rental);
        await returnCopyToStock(rental.getMovieId());
    }

    return lapsedRentals.length;
}

async function remove(id: string) {
    const rental = await RentalRepository.findById(id);

    if (rental.isOpen()) {
        throw new ValidationError(
            "Não é possível remover uma locação em aberto. Cancele ou devolva antes.",
        );
    }

    return RentalRepository.remove(id);
}

export default {
    getAll,
    getById,
    search,
    create,
    update,
    pickUp,
    returnMovie,
    cancel,
    expireLapsedReservations,
    remove,
};
