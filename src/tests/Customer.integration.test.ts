import { randomInt, randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import supabase from "../config/supabase.js";

// Cada requisição vai até o Supabase pela internet, então o limite padrão de 5s pode ser curto.
vi.setConfig({ testTimeout: 20_000 });

describe("Customer - Testes de integração", () => {

    const testIds: string[] = [];
    const testEmails: string[] = [];
    const testGenreIds: string[] = [];
    const testMovieIds: string[] = [];

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

    function makeCustomerData() {
        const email = `teste.${randomUUID()}@email.com`;
        testEmails.push(email);
        return {
            name: "Cliente teste integração",
            email,
            cpf: makeCpf(),
            phone: "41999998888",
        };
    }

    async function createCustomer() {
        const data = makeCustomerData();
        const response = await request(app).post("/customers").send(data);
        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        testIds.push(response.body.id);
        return {
            id: response.body.id as string,
            data,
        };
    }

    async function createRental(customerId: string) {
        const { data: genre, error: genreError } = await supabase
            .from("genres")
            .insert({ name: `Teste integração ${randomUUID()}` })
            .select()
            .single();
        if (genreError) {
            throw new Error(`Falha ao criar gênero do teste: ${genreError.message}`);
        }
        testGenreIds.push(genre.id);

        const { data: movie, error: movieError } = await supabase
            .from("movies")
            .insert({
                genre_id: genre.id,
                title: `Filme teste ${randomUUID()}`,
                year: 2000,
                duration: 120,
                daily_price: 5,
            })
            .select()
            .single();
        if (movieError) {
            throw new Error(`Falha ao criar filme do teste: ${movieError.message}`);
        }
        testMovieIds.push(movie.id);

        const { data: rental, error: rentalError } = await supabase
            .from("rentals")
            .insert({
                customer_id: customerId,
                movie_id: movie.id,
                days: 2,
                daily_price: 5,
                total_price: 10,
                reserved_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();
        if (rentalError) {
            throw new Error(`Falha ao criar locação do teste: ${rentalError.message}`);
        }
        return rental;
    }

    afterEach(async () => {
        const ids = testIds.splice(0);
        const emails = testEmails.splice(0);
        const movieIds = testMovieIds.splice(0);
        const genreIds = testGenreIds.splice(0);

        if (ids.length > 0) {
            const { error } = await supabase.from("rentals").delete().in("customer_id", ids);
            if (error) {
                throw new Error(`Falha ao limpar locações do teste: ${error.message}`);
            }
        }

        if (movieIds.length > 0) {
            const { error } = await supabase.from("movies").delete().in("id", movieIds);
            if (error) {
                throw new Error(`Falha ao limpar filmes do teste: ${error.message}`);
            }
        }

        if (genreIds.length > 0) {
            const { error } = await supabase.from("genres").delete().in("id", genreIds);
            if (error) {
                throw new Error(`Falha ao limpar gêneros do teste: ${error.message}`);
            }
        }

        if (emails.length === 0) {
            return;
        }
        const { error } = await supabase
            .from("customers")
            .delete()
            .in("email", emails);
        if (error) {
            throw new Error(`Falha ao limpar clientes do teste: ${error.message}`);
        }
    }, 20_000);

    it("deve criar um cliente válido", async () => {
        const data = makeCustomerData();

        const response = await request(app).post("/customers").send(data);

        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        expect(response.body).toMatchObject({
            ...data,
            active: true,
        });
    });

    it("não deve criar um cliente sem nome", async () => {
        const { name, ...data } = makeCustomerData();

        const response = await request(app).post("/customers").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O nome do cliente é obrigatório.");
    });

    it("não deve criar um cliente sem corpo na requisição", async () => {
        const response = await request(app).post("/customers");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O nome do cliente é obrigatório.");
    });

    it("não deve criar um cliente com e-mail inválido", async () => {
        const data = { ...makeCustomerData(), email: "email-invalido" };

        const response = await request(app).post("/customers").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O e-mail do cliente é inválido.");
    });

    it("não deve criar um cliente com CPF inválido", async () => {
        const data = { ...makeCustomerData(), cpf: "11111111111" };

        const response = await request(app).post("/customers").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O CPF do cliente é inválido.");
    });

    it("não deve criar um cliente com e-mail repetido", async () => {
        const { data } = await createCustomer();

        const response = await request(app)
            .post("/customers")
            .send({ ...makeCustomerData(), email: data.email });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um cliente com este e-mail.");
    });

    it("não deve criar um cliente com CPF repetido", async () => {
        const { data } = await createCustomer();

        const response = await request(app)
            .post("/customers")
            .send({ ...makeCustomerData(), cpf: data.cpf });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um cliente com este CPF.");
    });

    it("deve listar os clientes inclusive o cliente criado", async () => {
        const { id, data } = await createCustomer();

        const response = await request(app).get("/customers");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id,
                    email: data.email,
                }),
            ]),
        );
    });

    it("deve consultar um cliente existente por ID", async () => {
        const { id, data } = await createCustomer();

        const response = await request(app).get(`/customers/${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...data,
            active: true,
        });
    }, 20_000);

    it("deve retornar 404 ao consultar um cliente que não existe", async () => {
        const response = await request(app).get(`/customers/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Cliente não encontrado.");
    });

    it("deve buscar um cliente por palavra-chave", async () => {
        const { id, data } = await createCustomer();

        const response = await request(app)
            .get("/customers/search")
            .query({ keyword: data.email });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id,
                    email: data.email,
                }),
            ]),
        );
    });

    it("não deve buscar clientes sem informar a palavra-chave", async () => {
        const response = await request(app).get("/customers/search");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Palavra-chave não informada.");
    });

    it("deve listar as locações de um cliente", async () => {
        const { id } = await createCustomer();
        const rental = await createRental(id);

        const response = await request(app).get(`/customers/${id}/rentals`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            id: rental.id,
            customer_id: id,
        });
    });

    it("deve retornar 404 ao listar as locações de um cliente que não existe", async () => {
        const response = await request(app).get(`/customers/${randomUUID()}/rentals`);

        expect(response.status).toBe(404);
    });

    it("deve atualizar os dados de um cliente", async () => {
        const { id, data } = await createCustomer();

        const updatedData = {
            name: "Nome atualizado pelo teste",
            email: data.email,
            cpf: data.cpf,
            phone: "41988887777",
            active: false,
        };

        const response = await request(app)
            .put(`/customers/${id}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...updatedData,
        });
    });

    it("não deve atualizar o e-mail de um cliente para um e-mail que já existe", async () => {
        const first = await createCustomer();
        const second = await createCustomer();

        const response = await request(app)
            .put(`/customers/${second.id}`)
            .send({ email: first.data.email });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um cliente com este e-mail.");
    });

    it("não deve atualizar o CPF de um cliente para um CPF que já existe", async () => {
        const first = await createCustomer();
        const second = await createCustomer();

        const response = await request(app)
            .put(`/customers/${second.id}`)
            .send({ cpf: first.data.cpf });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um cliente com este CPF.");
    });

    it("deve retornar 404 ao atualizar um cliente que não existe", async () => {
        const response = await request(app)
            .put(`/customers/${randomUUID()}`)
            .send({ name: "Cliente inexistente" });

        expect(response.status).toBe(404);
    });

    it("deve remover um cliente existente", async () => {
        const { id } = await createCustomer();

        const response = await request(app)
            .delete(`/customers/${id}`);

        const { data, error } = await supabase
            .from("customers")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(error).toBeNull();
        expect(data).toBeNull();

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Cliente removido com sucesso.");
    });

    it("não deve remover um cliente que possui locações", async () => {
        const { id } = await createCustomer();
        await createRental(id);

        const response = await request(app)
            .delete(`/customers/${id}`);

        const { data } = await supabase
            .from("customers")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Não é possível remover um cliente que possui locações.");
        expect(data).not.toBeNull();
    });

    it("deve retornar 404 ao remover um cliente que não existe", async () => {
        const response = await request(app).delete(`/customers/${randomUUID()}`);

        expect(response.status).toBe(404);
    });

})
