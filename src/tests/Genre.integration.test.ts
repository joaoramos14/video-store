import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import supabase from "../config/supabase.js";

describe("Genre - Testes de integração", () => {

    const testNames: string[] = [];
    const testIds: string[] = [];

    function makeGenreData() {
        const name = `Teste integração ${randomUUID()}`;
        testNames.push(name);
        return {
            name,
            description: "Gênero criado pelo teste de integração",
        };
    }

    async function createGenre() {
        const data = makeGenreData();
        const response = await request(app).post("/genres").send(data);
        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        testIds.push(response.body.id);
        return {
            id: response.body.id as string,
            data,
        };
    }

    async function createMovie(genreId: string) {
        const { data, error } = await supabase
            .from("movies")
            .insert({
                genre_id: genreId,
                title: `Filme teste ${randomUUID()}`,
                year: 2000,
                duration: 120,
                daily_price: 5,
            })
            .select()
            .single();
        if (error) {
            throw new Error(`Falha ao criar filme do teste: ${error.message}`);
        }
        return data;
    }

    afterEach(async () => {
        const ids = testIds.splice(0);
        const names = testNames.splice(0);

        if (ids.length > 0) {
            const { error: moviesError } = await supabase
                .from("movies")
                .delete()
                .in("genre_id", ids);
            if (moviesError) {
                throw new Error(`Falha ao limpar filmes do teste: ${moviesError.message}`);
            }
        }

        if (names.length === 0) {
            return;
        }
        const { error } = await supabase
            .from("genres")
            .delete()
            .in("name", names);
        if (error) {
            throw new Error(`Falha ao limpar gêneros do teste: ${error.message}`);
        }
    }, 20_000);

    it("deve criar um gênero válido", async () => {
        const data = makeGenreData();

        const response = await request(app).post("/genres").send(data);

        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(expect.any(String));
        expect(response.body).toMatchObject({
            ...data,
            active: true,
        });
    });

    it("não deve criar um gênero sem nome", async () => {
        const response = await request(app)
            .post("/genres")
            .send({ description: "Gênero sem nome" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O nome do gênero é obrigatório.");
    });

    it("não deve criar um gênero sem corpo na requisição", async () => {
        const response = await request(app).post("/genres");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("O nome do gênero é obrigatório.");
    });

    it("não deve criar um gênero com nome repetido", async () => {
        const { data } = await createGenre();

        const response = await request(app)
            .post("/genres")
            .send({ name: data.name.toUpperCase() });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um gênero com este nome.");
    });

    it("deve listar os gêneros inclusive o gênero criado", async () => {
        const { id, data } = await createGenre();

        const response = await request(app).get("/genres");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id,
                    name: data.name,
                }),
            ]),
        );
    });

    it("deve consultar um gênero existente por ID", async () => {
        const { id, data } = await createGenre();

        const response = await request(app).get(`/genres/${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...data,
            active: true,
        });
    }, 20_000);

    it("deve retornar 404 ao consultar um gênero que não existe", async () => {
        const response = await request(app).get(`/genres/${randomUUID()}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Gênero não encontrado.");
    });

    it("deve buscar um gênero por palavra-chave", async () => {
        const { id, data } = await createGenre();

        const response = await request(app)
            .get("/genres/search")
            .query({ keyword: data.name });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id,
                    name: data.name,
                }),
            ]),
        );
    });

    it("não deve buscar gêneros sem informar a palavra-chave", async () => {
        const response = await request(app).get("/genres/search");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Palavra-chave não informada.");
    });

    it("deve listar os filmes de um gênero", async () => {
        const { id } = await createGenre();
        const movie = await createMovie(id);

        const response = await request(app).get(`/genres/${id}/movies`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            id: movie.id,
            genre_id: id,
        });
    });

    it("deve retornar 404 ao listar os filmes de um gênero que não existe", async () => {
        const response = await request(app).get(`/genres/${randomUUID()}/movies`);

        expect(response.status).toBe(404);
    });

    it("deve atualizar os dados de um gênero", async () => {
        const { id, data } = await createGenre();

        const updatedData = {
            name: data.name,
            description: "Descrição atualizada pelo teste",
            active: false,
        };

        const response = await request(app)
            .put(`/genres/${id}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id,
            ...updatedData,
        });
    });

    it("não deve renomear um gênero para um nome que já existe", async () => {
        const first = await createGenre();
        const second = await createGenre();

        const response = await request(app)
            .put(`/genres/${second.id}`)
            .send({ name: first.data.name });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Já existe um gênero com este nome.");
    });

    it("deve retornar 404 ao atualizar um gênero que não existe", async () => {
        const response = await request(app)
            .put(`/genres/${randomUUID()}`)
            .send({ description: "Gênero inexistente" });

        expect(response.status).toBe(404);
    });

    it("deve remover um gênero existente", async () => {
        const { id } = await createGenre();

        const response = await request(app)
            .delete(`/genres/${id}`);

        const { data, error } = await supabase
            .from("genres")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(error).toBeNull();
        expect(data).toBeNull();

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Gênero removido com sucesso.");
    });

    it("não deve remover um gênero que possui filmes", async () => {
        const { id } = await createGenre();
        await createMovie(id);

        const response = await request(app)
            .delete(`/genres/${id}`);

        const { data } = await supabase
            .from("genres")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Não é possível remover um gênero que possui filmes.");
        expect(data).not.toBeNull();
    });

    it("deve retornar 404 ao remover um gênero que não existe", async () => {
        const response = await request(app).delete(`/genres/${randomUUID()}`);

        expect(response.status).toBe(404);
    });

})
