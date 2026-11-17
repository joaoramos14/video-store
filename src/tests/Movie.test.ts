import { describe, it, expect } from "vitest";
import { Movie } from "../model/Movie.js";

describe("Movie - Testes Unitários", () => {

    const genreId = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";
    const currentYear = new Date().getFullYear();

    // Filme com dados válidos
    it("deve criar um filme válido com todos os campos", () => {

        const movie = new Movie(
            genreId,
            "Matrix",
            1999,
            136,
            6.5,
            5,
            "Lana Wachowski",
            "Um hacker descobre que a realidade é uma simulação.",
            "https://exemplo.com/capas/matrix.jpg",
        );

        expect(movie.getGenreId()).toBe(genreId);
        expect(movie.getTitle()).toBe("Matrix");
        expect(movie.getYear()).toBe(1999);
        expect(movie.getDuration()).toBe(136);
        expect(movie.getDailyPrice()).toBe(6.5);
        expect(movie.getStock()).toBe(5);
        expect(movie.getDirector()).toBe("Lana Wachowski");
        expect(movie.getSynopsis()).toBe("Um hacker descobre que a realidade é uma simulação.");
        expect(movie.getCover()).toBe("https://exemplo.com/capas/matrix.jpg");
        expect(movie.isActive()).toBe(true);
        expect(movie.getId()).toBeUndefined();
    });

    it("deve criar um filme apenas com os campos obrigatórios", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        expect(movie.getStock()).toBe(0);
        expect(movie.getDirector()).toBeUndefined();
        expect(movie.getSynopsis()).toBeUndefined();
        expect(movie.getCover()).toBeUndefined();
    });

    // Título
    it("não deve permitir criar um filme com título vazio", () => {

        expect(() => {
            new Movie(genreId, "", 1999, 136, 6.5);
        }).toThrow("O título do filme é obrigatório.");
    });

    it("não deve permitir criar um filme com título contendo apenas espaços", () => {

        expect(() => {
            new Movie(genreId, "     ", 1999, 136, 6.5);
        }).toThrow("O título do filme é obrigatório.");
    });

    it("não deve permitir criar um filme com título que não seja texto", () => {

        const title = 123 as unknown as string;

        expect(() => {
            new Movie(genreId, title, 1999, 136, 6.5);
        }).toThrow("O título do filme é obrigatório.");
    });

    it("deve remover espaços antes e depois do título do filme", () => {

        const movie = new Movie(genreId, "  Matrix   ", 1999, 136, 6.5);

        expect(movie.getTitle()).toBe("Matrix");
    });

    it("deve preservar o título original após uma tentativa inválida de renomeação", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        expect(() => {
            movie.rename("");
        }).toThrow("O título do filme é obrigatório.");

        expect(movie.getTitle()).toBe("Matrix");
    });

    // Gênero
    it("não deve permitir criar um filme sem gênero", () => {

        expect(() => {
            new Movie("", "Matrix", 1999, 136, 6.5);
        }).toThrow("O gênero do filme é obrigatório.");
    });

    it("não deve permitir criar um filme com gênero que não seja UUID", () => {

        expect(() => {
            new Movie("123", "Matrix", 1999, 136, 6.5);
        }).toThrow("O identificador do gênero deve ser um UUID válido.");
    });

    it("deve permitir trocar o gênero por outro UUID válido", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);
        const newGenreId = "0b1d5f7e-3c2a-4e9b-9a6d-1f2e3d4c5b6a";

        movie.changeGenre(newGenreId);

        expect(movie.getGenreId()).toBe(newGenreId);
    });

    // Ano
    it("deve aceitar os limites de ano (1888 e o ano atual)", () => {

        const oldest = new Movie(genreId, "Roundhay Garden Scene", 1888, 1, 0);
        const newest = new Movie(genreId, "Lançamento", currentYear, 100, 10);

        expect(oldest.getYear()).toBe(1888);
        expect(newest.getYear()).toBe(currentYear);
    });

    it("não deve permitir criar um filme com ano anterior a 1888", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1887, 136, 6.5);
        }).toThrow(`O ano do filme deve ser um número inteiro entre 1888 e ${currentYear}.`);
    });

    it("não deve permitir criar um filme com ano maior que o ano atual", () => {

        expect(() => {
            new Movie(genreId, "Matrix", currentYear + 1, 136, 6.5);
        }).toThrow(`O ano do filme deve ser um número inteiro entre 1888 e ${currentYear}.`);
    });

    it("não deve permitir criar um filme com ano decimal ou que não seja número", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999.5, 136, 6.5);
        }).toThrow("O ano do filme deve ser um número inteiro");

        expect(() => {
            new Movie(genreId, "Matrix", "1999" as unknown as number, 136, 6.5);
        }).toThrow("O ano do filme deve ser um número inteiro");
    });

    // Duração
    it("não deve permitir criar um filme com duração menor que 1", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 0, 6.5);
        }).toThrow("A duração do filme deve ser um número inteiro maior ou igual a 1 minuto.");

        expect(() => {
            new Movie(genreId, "Matrix", 1999, -10, 6.5);
        }).toThrow("A duração do filme deve ser um número inteiro maior ou igual a 1 minuto.");
    });

    it("não deve permitir criar um filme com duração decimal ou que não seja número", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 90.5, 6.5);
        }).toThrow("A duração do filme");

        expect(() => {
            new Movie(genreId, "Matrix", 1999, "90" as unknown as number, 6.5);
        }).toThrow("A duração do filme");
    });

    // Estoque
    it("deve permitir estoque igual a zero", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5, 0);

        expect(movie.getStock()).toBe(0);
    });

    it("não deve permitir criar um filme com estoque negativo", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, 6.5, -1);
        }).toThrow("O estoque do filme deve ser um número inteiro maior ou igual a zero.");
    });

    it("não deve permitir estoque decimal", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, 6.5, 2.5);
        }).toThrow("O estoque do filme deve ser um número inteiro maior ou igual a zero.");
    });

    it("deve permitir alterar o estoque e preservar o valor após uma alteração inválida", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5, 3);

        movie.changeStock(10);
        expect(movie.getStock()).toBe(10);

        expect(() => {
            movie.changeStock(-5);
        }).toThrow("O estoque do filme deve ser um número inteiro maior ou igual a zero.");

        expect(movie.getStock()).toBe(10);
    });

    // Diária
    it("deve permitir diária igual a zero", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 0);

        expect(movie.getDailyPrice()).toBe(0);
    });

    it("não deve permitir criar um filme com diária negativa", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, -0.01);
        }).toThrow("O valor da diária do filme deve ser um número maior ou igual a zero.");
    });

    it("não deve permitir diária que não seja um número finito", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, Number.NaN);
        }).toThrow("O valor da diária do filme");

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, Number.POSITIVE_INFINITY);
        }).toThrow("O valor da diária do filme");

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, "6.5" as unknown as number);
        }).toThrow("O valor da diária do filme");
    });

    it("deve permitir alterar a diária do filme", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        movie.changeDailyPrice(8.9);

        expect(movie.getDailyPrice()).toBe(8.9);
    });

    // Capa
    it("deve aceitar capa com URL http e https", () => {

        const https = new Movie(genreId, "Matrix", 1999, 136, 6.5, 0, undefined, undefined, "https://exemplo.com/matrix.jpg");
        const http = new Movie(genreId, "Matrix", 1999, 136, 6.5, 0, undefined, undefined, "http://exemplo.com/matrix.jpg");

        expect(https.getCover()).toBe("https://exemplo.com/matrix.jpg");
        expect(http.getCover()).toBe("http://exemplo.com/matrix.jpg");
    });

    it("não deve permitir criar um filme com capa que não seja uma URL válida", () => {

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, 6.5, 0, undefined, undefined, "matrix.jpg");
        }).toThrow("A capa do filme deve ser uma URL válida.");

        expect(() => {
            new Movie(genreId, "Matrix", 1999, 136, 6.5, 0, undefined, undefined, "");
        }).toThrow("A capa do filme deve ser uma URL válida.");
    });

    it("não deve permitir capa com protocolo diferente de http ou https", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        expect(() => {
            movie.changeCover("javascript:alert(1)");
        }).toThrow("A capa do filme deve ser uma URL válida.");

        expect(() => {
            movie.changeCover("ftp://exemplo.com/matrix.jpg");
        }).toThrow("A capa do filme deve ser uma URL válida.");
    });

    it("não deve permitir capa que não seja texto", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        expect(() => {
            movie.changeCover(123 as unknown as string);
        }).toThrow("A capa do filme deve ser uma URL válida.");
    });

    // Diretor e sinopse
    it("deve permitir alterar o diretor e a sinopse", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        movie.changeDirector("  Lilly Wachowski ");
        movie.changeSynopsis("Nova sinopse");

        expect(movie.getDirector()).toBe("Lilly Wachowski");
        expect(movie.getSynopsis()).toBe("Nova sinopse");
    });

    it("não deve permitir diretor ou sinopse que não sejam texto", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        expect(() => {
            movie.changeDirector(10 as unknown as string);
        }).toThrow("O diretor do filme deve ser um texto.");

        expect(() => {
            movie.changeSynopsis(10 as unknown as string);
        }).toThrow("A sinopse do filme deve ser um texto.");
    });

    // Estado
    it("deve permitir desativar e reativar um filme", () => {

        const movie = new Movie(genreId, "Matrix", 1999, 136, 6.5);

        movie.deactivate();

        expect(movie.isActive()).toBe(false);

        movie.activate();

        expect(movie.isActive()).toBe(true);
    });

    // Restore
    it("deve restaurar um filme existente", () => {

        const id = "9b2f6d1e-5a7c-4c3e-8f10-2d4b6a8c0e12";

        const movie = Movie.restore(
            id,
            genreId,
            "Matrix",
            1999,
            136,
            6.5,
            4,
            false,
            "Lana Wachowski",
            "Sinopse",
            "https://exemplo.com/matrix.jpg",
        );

        expect(movie.getId()).toBe(id);
        expect(movie.getGenreId()).toBe(genreId);
        expect(movie.getTitle()).toBe("Matrix");
        expect(movie.getYear()).toBe(1999);
        expect(movie.getDuration()).toBe(136);
        expect(movie.getDailyPrice()).toBe(6.5);
        expect(movie.getStock()).toBe(4);
        expect(movie.isActive()).toBe(false);
        expect(movie.getDirector()).toBe("Lana Wachowski");
        expect(movie.getSynopsis()).toBe("Sinopse");
        expect(movie.getCover()).toBe("https://exemplo.com/matrix.jpg");
    });
});
