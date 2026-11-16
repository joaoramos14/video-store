import { beforeEach, describe, expect, it, vi } from "vitest";
import GenreService from "../services/GenreService.js";
import GenreRepository from "../repositories/GenreRepository.js";
import { Genre } from "../model/Genre.js";
import { NotFoundError } from "../errors/NotFoundError.js";

vi.mock("../repositories/GenreRepository.js");

describe("GenreService - Testes Unitários", () => {

    const id = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve criar um gênero quando o nome ainda não existe", async () => {
        vi.mocked(GenreRepository.findByName).mockResolvedValue(null);
        vi.mocked(GenreRepository.create).mockResolvedValue({ id, name: "Ação" });

        const result = await GenreService.create("Ação", "Filmes de ação");

        expect(GenreRepository.findByName).toHaveBeenCalledWith("Ação");
        expect(GenreRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id, name: "Ação" });
    });

    it("não deve permitir criar um gênero com nome repetido", async () => {
        vi.mocked(GenreRepository.findByName).mockResolvedValue({ id: "1", name: "Ação" });

        await expect(GenreService.create("Ação"))
            .rejects.toThrow("Já existe um gênero com este nome.");

        expect(GenreRepository.create).not.toHaveBeenCalled();
    });

    it("não deve consultar o banco ao criar um gênero com nome vazio", async () => {
        await expect(GenreService.create("   "))
            .rejects.toThrow("O nome do gênero é obrigatório.");

        expect(GenreRepository.findByName).not.toHaveBeenCalled();
        expect(GenreRepository.create).not.toHaveBeenCalled();
    });

    it("deve atualizar o nome e a descrição de um gênero", async () => {
        const genre = Genre.restore(id, "Ação", true, "Filmes de ação");
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.findByName).mockResolvedValue(null);
        vi.mocked(GenreRepository.update).mockResolvedValue({ id, name: "Aventura" });

        const result = await GenreService.update(id, { name: "Aventura", description: "Filmes de aventura" });

        expect(genre.getName()).toBe("Aventura");
        expect(genre.getDescription()).toBe("Filmes de aventura");
        expect(GenreRepository.update).toHaveBeenCalledWith(genre);
        expect(result).toEqual({ id, name: "Aventura" });
    });

    it("deve permitir manter o nome do próprio gênero ao atualizar", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.findByName).mockResolvedValue({ id, name: "Ação" });
        vi.mocked(GenreRepository.update).mockResolvedValue({ id, name: "Ação" });

        await GenreService.update(id, { name: "Ação" });

        expect(GenreRepository.update).toHaveBeenCalledTimes(1);
    });

    it("não deve permitir renomear um gênero para um nome que já existe", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.findByName).mockResolvedValue({ id: "outro-id", name: "Drama" });

        await expect(GenreService.update(id, { name: "Drama" }))
            .rejects.toThrow("Já existe um gênero com este nome.");

        expect(GenreRepository.update).not.toHaveBeenCalled();
    });

    it("não deve buscar nome repetido quando o nome não é alterado", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.update).mockResolvedValue({ id, name: "Ação" });

        await GenreService.update(id, { description: "Nova descrição" });

        expect(GenreRepository.findByName).not.toHaveBeenCalled();
        expect(GenreRepository.update).toHaveBeenCalledTimes(1);
    });

    it("deve desativar e reativar um gênero", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.update).mockResolvedValue({ id, name: "Ação" });

        await GenreService.update(id, { active: false });

        expect(genre.isActive()).toBe(false);

        await GenreService.update(id, { active: true });

        expect(genre.isActive()).toBe(true);
    });

    it("não deve atualizar um gênero que não existe", async () => {
        vi.mocked(GenreRepository.findById).mockRejectedValue(new NotFoundError("Gênero não encontrado."));

        await expect(GenreService.update(id, { name: "Aventura" }))
            .rejects.toThrow("Gênero não encontrado.");

        expect(GenreRepository.update).not.toHaveBeenCalled();
    });

    it("deve listar os gêneros", async () => {
        vi.mocked(GenreRepository.findAll).mockResolvedValue([{ id, name: "Ação" }]);

        const result = await GenreService.getAll();

        expect(result).toEqual([{ id, name: "Ação" }]);
    });

    it("deve buscar um gênero pelo id", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);

        const result = await GenreService.getById(id);

        expect(GenreRepository.findById).toHaveBeenCalledWith(id);
        expect(result.getName()).toBe("Ação");
    });

    it("deve buscar gêneros por palavra-chave", async () => {
        vi.mocked(GenreRepository.searchByKeyword).mockResolvedValue([{ id, name: "Ação" }]);

        const result = await GenreService.search("aç");

        expect(GenreRepository.searchByKeyword).toHaveBeenCalledWith("aç");
        expect(result).toEqual([{ id, name: "Ação" }]);
    });

    it("deve listar os filmes de um gênero existente", async () => {
        const genre = Genre.restore(id, "Ação", true);
        vi.mocked(GenreRepository.findById).mockResolvedValue(genre);
        vi.mocked(GenreRepository.findMoviesByGenreId).mockResolvedValue([{ id: "1", title: "Matrix" }]);

        const result = await GenreService.getMovies(id);

        expect(GenreRepository.findMoviesByGenreId).toHaveBeenCalledWith(id);
        expect(result).toEqual([{ id: "1", title: "Matrix" }]);
    });

    it("não deve listar os filmes de um gênero que não existe", async () => {
        vi.mocked(GenreRepository.findById).mockRejectedValue(new NotFoundError("Gênero não encontrado."));

        await expect(GenreService.getMovies(id))
            .rejects.toThrow("Gênero não encontrado.");

        expect(GenreRepository.findMoviesByGenreId).not.toHaveBeenCalled();
    });

    it("deve remover um gênero", async () => {
        vi.mocked(GenreRepository.remove).mockResolvedValue({ id, name: "Ação" });

        const result = await GenreService.remove(id);

        expect(GenreRepository.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual({ id, name: "Ação" });
    });
});
