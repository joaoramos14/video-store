import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("App - Testes de integração", () => {

    it("deve redirecionar a rota raiz para a documentação", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/api-docs");
    });

    it("deve disponibilizar a documentação do Swagger", async () => {
        const response = await request(app).get("/api-docs/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("swagger-ui");
    });

})
