import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import supabase from "../config/supabase.js";

describe("Movie - Testes de integração", () => {

    const testTitles: string[] = [];
    const testRentalIds: string[] = [];
    const testCustomerIds: string[] = [];
    let genreId: string;
    let inactiveGenreId: string;

    async function createGenre(name: string, active: boolean) {
        const { data, error } = await supabase
            .from("genres")
            .insert({
                name,
                description: "Gênero criado pelo teste de integração de filmes",
                active,
            })
            .select()
            .single();
        if (error) {
            throw new Error(`Falha ao criar gênero do teste: ${error.message}`);
        }
        return data.id as string;
    }

    beforeAll(async () => {
        genreId = await createGenre(`Teste integração filmes ${randomUUID()}`, true);
        inactiveGenreId = await createGenre(`Teste integração filmes inativo ${randomUUID()}`, false);
    }, 20_000);

    function makeMovieData() {
        const title = `Teste integração ${randomUUID()}`;
        testTitles.push(title);
        return {
            genre_id: genreId,
            title,
            director: "Diretor de teste",
            synopsis: "Filme criado pelo teste de integração",
            year: 1999,
            duration: 120,
            cover: "https://exemplo.com/capa.jpg",
            stock: 3,
            daily_price: 6.5,
        };
    }

    async function createMovie() {
        const data = makeMovieData();
        const response = await request(app).post("/movies").send(data);
        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        return {
            id: response.body.id as string,
            data,
        };
    }

    async function createRental(movieId: string) {
        const suffix = randomUUID();
        const cpf = String(Math.floor(Math.random() * 1e11)).padStart(11, "0");

        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .insert({
                name: `Cliente teste ${suffix}`,
                email: `${suffix}@teste.com`,
                cpf,
            })
            .select()
            .single();
        if (customerError) {
            throw new Error(`Falha ao criar cliente do teste: ${customerError.message}`);
        }
        testCustomerIds.push(customer.id);

        const { data: rental, error: rentalError } = await supabase
            .from("rentals")
            .insert({
                customer_id: customer.id,
                movie_id: movieId,
                days: 1,
                daily_price: 6.5,
                total_price: 6.5,
                reserved_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();
        if (rentalError) {
            throw new Error(`Falha ao criar locação do teste: ${rentalError.message}`);
        }
        testRentalIds.push(rental.id);
    }

    afterEach(async () => {
        const rentalIds = testRentalIds.splice(0);
        const customerIds = testCustomerIds.splice(0);
        const titles = testTitles.splice(0);

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

        if (titles.length > 0) {
            const { error } = await supabase.from("movies").delete().in("title", titles);
            if (error) {
                throw new Error(`Falha ao limpar filmes do teste: ${error.message}`);
            }
        }
    }, 20_000);

    afterAll(async () => {
        const { error } = await supabase
            .from("genres")
            .delete()
            .in("id", [genreId, inactiveGenreId]);
        if (error) {
            throw new Error(`Falha ao limpar gêneros do teste: ${error.message}`);
        }
    }, 20_000);

    // ---------- criar ----------

    it("deve criar um filme válido", async () => {
        const data = makeMovieData();

        const response = await request(app).post("/movies").send(data);

        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        expect(response.body).toMatchObject({
            ...data,
            active: true,
        });
    });

    it("deve criar um filme apenas com os campos obrigatórios", async () => {
        const { director, synopsis, cover, stock, ...required } = makeMovieData();

        const response = await request(app).post("/movies").send(required);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            ...required,
            stock: 0,
            active: true,
        });
    });

    it("não deve criar um filme sem título", async () => {
        const { title, ...data } = makeMovieData();

        const response = await request(app).post("/movies").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O título do filme é obrigatório.");
    });

    it("não deve criar um filme sem corpo na requisição", async () => {
        const response = await request(app).post("/movies");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O gênero do filme é obrigatório.");
    });

    it("não deve criar um filme com ano inválido", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), year: 1800 });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("O ano do filme deve ser um número inteiro");
    });

    it("não deve criar um filme com duração inválida", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), duration: 0 });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("A duração do filme");
    });

    it("não deve criar um filme com estoque negativo", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), stock: -1 });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("O estoque do filme");
    });

    it("não deve criar um filme com diária negativa", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), daily_price: -5 });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("O valor da diária do filme");
    });

    it("não deve criar um filme com capa que não é URL", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), cover: "capa.jpg" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("A capa do filme deve ser uma URL válida.");
    });

    it("não deve criar um filme com gênero que não é UUID", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), genre_id: "123" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O identificador do gênero deve ser um UUID válido.");
    });

    it("não deve criar um filme com gênero inexistente", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), genre_id: randomUUID() });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O gênero informado não existe.");
    });

    it("não deve criar um filme com gênero inativo", async () => {
        const response = await request(app)
            .post("/movies")
            .send({ ...makeMovieData(), genre_id: inactiveGenreId });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O gênero informado está inativo.");
    });

    // ---------- consultar ----------

    it("deve listar os filmes inclusive o filme criado", async () => {
        const { id, data } = await createMovie();

        const response = await request(app).get("/movies");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id,
                    title: data.title,
                }),
            ]),
        );
    });

    it("deve consultar um filme existente por ID", async () => {
        const { id, data } = await createMovie();

        const response = await request(app).get(`/movies/${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...data,
            active: true,
        });
    }, 20_000);

    it("deve retornar 404 ao consultar um filme que não existe", async () => {
        const response = await request(app).get(`/movies/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Filme não encontrado.");
    });

    it("deve buscar um filme por palavra-chave", async () => {
        const { id, data } = await createMovie();

        const response = await request(app)
            .get("/movies/search")
            .query({ keyword: data.title });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            id,
            title: data.title,
        });
    });

    it("não deve buscar filmes sem informar a palavra-chave", async () => {
        const response = await request(app).get("/movies/search");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Palavra-chave não informada.");
    });

    // ---------- atualizar ----------

    it("deve atualizar os dados de um filme", async () => {
        const { id, data } = await createMovie();

        const updatedData = {
            title: data.title,
            director: "Outro diretor",
            year: 2005,
            duration: 95,
            stock: 10,
            daily_price: 9.9,
            active: false,
        };

        const response = await request(app)
            .put(`/movies/${id}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...updatedData,
        });
    });

    it("deve trocar o gênero de um filme por outro gênero ativo", async () => {
        const { id } = await createMovie();
        const otherGenreId = await createGenre(`Teste integração filmes outro ${randomUUID()}`, true);

        try {
            const response = await request(app)
                .put(`/movies/${id}`)
                .send({ genre_id: otherGenreId });

            expect(response.status).toBe(200);
            expect(response.body.genre_id).toBe(otherGenreId);

            // devolve o filme ao gênero original para o gênero extra poder ser apagado
            await request(app).put(`/movies/${id}`).send({ genre_id: genreId });
        } finally {
            await supabase.from("movies").delete().eq("id", id);
            await supabase.from("genres").delete().eq("id", otherGenreId);
        }
    }, 20_000);

    it("não deve trocar o gênero de um filme por um gênero inativo", async () => {
        const { id } = await createMovie();

        const response = await request(app)
            .put(`/movies/${id}`)
            .send({ genre_id: inactiveGenreId });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O gênero informado está inativo.");
    });

    it("não deve atualizar um filme com estoque inválido", async () => {
        const { id } = await createMovie();

        const response = await request(app)
            .put(`/movies/${id}`)
            .send({ stock: -3 });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("O estoque do filme");
    });

    it("deve retornar 404 ao atualizar um filme que não existe", async () => {
        const response = await request(app)
            .put(`/movies/${randomUUID()}`)
            .send({ stock: 1 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Filme não encontrado.");
    });

    // ---------- remover ----------

    it("deve remover um filme existente", async () => {
        const { id } = await createMovie();

        const response = await request(app).delete(`/movies/${id}`);

        const { data, error } = await supabase
            .from("movies")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(error).toBeNull();
        expect(data).toBeNull();

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Filme removido com sucesso.");
    });

    it("não deve remover um filme que possui locações", async () => {
        const { id } = await createMovie();
        await createRental(id);

        const response = await request(app).delete(`/movies/${id}`);

        const { data } = await supabase
            .from("movies")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "O filme não pode ser excluído pois possui locações associadas.",
        );
        expect(data).not.toBeNull();
    });

    it("deve retornar 404 ao remover um filme que não existe", async () => {
        const response = await request(app).delete(`/movies/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Filme não encontrado.");
    });
});
