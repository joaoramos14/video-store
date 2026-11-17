import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Video Store - API",
            version: "1.0.0",
            description: "API REST para gerenciamento de gêneros, filmes, clientes e locações de uma locadora de filmes.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        tags: [
            {
                name: "Genres",
                description: "Gerenciamento de gêneros",
            },
            {
                name: "Movies",
                description: "Gerenciamento de filmes",
            },
            {
                name: "Customers",
                description: "Gerenciamento de clientes",
            },
            {
                name: "Rentals",
                description: "Gerenciamento de locações",
            },
        ],
        components: {
            schemas: {
                Genre: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            readOnly: true,
                        },
                        name: {
                            type: "string",
                            example: "Ação",
                        },
                        description: {
                            type: "string",
                            example: "Filmes de ação e aventura",
                        },
                        active: {
                            type: "boolean",
                            example: true,
                        },
                    },
                },
                CreateGenre: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", example: "Ação" },
                        description: { type: "string", example: "Filmes de ação e aventura" },
                    },
                },
                UpdateGenre: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Ação" },
                        description: { type: "string", example: "Filmes de ação e aventura" },
                        active: { type: "boolean", example: true },
                    },
                },

                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Erro ao processar solicitação."
                        },
                    },
                },
            }
        }
    },

    apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
