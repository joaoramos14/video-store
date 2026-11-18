import { beforeEach, describe, expect, it, vi } from "vitest";
import RentalService from "../services/RentalService.js";
import RentalRepository from "../repositories/RentalRepository.js";
import CustomerRepository from "../repositories/CustomerRepository.js";
import MovieRepository from "../repositories/MovieRepository.js";
import { Rental } from "../model/Rental.js";
import { Customer } from "../model/Customer.js";
import { Movie } from "../model/Movie.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

vi.mock("../repositories/RentalRepository.js");
vi.mock("../repositories/CustomerRepository.js");
vi.mock("../repositories/MovieRepository.js");

describe("RentalService - Testes Unitários", () => {

    const id = "5c1e9a7b-2d4f-4b6a-8c0e-1f3a5b7d9e21";
    const customerId = "3f8a2c1d-6b7e-4f90-a1b2-c3d4e5f60718";
    const movieId = "9b2f6d1e-5a7c-4c3e-8f10-2d4b6a8c0e12";
    const genreId = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";

    const DAY = 24 * 60 * 60 * 1000;

    const validData = {
        customer_id: customerId,
        movie_id: movieId,
        days: 3,
    };

    function makeCustomer() {
        return Customer.restore(customerId, "Maria da Silva", "maria@email.com", "52998224725", true);
    }

    function makeMovie(stock: number = 2) {
        return Movie.restore(movieId, genreId, "Matrix", 1999, 136, 6.5, stock, true);
    }

    function makeRental(status: "reserved" | "active" | "returned" | "cancelled" | "expired", reservedUntil: Date) {
        const rentedAt = status === "active" ? new Date(Date.now() - DAY) : undefined;
        const dueAt = status === "active" ? new Date(Date.now() + 2 * DAY) : undefined;

        return Rental.restore(id, customerId, movieId, 3, 6.5, 0, status, reservedUntil, rentedAt, dueAt);
    }

    function inOneDay() {
        return new Date(Date.now() + DAY);
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ---------- create ----------

    it("deve reservar um filme, copiar a diária e separar uma cópia do estoque", async () => {
        const movie = makeMovie(2);
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);
        vi.mocked(RentalRepository.findOpenByCustomerAndMovie).mockResolvedValue([]);
        vi.mocked(RentalRepository.create).mockResolvedValue({ id, status: "reserved" });

        const result = await RentalService.create(validData);

        const createdRental = vi.mocked(RentalRepository.create).mock.calls[0]![0];
        expect(createdRental.getDailyPrice()).toBe(6.5);
        expect(createdRental.getTotalPrice()).toBe(19.5);
        expect(createdRental.getStatus()).toBe("reserved");

        expect(movie.getStock()).toBe(1);
        expect(MovieRepository.update).toHaveBeenCalledWith(movie);
        expect(result).toEqual({ id, status: "reserved" });
    });

    it("não deve consultar o banco ao reservar com dados inválidos", async () => {
        await expect(RentalService.create({ ...validData, days: 31 }))
            .rejects.toThrow("A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.");

        expect(CustomerRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.findById).not.toHaveBeenCalled();
        expect(RentalRepository.create).not.toHaveBeenCalled();
    });

    it("não deve reservar para um cliente inexistente", async () => {
        vi.mocked(CustomerRepository.findById).mockRejectedValue(new NotFoundError("Cliente não encontrado."));

        await expect(RentalService.create(validData))
            .rejects.toThrow("O cliente informado não existe.");

        await expect(RentalService.create(validData))
            .rejects.toBeInstanceOf(ValidationError);

        expect(RentalRepository.create).not.toHaveBeenCalled();
    });

    it("deve repassar erros inesperados ao consultar o cliente", async () => {
        vi.mocked(CustomerRepository.findById).mockRejectedValue(new Error("Falha de conexão"));

        await expect(RentalService.create(validData))
            .rejects.toThrow("Falha de conexão");

        expect(RentalRepository.create).not.toHaveBeenCalled();
    });

    it("não deve reservar um filme inexistente", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(MovieRepository.findById).mockRejectedValue(new NotFoundError("Filme não encontrado."));

        await expect(RentalService.create(validData))
            .rejects.toThrow("O filme informado não existe.");

        expect(RentalRepository.create).not.toHaveBeenCalled();
    });

    it("deve repassar erros inesperados ao consultar o filme", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(MovieRepository.findById).mockRejectedValue(new Error("Falha de conexão"));

        await expect(RentalService.create(validData))
            .rejects.toThrow("Falha de conexão");

        expect(RentalRepository.create).not.toHaveBeenCalled();
    });

    it("não deve reservar um filme sem cópias no estoque", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie(0));
        vi.mocked(RentalRepository.findOpenByCustomerAndMovie).mockResolvedValue([]);

        await expect(RentalService.create(validData))
            .rejects.toThrow("Filme indisponível no estoque no momento.");

        expect(RentalRepository.create).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("não deve reservar quando o cliente já possui locação em aberto do mesmo filme", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie());
        vi.mocked(RentalRepository.findOpenByCustomerAndMovie).mockResolvedValue([{ id, status: "active" }]);

        await expect(RentalService.create(validData))
            .rejects.toThrow("O cliente já tem uma reserva ou um aluguel em andamento deste filme.");

        expect(RentalRepository.findOpenByCustomerAndMovie).toHaveBeenCalledWith(customerId, movieId);
        expect(RentalRepository.create).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    // ---------- update ----------

    it("deve alterar os dias de uma locação reservada", async () => {
        const rental = makeRental("reserved", inOneDay());
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(RentalRepository.update).mockResolvedValue({ id, days: 5 });

        const result = await RentalService.update(id, { days: 5 });

        expect(rental.getDays()).toBe(5);
        expect(rental.getTotalPrice()).toBe(32.5);
        expect(RentalRepository.update).toHaveBeenCalledWith(rental);
        expect(result).toEqual({ id, days: 5 });
    });

    it("não deve alterar nada quando nenhum campo é informado", async () => {
        const rental = makeRental("reserved", inOneDay());
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);

        await RentalService.update(id, {});

        expect(rental.getDays()).toBe(3);
        expect(RentalRepository.update).toHaveBeenCalledWith(rental);
    });

    it("não deve alterar os dias de uma locação ativa", async () => {
        vi.mocked(RentalRepository.findById).mockResolvedValue(makeRental("active", inOneDay()));

        await expect(RentalService.update(id, { days: 5 }))
            .rejects.toThrow("Só é possível alterar os dias de uma reserva que ainda não foi retirada.");

        expect(RentalRepository.update).not.toHaveBeenCalled();
    });

    // ---------- pickUp ----------

    it("deve retirar uma locação reservada dentro do prazo", async () => {
        const rental = makeRental("reserved", inOneDay());
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(RentalRepository.update).mockResolvedValue({ id, status: "active" });

        const result = await RentalService.pickUp(id);

        expect(rental.getStatus()).toBe("active");
        expect(rental.getDueAt()).toBeInstanceOf(Date);
        expect(MovieRepository.update).not.toHaveBeenCalled();
        expect(result).toEqual({ id, status: "active" });
    });

    it("deve recusar a retirada fora do prazo sem expirar a reserva nem mexer no estoque", async () => {
        const rental = makeRental("reserved", new Date(Date.now() - 1000));
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);

        await expect(RentalService.pickUp(id))
            .rejects.toThrow("O prazo de retirada desta reserva terminou.");

        expect(rental.getStatus()).toBe("reserved");
        expect(RentalRepository.update).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("não deve retirar uma locação que não existe", async () => {
        vi.mocked(RentalRepository.findById).mockRejectedValue(new NotFoundError("Locação não encontrada."));

        await expect(RentalService.pickUp(id))
            .rejects.toBeInstanceOf(NotFoundError);

        expect(RentalRepository.update).not.toHaveBeenCalled();
    });

    // ---------- returnMovie ----------

    it("deve devolver uma locação ativa e devolver a cópia ao estoque", async () => {
        const rental = makeRental("active", inOneDay());
        const movie = makeMovie(1);
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(RentalRepository.update).mockResolvedValue({ id, status: "returned" });
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);

        const result = await RentalService.returnMovie(id);

        expect(rental.getStatus()).toBe("returned");
        expect(rental.getLateFee()).toBe(0);
        expect(movie.getStock()).toBe(2);
        expect(MovieRepository.update).toHaveBeenCalledWith(movie);
        expect(result).toEqual({ id, status: "returned" });
    });

    it("não deve devolver uma locação já devolvida", async () => {
        vi.mocked(RentalRepository.findById).mockResolvedValue(makeRental("returned", inOneDay()));

        await expect(RentalService.returnMovie(id))
            .rejects.toThrow("Este filme já foi devolvido.");

        expect(RentalRepository.update).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    // ---------- cancel ----------

    it("deve cancelar uma locação reservada e devolver a cópia ao estoque", async () => {
        const rental = makeRental("reserved", inOneDay());
        const movie = makeMovie(0);
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(RentalRepository.update).mockResolvedValue({ id, status: "cancelled" });
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);

        const result = await RentalService.cancel(id);

        expect(rental.getStatus()).toBe("cancelled");
        expect(movie.getStock()).toBe(1);
        expect(result).toEqual({ id, status: "cancelled" });
    });

    it("não deve cancelar uma locação depois da retirada", async () => {
        vi.mocked(RentalRepository.findById).mockResolvedValue(makeRental("active", inOneDay()));

        await expect(RentalService.cancel(id))
            .rejects.toThrow("Só é possível cancelar uma reserva que ainda não foi retirada.");

        expect(RentalRepository.update).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    // ---------- expireLapsedReservations ----------

    it("deve expirar as reservas vencidas e devolver as cópias ao estoque", async () => {
        const rental = makeRental("reserved", new Date(Date.now() - 1000));
        const movie = makeMovie(0);
        vi.mocked(RentalRepository.findLapsedReservations).mockResolvedValue([{ id }]);
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);

        const count = await RentalService.expireLapsedReservations();

        expect(count).toBe(1);
        expect(rental.getStatus()).toBe("expired");
        expect(RentalRepository.update).toHaveBeenCalledWith(rental);
        expect(movie.getStock()).toBe(1);
        expect(MovieRepository.update).toHaveBeenCalledWith(movie);
    });

    it("não deve alterar nada quando não há reservas vencidas", async () => {
        vi.mocked(RentalRepository.findLapsedReservations).mockResolvedValue([]);

        const count = await RentalService.expireLapsedReservations();

        expect(count).toBe(0);
        expect(RentalRepository.update).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    // ---------- remove ----------

    it("deve remover uma locação finalizada", async () => {
        vi.mocked(RentalRepository.findById).mockResolvedValue(makeRental("returned", inOneDay()));
        vi.mocked(RentalRepository.remove).mockResolvedValue({ id });

        await RentalService.remove(id);

        expect(RentalRepository.remove).toHaveBeenCalledWith(id);
    });

    it("não deve remover uma locação em aberto", async () => {
        vi.mocked(RentalRepository.findById).mockResolvedValue(makeRental("reserved", inOneDay()));

        await expect(RentalService.remove(id))
            .rejects.toThrow("Não é possível remover uma locação em aberto. Cancele ou devolva antes.");

        expect(RentalRepository.remove).not.toHaveBeenCalled();
    });

    // ---------- consultas ----------

    it("deve listar, consultar e pesquisar locações pelo repository", async () => {
        const rental = makeRental("reserved", inOneDay());
        vi.mocked(RentalRepository.findAll).mockResolvedValue([{ id }]);
        vi.mocked(RentalRepository.findById).mockResolvedValue(rental);
        vi.mocked(RentalRepository.searchByKeyword).mockResolvedValue([{ id, status: "active" }]);

        expect(await RentalService.getAll()).toEqual([{ id }]);
        expect(await RentalService.getById(id)).toBe(rental);
        expect(await RentalService.search("late")).toEqual([{ id, status: "active" }]);
        expect(RentalRepository.searchByKeyword).toHaveBeenCalledWith("late");
    });
});
