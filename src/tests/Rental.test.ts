import { describe, it, expect } from "vitest";
import { Rental } from "../model/Rental.js";

describe("Rental - Testes Unitários", () => {

    const id = "5c1e9a7b-2d4f-4b6a-8c0e-1f3a5b7d9e21";
    const customerId = "3f8a2c1d-6b7e-4f90-a1b2-c3d4e5f60718";
    const movieId = "9b2f6d1e-5a7c-4c3e-8f10-2d4b6a8c0e12";

    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    const now = new Date("2026-11-20T10:00:00.000Z");

    function makeReserved() {
        return Rental.restore(
            id,
            customerId,
            movieId,
            3,
            6.5,
            0,
            "reserved",
            new Date(now.getTime() + DAY),
        );
    }

    function makeActive() {
        return Rental.restore(
            id,
            customerId,
            movieId,
            3,
            6.5,
            0,
            "active",
            new Date(now.getTime() - 2 * DAY),
            new Date(now.getTime() - 3 * DAY),
            now,
        );
    }

    // Locação com dados válidos
    it("deve criar uma locação reservada com total calculado", () => {

        const rental = new Rental(customerId, movieId, 3, 6.5, now);

        expect(rental.getCustomerId()).toBe(customerId);
        expect(rental.getMovieId()).toBe(movieId);
        expect(rental.getDays()).toBe(3);
        expect(rental.getDailyPrice()).toBe(6.5);
        expect(rental.getTotalPrice()).toBe(19.5);
        expect(rental.getLateFee()).toBe(0);
        expect(rental.getStatus()).toBe("reserved");
        expect(rental.getReservedUntil()).toEqual(new Date(now.getTime() + DAY));
        expect(rental.getRentedAt()).toBeUndefined();
        expect(rental.getDueAt()).toBeUndefined();
        expect(rental.getReturnedAt()).toBeUndefined();
        expect(rental.getId()).toBeUndefined();
        expect(rental.isOpen()).toBe(true);
    });

    it("deve arredondar o total para duas casas decimais", () => {

        const rental = new Rental(customerId, movieId, 3, 3.33);

        expect(rental.getTotalPrice()).toBe(9.99);
    });

    it("deve restaurar uma locação com todos os campos", () => {

        const rental = Rental.restore(
            id,
            customerId,
            movieId,
            2,
            5,
            7.5,
            "returned",
            now,
            now,
            now,
            now,
        );

        expect(rental.getId()).toBe(id);
        expect(rental.getTotalPrice()).toBe(10);
        expect(rental.getLateFee()).toBe(7.5);
        expect(rental.getStatus()).toBe("returned");
        expect(rental.getRentedAt()).toEqual(now);
        expect(rental.getDueAt()).toEqual(now);
        expect(rental.getReturnedAt()).toEqual(now);
        expect(rental.isOpen()).toBe(false);
    });

    // Cliente e filme
    it("não deve permitir criar uma locação sem cliente", () => {

        expect(() => {
            new Rental("", movieId, 3);
        }).toThrow("O cliente da locação é obrigatório.");
    });

    it("não deve permitir criar uma locação com cliente que não é UUID", () => {

        expect(() => {
            new Rental("abc", movieId, 3);
        }).toThrow("O identificador do cliente deve ser um UUID válido.");
    });

    it("não deve permitir criar uma locação sem filme", () => {

        expect(() => {
            new Rental(customerId, undefined as unknown as string, 3);
        }).toThrow("O filme da locação é obrigatório.");
    });

    it("não deve permitir criar uma locação com filme que não é UUID", () => {

        expect(() => {
            new Rental(customerId, "abc", 3);
        }).toThrow("O identificador do filme deve ser um UUID válido.");
    });

    // Dias
    it("não deve permitir criar uma locação com menos de 1 dia", () => {

        expect(() => {
            new Rental(customerId, movieId, 0);
        }).toThrow("A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.");
    });

    it("não deve permitir criar uma locação com mais de 30 dias", () => {

        expect(() => {
            new Rental(customerId, movieId, 31);
        }).toThrow("A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.");
    });

    it("não deve permitir criar uma locação com dias não inteiros", () => {

        expect(() => {
            new Rental(customerId, movieId, 2.5);
        }).toThrow("A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.");
    });

    it("deve aceitar uma locação de 30 dias", () => {

        const rental = new Rental(customerId, movieId, 30, 6.5);

        expect(rental.getTotalPrice()).toBe(195);
    });

    it("deve alterar os dias de uma locação reservada e recalcular o total", () => {

        const rental = makeReserved();

        rental.changeDays(5);

        expect(rental.getDays()).toBe(5);
        expect(rental.getTotalPrice()).toBe(32.5);
    });

    it("não deve permitir alterar os dias de uma locação ativa", () => {

        const rental = makeActive();

        expect(() => {
            rental.changeDays(5);
        }).toThrow("Só é possível alterar os dias de uma reserva que ainda não foi retirada.");
    });

    // Diária
    it("não deve permitir diária negativa", () => {

        expect(() => {
            new Rental(customerId, movieId, 3, -1);
        }).toThrow("O valor da diária da locação deve ser um número maior ou igual a zero.");
    });

    it("não deve permitir alterar a diária de uma locação ativa", () => {

        const rental = makeActive();

        expect(() => {
            rental.changeDailyPrice(10);
        }).toThrow("Só é possível alterar a diária de uma reserva que ainda não foi retirada.");
    });

    // Retirada
    it("deve retirar uma locação reservada dentro do prazo", () => {

        const rental = makeReserved();

        rental.pickUp(now);

        expect(rental.getStatus()).toBe("active");
        expect(rental.getRentedAt()).toEqual(now);
        expect(rental.getDueAt()).toEqual(new Date(now.getTime() + 3 * DAY));
    });

    it("deve recusar a retirada fora do prazo sem expirar a reserva", () => {

        const rental = makeReserved();
        const deadline = new Date(now.getTime() + DAY);

        expect(rental.isPickupOpen(now)).toBe(true);
        expect(rental.isPickupOpen(deadline)).toBe(false);

        expect(() => {
            rental.pickUp(deadline);
        }).toThrow("O prazo de retirada desta reserva terminou.");

        expect(rental.getStatus()).toBe("reserved");
    });

    it("não deve permitir retirar um filme que já foi retirado", () => {

        const rental = makeActive();

        expect(() => {
            rental.pickUp(now);
        }).toThrow("Este filme já foi retirado.");
    });

    it("não deve permitir retirar uma reserva cancelada", () => {

        const rental = makeReserved();
        rental.cancel();

        expect(() => {
            rental.pickUp(now);
        }).toThrow("Esta reserva foi cancelada.");
    });

    it("não deve permitir retirar uma reserva expirada", () => {

        const rental = makeReserved();
        rental.expire();

        expect(() => {
            rental.pickUp(now);
        }).toThrow("Esta reserva expirou.");
    });

    // Devolução e multa
    it("deve devolver uma locação ativa no prazo sem multa", () => {

        const rental = makeActive();

        rental.returnMovie(now);

        expect(rental.getStatus()).toBe("returned");
        expect(rental.getReturnedAt()).toEqual(now);
        expect(rental.getLateFee()).toBe(0);
    });

    it("deve cobrar multa de 1,5 × a diária por dia de atraso", () => {

        const rental = makeActive();

        rental.returnMovie(new Date(now.getTime() + 2 * DAY));

        expect(rental.getLateFee()).toBe(19.5);
    });

    it("deve cobrar um dia inteiro de multa por fração de dia de atraso", () => {

        const rental = makeActive();

        expect(rental.calculateLateFee(new Date(now.getTime() + HOUR))).toBe(9.75);
        expect(rental.calculateLateFee(new Date(now.getTime() + DAY + HOUR))).toBe(19.5);
    });

    it("não deve cobrar multa de uma locação que ainda não foi retirada", () => {

        const rental = makeReserved();

        expect(rental.calculateLateFee(new Date(now.getTime() + 10 * DAY))).toBe(0);
    });

    it("não deve permitir devolver uma locação duas vezes", () => {

        const rental = makeActive();

        rental.returnMovie(now);

        expect(() => {
            rental.returnMovie(now);
        }).toThrow("Este filme já foi devolvido.");
    });

    it("não deve permitir devolver um filme que ainda não foi retirado", () => {

        const rental = makeReserved();

        expect(() => {
            rental.returnMovie(now);
        }).toThrow("Este filme ainda não foi retirado. Confirme a retirada antes de registrar a devolução.");
    });

    it("não deve permitir devolver um aluguel encerrado sem retirada", () => {

        const rental = makeReserved();
        rental.cancel();

        expect(() => {
            rental.returnMovie(now);
        }).toThrow("Este aluguel foi encerrado sem retirada.");
    });

    // Cancelamento e expiração
    it("deve cancelar uma locação reservada", () => {

        const rental = makeReserved();

        rental.cancel();

        expect(rental.getStatus()).toBe("cancelled");
        expect(rental.isOpen()).toBe(false);
    });

    it("não deve permitir cancelar uma locação depois da retirada", () => {

        const rental = makeActive();

        expect(() => {
            rental.cancel();
        }).toThrow("Só é possível cancelar uma reserva que ainda não foi retirada.");
    });

    it("deve expirar uma locação reservada", () => {

        const rental = makeReserved();

        rental.expire();

        expect(rental.getStatus()).toBe("expired");
        expect(rental.isOpen()).toBe(false);
    });

    it("não deve permitir expirar uma locação que não está reservada", () => {

        const rental = makeActive();

        expect(() => {
            rental.expire();
        }).toThrow("Só é possível expirar uma reserva que ainda não foi retirada.");
    });
});
