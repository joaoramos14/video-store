import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

describe("Errors - Testes Unitários", () => {

    it("deve criar um NotFoundError com nome e mensagem", () => {
        const error = new NotFoundError("Registro não encontrado.");

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("NotFoundError");
        expect(error.message).toBe("Registro não encontrado.");
    });

    it("deve criar um ValidationError com nome e mensagem", () => {
        const error = new ValidationError("Dados inválidos.");

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("ValidationError");
        expect(error.message).toBe("Dados inválidos.");
    });

})
