import { beforeEach, describe, expect, it, vi } from "vitest";
import MovieService from "../services/MovieService.js";
import MovieRepository from "../repositories/MovieRepository.js";
import GenreRepository from "../repositories/GenreRepository.js";
import { Movie } from "../model/Movie.js";
import { Genre } from "../model/Genre.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

vi.mock("../repositories/MovieRepository.js");
vi.mock("../repositories/GenreRepository.js");

describe("MovieService - Testes Unitários", () => {

    const id = "9b2f6d1e-5a7c-4c3e-8f10-2d4b6a8c0e12";
    const genreId = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";
    const otherGenreId = "0b1d5f7e-3c2a-4e9b-9a6d-1f2e3d4c5b6a";

    const validData = {
        genre_id: genreId,
        title: "Matrix",
        year: 1999,
        duration: 136,
        daily_price: 6.5,
        stock: 5,
    };

    function makeMovie() {
        return Movie.restore(id, genreId, "Matrix", 1999, 136, 6.5, 5, true);
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ---------- create ----------

    it("deve criar um filme quando o gênero existe e está ativo", async () => {
        vi.mocked(GenreRepository.findById).mockResolvedValue(Genre.restore(genreId, "Ficção", true));
        vi.mocked(MovieRepository.create).mockResolvedValue({ id, title: "Matrix" });

        const result = await MovieService.create(validData);

        expect(GenreRepository.findById).toHaveBeenCalledWith(genreId);
        expect(MovieRepository.create).toHaveBeenCalledTimes(1);

        const createdMovie = vi.mocked(MovieRepository.create).mock.calls[0]![0];
        expect(createdMovie.getTitle()).toBe("Matrix");
        expect(createdMovie.getStock()).toBe(5);
        expect(result).toEqual({ id, title: "Matrix" });
    });

    it("não deve permitir criar um filme com gênero inexistente", async () => {
        vi.mocked(GenreRepository.findById).mockRejectedValue(new NotFoundError("Gênero não encontrado."));

        await expect(MovieService.create(validData))
            .rejects.toThrow("O gênero informado não existe.");

        await expect(MovieService.create(validData))
            .rejects.toBeInstanceOf(ValidationError);

        expect(MovieRepository.create).not.toHaveBeenCalled();
    });

    it("não deve permitir criar um filme com gênero inativo", async () => {
        vi.mocked(GenreRepository.findById).mockResolvedValue(Genre.restore(genreId, "Ficção", false));

        await expect(MovieService.create(validData))
            .rejects.toThrow("O gênero informado está inativo.");

        expect(MovieRepository.create).not.toHaveBeenCalled();
    });

    it("não deve consultar o banco ao criar um filme com dados inválidos", async () => {
        await expect(MovieService.create({ ...validData, title: "   " }))
            .rejects.toThrow("O título do filme é obrigatório.");

        expect(GenreRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.create).not.toHaveBeenCalled();
    });

    it("não deve consultar o banco ao criar um filme com gênero que não é UUID", async () => {
        await expect(MovieService.create({ ...validData, genre_id: "abc" }))
            .rejects.toThrow("O identificador do gênero deve ser um UUID válido.");

        expect(GenreRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.create).not.toHaveBeenCalled();
    });

    it("deve repassar erros inesperados ao consultar o gênero", async () => {
        vi.mocked(GenreRepository.findById).mockRejectedValue(new Error("Falha de conexão"));

        await expect(MovieService.create(validData))
            .rejects.toThrow("Falha de conexão");

        expect(MovieRepository.create).not.toHaveBeenCalled();
    });

    // ---------- update ----------

    it("deve atualizar dados do filme sem consultar o gênero quando ele não muda", async () => {
        const movie = makeMovie();
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);
        vi.mocked(MovieRepository.update).mockResolvedValue({ id, title: "Matrix Reloaded" });

        const result = await MovieService.update(id, {
            title: "Matrix Reloaded",
            director: "Lana Wachowski",
            synopsis: "Nova sinopse",
            year: 2003,
            duration: 138,
            cover: "https://exemplo.com/reloaded.jpg",
            stock: 8,
            daily_price: 7.5,
        });

        expect(movie.getTitle()).toBe("Matrix Reloaded");
        expect(movie.getDirector()).toBe("Lana Wachowski");
        expect(movie.getSynopsis()).toBe("Nova sinopse");
        expect(movie.getYear()).toBe(2003);
        expect(movie.getDuration()).toBe(138);
        expect(movie.getCover()).toBe("https://exemplo.com/reloaded.jpg");
        expect(movie.getStock()).toBe(8);
        expect(movie.getDailyPrice()).toBe(7.5);
        expect(GenreRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.update).toHaveBeenCalledWith(movie);
        expect(result).toEqual({ id, title: "Matrix Reloaded" });
    });

    it("deve trocar o gênero do filme quando o novo gênero existe e está ativo", async () => {
        const movie = makeMovie();
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);
        vi.mocked(GenreRepository.findById).mockResolvedValue(Genre.restore(otherGenreId, "Ação", true));
        vi.mocked(MovieRepository.update).mockResolvedValue({ id });

        await MovieService.update(id, { genre_id: otherGenreId });

        expect(GenreRepository.findById).toHaveBeenCalledWith(otherGenreId);
        expect(movie.getGenreId()).toBe(otherGenreId);
        expect(MovieRepository.update).toHaveBeenCalledTimes(1);
    });

    it("não deve consultar o gênero quando o genre_id enviado é o mesmo do filme", async () => {
        const movie = makeMovie();
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);
        vi.mocked(MovieRepository.update).mockResolvedValue({ id });

        await MovieService.update(id, { genre_id: genreId, stock: 2 });

        expect(GenreRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.update).toHaveBeenCalledTimes(1);
    });

    it("não deve permitir trocar o gênero para um gênero inativo", async () => {
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie());
        vi.mocked(GenreRepository.findById).mockResolvedValue(Genre.restore(otherGenreId, "Ação", false));

        await expect(MovieService.update(id, { genre_id: otherGenreId }))
            .rejects.toThrow("O gênero informado está inativo.");

        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("não deve permitir trocar o gênero para um gênero inexistente", async () => {
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie());
        vi.mocked(GenreRepository.findById).mockRejectedValue(new NotFoundError("Gênero não encontrado."));

        await expect(MovieService.update(id, { genre_id: otherGenreId }))
            .rejects.toThrow("O gênero informado não existe.");

        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("não deve atualizar um filme com dados inválidos", async () => {
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie());

        await expect(MovieService.update(id, { stock: -1 }))
            .rejects.toThrow("O estoque do filme deve ser um número inteiro maior ou igual a zero.");

        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("não deve atualizar um filme que não existe", async () => {
        vi.mocked(MovieRepository.findById).mockRejectedValue(new NotFoundError("Filme não encontrado."));

        await expect(MovieService.update(id, { title: "Outro" }))
            .rejects.toThrow("Filme não encontrado.");

        expect(GenreRepository.findById).not.toHaveBeenCalled();
        expect(MovieRepository.update).not.toHaveBeenCalled();
    });

    it("deve desativar e reativar um filme", async () => {
        const movie = makeMovie();
        vi.mocked(MovieRepository.findById).mockResolvedValue(movie);
        vi.mocked(MovieRepository.update).mockResolvedValue({ id });

        await MovieService.update(id, { active: false });

        expect(movie.isActive()).toBe(false);

        await MovieService.update(id, { active: true });

        expect(movie.isActive()).toBe(true);
    });

    // ---------- consultas e exclusão ----------

    it("deve listar os filmes", async () => {
        vi.mocked(MovieRepository.findAll).mockResolvedValue([{ id, title: "Matrix" }]);

        const result = await MovieService.getAll();

        expect(result).toEqual([{ id, title: "Matrix" }]);
    });

    it("deve buscar um filme pelo id", async () => {
        vi.mocked(MovieRepository.findById).mockResolvedValue(makeMovie());

        const result = await MovieService.getById(id);

        expect(MovieRepository.findById).toHaveBeenCalledWith(id);
        expect(result.getTitle()).toBe("Matrix");
    });

    it("não deve encontrar um filme que não existe", async () => {
        vi.mocked(MovieRepository.findById).mockRejectedValue(new NotFoundError("Filme não encontrado."));

        await expect(MovieService.getById(id))
            .rejects.toThrow("Filme não encontrado.");
    });

    it("deve buscar filmes por palavra-chave", async () => {
        vi.mocked(MovieRepository.searchByKeyword).mockResolvedValue([{ id, title: "Matrix" }]);

        const result = await MovieService.search("matr");

        expect(MovieRepository.searchByKeyword).toHaveBeenCalledWith("matr");
        expect(result).toEqual([{ id, title: "Matrix" }]);
    });

    it("deve remover um filme", async () => {
        vi.mocked(MovieRepository.remove).mockResolvedValue({ id, title: "Matrix" });

        const result = await MovieService.remove(id);

        expect(MovieRepository.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual({ id, title: "Matrix" });
    });

    it("deve repassar o erro quando o filme possui locações", async () => {
        vi.mocked(MovieRepository.remove).mockRejectedValue(
            new ValidationError("O filme não pode ser excluído pois possui locações associadas."),
        );

        await expect(MovieService.remove(id))
            .rejects.toThrow("O filme não pode ser excluído pois possui locações associadas.");
    });
});
