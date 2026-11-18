import { randomInt, randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import supabase from "../config/supabase.js";

describe("Rental - Testes de integração", () => {

    const testRentalIds: string[] = [];
    const testCustomerIds: string[] = [];
    const testMovieIds: string[] = [];
    let genreId: string;

    function makeCpf() {
        const digits: number[] = Array.from({ length: 9 }, () => randomInt(0, 10));

        for (let length = 9; length <= 10; length++) {
            let sum = 0;
            for (let i = 0; i < length; i++) {
                sum += digits[i]! * (length + 1 - i);
            }
            digits.push(((sum * 10) % 11) % 10);
        }

        return digits.join("");
    }

    async function createCustomer() {
        const { data, error } = await supabase
            .from("customers")
            .insert({
                name: "Cliente teste integração de locações",
                email: `teste.${randomUUID()}@email.com`,
                cpf: makeCpf(),
            })
            .select()
            .single();
        if (error) {
            throw new Error(`Falha ao criar cliente do teste: ${error.message}`);
        }
        testCustomerIds.push(data.id);
        return data.id as string;
    }

    async function createMovie(stock: number = 2) {
        const { data, error } = await supabase
            .from("movies")
            .insert({
                genre_id: genreId,
                title: `Teste integração locações ${randomUUID()}`,
                year: 1999,
                duration: 120,
                stock,
                daily_price: 6.5,
            })
            .select()
            .single();
        if (error) {
            throw new Error(`Falha ao criar filme do teste: ${error.message}`);
        }
        testMovieIds.push(data.id);
        return data.id as string;
    }

    async function createRental(days: number = 3) {
        const customerId = await createCustomer();
        const movieId = await createMovie();

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: movieId, days });
        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        testRentalIds.push(response.body.id);

        return {
            id: response.body.id as string,
            customerId,
            movieId,
        };
    }

    async function expireReservationDeadline(rentalId: string) {
        const { error } = await supabase
            .from("rentals")
            .update({ reserved_until: new Date(Date.now() - 60 * 1000).toISOString() })
            .eq("id", rentalId);
        if (error) {
            throw new Error(`Falha ao vencer a reserva do teste: ${error.message}`);
        }
    }

    async function getMovieStock(movieId: string) {
        const response = await request(app).get(`/movies/${movieId}`);
        expect(response.status).toBe(200);
        return response.body.stock as number;
    }

    beforeAll(async () => {
        const { data, error } = await supabase
            .from("genres")
            .insert({ name: `Teste integração locações ${randomUUID()}` })
            .select()
            .single();
        if (error) {
            throw new Error(`Falha ao criar gênero do teste: ${error.message}`);
        }
        genreId = data.id;
    }, 20_000);

    afterEach(async () => {
        const rentalIds = testRentalIds.splice(0);
        const customerIds = testCustomerIds.splice(0);
        const movieIds = testMovieIds.splice(0);

        if (rentalIds.length > 0) {
            const { error } = await supabase.from("rentals").delete().in("id", rentalIds);
            if (error) {
                throw new Error(`Falha ao limpar locações do teste: ${error.message}`);
            }
        }

        if (customerIds.length > 0) {
            const { error } = await supabase.from("customers").delete().in("id", customerIds);
            if (error) {
                throw new Error(`Falha ao limpar clientes do teste: ${error.message}`);
            }
        }

        if (movieIds.length > 0) {
            const { error } = await supabase.from("movies").delete().in("id", movieIds);
            if (error) {
                throw new Error(`Falha ao limpar filmes do teste: ${error.message}`);
            }
        }
    }, 20_000);

    afterAll(async () => {
        const { error } = await supabase.from("genres").delete().eq("id", genreId);
        if (error) {
            throw new Error(`Falha ao limpar gênero do teste: ${error.message}`);
        }
    }, 20_000);

    // ---------- criar ----------

    it("deve reservar um filme e separar uma cópia do estoque", async () => {
        const customerId = await createCustomer();
        const movieId = await createMovie(2);

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: movieId, days: 3 });
        testRentalIds.push(response.body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            customer_id: customerId,
            movie_id: movieId,
            days: 3,
            daily_price: 6.5,
            total_price: 19.5,
            late_fee: 0,
            status: "reserved",
            rented_at: null,
            due_at: null,
            returned_at: null,
        });
        expect(response.body.reserved_until).toEqual(expect.any(String));
        expect(await getMovieStock(movieId)).toBe(1);
    });

    it("não deve reservar sem corpo na requisição", async () => {
        const response = await request(app).post("/rentals");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O cliente da locação é obrigatório.");
    });

    it("não deve reservar com quantidade de dias inválida", async () => {
        const customerId = await createCustomer();
        const movieId = await createMovie();

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: movieId, days: 31 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.",
        );
    });

    it("não deve reservar para um cliente inexistente", async () => {
        const movieId = await createMovie();

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: randomUUID(), movie_id: movieId, days: 3 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O cliente informado não existe.");
    });

    it("não deve reservar um filme inexistente", async () => {
        const customerId = await createCustomer();

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: randomUUID(), days: 3 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O filme informado não existe.");
    });

    it("não deve reservar um filme sem cópias no estoque", async () => {
        const customerId = await createCustomer();
        const movieId = await createMovie(0);

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: movieId, days: 3 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Filme indisponível no estoque no momento.");
    });

    it("não deve reservar o mesmo filme duas vezes para o mesmo cliente", async () => {
        const { customerId, movieId } = await createRental();

        const response = await request(app)
            .post("/rentals")
            .send({ customer_id: customerId, movie_id: movieId, days: 2 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "O cliente já tem uma reserva ou um aluguel em andamento deste filme.",
        );
    });

    // ---------- consultar ----------

    it("deve listar as locações inclusive a locação criada", async () => {
        const { id } = await createRental();

        const response = await request(app).get("/rentals");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ id })]),
        );
    });

    it("deve consultar uma locação existente por ID", async () => {
        const { id, customerId, movieId } = await createRental(2);

        const response = await request(app).get(`/rentals/${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            customer_id: customerId,
            movie_id: movieId,
            days: 2,
            daily_price: 6.5,
            total_price: 13,
            status: "reserved",
        });
    });

    it("deve retornar 404 ao consultar uma locação que não existe", async () => {
        const response = await request(app).get(`/rentals/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Locação não encontrada.");
    });

    it("deve buscar locações por status", async () => {
        const { id } = await createRental();

        const response = await request(app)
            .get("/rentals/search")
            .query({ keyword: "reserved" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ id, status: "reserved" })]),
        );
    });

    it("deve buscar como atrasadas as locações retiradas com o prazo de devolução vencido", async () => {
        const { id } = await createRental();
        await request(app).post(`/rentals/${id}/pickup`);

        const { error } = await supabase
            .from("rentals")
            .update({ due_at: new Date(Date.now() - 60 * 1000).toISOString() })
            .eq("id", id);
        if (error) {
            throw new Error(`Falha ao vencer o prazo de devolução do teste: ${error.message}`);
        }

        const late = await request(app).get("/rentals/search").query({ keyword: "late" });
        const active = await request(app).get("/rentals/search").query({ keyword: "active" });

        expect(late.status).toBe(200);
        expect(late.body).toEqual(expect.arrayContaining([expect.objectContaining({ id })]));
        expect(active.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id })]));
    });

    it("não deve buscar locações sem informar a palavra-chave", async () => {
        const response = await request(app).get("/rentals/search");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Palavra-chave não informada.");
    });

    // ---------- atualizar ----------

    it("deve alterar os dias de uma locação reservada e recalcular o total", async () => {
        const { id } = await createRental(3);

        const response = await request(app)
            .put(`/rentals/${id}`)
            .send({ days: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            days: 5,
            total_price: 32.5,
        });
    });

    it("não deve atualizar uma locação com quantidade de dias inválida", async () => {
        const { id } = await createRental();

        const response = await request(app)
            .put(`/rentals/${id}`)
            .send({ days: 0 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "A quantidade de dias da locação deve ser um número inteiro entre 1 e 30.",
        );
    });

    it("deve retornar 404 ao atualizar uma locação que não existe", async () => {
        const response = await request(app)
            .put(`/rentals/${randomUUID()}`)
            .send({ days: 2 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Locação não encontrada.");
    });

    // ---------- retirar ----------

    it("deve retirar um filme reservado", async () => {
        const { id } = await createRental(3);

        const response = await request(app).post(`/rentals/${id}/pickup`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ id, status: "active" });
        expect(response.body.rented_at).toEqual(expect.any(String));

        const rentedAt = new Date(response.body.rented_at).getTime();
        const dueAt = new Date(response.body.due_at).getTime();
        expect(dueAt - rentedAt).toBe(3 * 24 * 60 * 60 * 1000);
    });

    it("deve recusar a retirada fora do prazo sem expirar a reserva", async () => {
        const { id, movieId } = await createRental();
        await expireReservationDeadline(id);

        const response = await request(app).post(`/rentals/${id}/pickup`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O prazo de retirada desta reserva terminou.");

        const rental = await request(app).get(`/rentals/${id}`);
        expect(rental.body.status).toBe("reserved");
        expect(await getMovieStock(movieId)).toBe(1);
    });

    // ---------- expirar ----------

    it("deve expirar as reservas vencidas e devolver a cópia ao estoque", async () => {
        const { id, movieId } = await createRental();
        await expireReservationDeadline(id);

        const response = await request(app).post("/rentals/expire-reservations");

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/reserva\(s\) expirada\(s\)\.$/);

        const rental = await request(app).get(`/rentals/${id}`);
        expect(rental.body.status).toBe("expired");
        expect(await getMovieStock(movieId)).toBe(2);

        const pickup = await request(app).post(`/rentals/${id}/pickup`);
        expect(pickup.status).toBe(400);
        expect(pickup.body.message).toBe("Esta reserva expirou.");
    });

    // ---------- devolver ----------

    it("deve devolver um filme retirado e devolver a cópia ao estoque", async () => {
        const { id, movieId } = await createRental();
        await request(app).post(`/rentals/${id}/pickup`);

        const response = await request(app).post(`/rentals/${id}/return`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            status: "returned",
            late_fee: 0,
        });
        expect(response.body.returned_at).toEqual(expect.any(String));
        expect(await getMovieStock(movieId)).toBe(2);
    });

    it("não deve devolver um filme duas vezes", async () => {
        const { id } = await createRental();
        await request(app).post(`/rentals/${id}/pickup`);
        await request(app).post(`/rentals/${id}/return`);

        const response = await request(app).post(`/rentals/${id}/return`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Este filme já foi devolvido.");
    });

    // ---------- cancelar ----------

    it("deve cancelar uma reserva e devolver a cópia ao estoque", async () => {
        const { id, movieId } = await createRental();

        const response = await request(app).post(`/rentals/${id}/cancel`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ id, status: "cancelled" });
        expect(await getMovieStock(movieId)).toBe(2);
    });

    it("não deve cancelar uma locação depois da retirada", async () => {
        const { id } = await createRental();
        await request(app).post(`/rentals/${id}/pickup`);

        const response = await request(app).post(`/rentals/${id}/cancel`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Só é possível cancelar uma reserva que ainda não foi retirada.");
    });

    // ---------- remover ----------

    it("deve remover uma locação finalizada", async () => {
        const { id } = await createRental();
        await request(app).post(`/rentals/${id}/cancel`);

        const response = await request(app).delete(`/rentals/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Locação removida com sucesso.");

        const getResponse = await request(app).get(`/rentals/${id}`);
        expect(getResponse.status).toBe(404);
    });

    it("não deve remover uma locação em aberto", async () => {
        const { id } = await createRental();

        const response = await request(app).delete(`/rentals/${id}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "Não é possível remover uma locação em aberto. Cancele ou devolva antes.",
        );
    });

    it("deve retornar 404 ao remover uma locação que não existe", async () => {
        const response = await request(app).delete(`/rentals/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Locação não encontrada.");
    });
});
