import { describe, it, expect } from "vitest";
import { Genre } from "../model/Genre.js";

describe("Genre - Testes Unitários", () => {

    // Gênero com dados válidos
    it("deve criar um gênero válido", () => {

        const name = "Ação";
        const description = "Filmes de ação e aventura";

        const genre = new Genre(name, description);

        expect(genre.getName()).toBe("Ação");
        expect(genre.getDescription()).toBe("Filmes de ação e aventura");
        expect(genre.isActive()).toBe(true);
        expect(genre.getId()).toBeUndefined();
    });

    it("deve permitir criar um gênero sem descrição", () => {

        const genre = new Genre("Drama");

        expect(genre.getName()).toBe("Drama");
        expect(genre.getDescription()).toBeUndefined();
    });

    it("não deve permitir criar um gênero com nome vazio", () => {

        const name = "";

        expect(() => {
            new Genre(name);
        }).toThrow("O nome do gênero é obrigatório.");
    });

    it("não deve permitir criar um gênero com nome contendo apenas espaços", () => {

        const name = "     ";//trim()

        expect(() => {
            new Genre(name);
        }).toThrow("O nome do gênero é obrigatório.");
    });

    it("não deve permitir criar um gênero com nome que não seja texto", () => {

        const name = 123 as unknown as string;

        expect(() => {
            new Genre(name);
        }).toThrow("O nome do gênero é obrigatório.");
    });

    it("deve remover espaços antes e depois do nome do gênero", () => {

        const name = "  Comédia   ";//trim()

        const genre = new Genre(name);

        expect(genre.getName()).toBe("Comédia");
    });

    it("deve permitir renomear um gênero existente", () => {

        const genre = new Genre("Ação");

        genre.rename("Aventura");

        expect(genre.getName()).toBe("Aventura");
    });

    it("deve preservar o nome original após uma tentativa inválida de renomeação", () => {

        const genre = new Genre("Ação");

        expect(() => {
            genre.rename("");
        }).toThrow("O nome do gênero é obrigatório.");

        expect(genre.getName()).toBe("Ação");
    });

    it("deve permitir alterar a descrição de um gênero", () => {

        const genre = new Genre("Ação", "Filmes de ação");

        genre.changeDescription("Filmes de ação e aventura");

        expect(genre.getDescription()).toBe("Filmes de ação e aventura");
    });

    it("deve permitir desativar e reativar um gênero", () => {

        const genre = new Genre("Ação");

        genre.deactivate();

        expect(genre.isActive()).toBe(false);

        genre.activate();

        expect(genre.isActive()).toBe(true);
    });

    it("deve restaurar um gênero existente", () => {

        const id = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";
        const name = "Ação";
        const active = false;
        const description = "Filmes de ação e aventura";

        const genre = Genre.restore(
            id,
            name,
            active,
            description
        );

        expect(genre.getId()).toBe("bdf4183d-79a0-4f6f-8ead-03400eb6ed60");
        expect(genre.getName()).toBe("Ação");
        expect(genre.isActive()).toBe(false);
        expect(genre.getDescription()).toBe("Filmes de ação e aventura");
    });
});
