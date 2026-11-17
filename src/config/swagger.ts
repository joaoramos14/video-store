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

                Movie: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            readOnly: true,
                        },
                        genre_id: {
                            type: "string",
                            format: "uuid",
                            example: "bdf4183d-79a0-4f6f-8ead-03400eb6ed60",
                        },
                        title: { type: "string", example: "Matrix" },
                        director: { type: "string", example: "Lana Wachowski" },
                        synopsis: {
                            type: "string",
                            example: "Um hacker descobre que a realidade é uma simulação.",
                        },
                        year: { type: "integer", minimum: 1888, example: 1999 },
                        duration: { type: "integer", minimum: 1, example: 136 },
                        cover: {
                            type: "string",
                            format: "uri",
                            example: "https://exemplo.com/capas/matrix.jpg",
                        },
                        stock: { type: "integer", minimum: 0, example: 5 },
                        daily_price: { type: "number", minimum: 0, example: 6.5 },
                        active: { type: "boolean", example: true },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            readOnly: true,
                        },
                    },
                },
                CreateMovie: {
                    type: "object",
                    required: ["genre_id", "title", "year", "duration", "daily_price"],
                    properties: {
                        genre_id: {
                            type: "string",
                            format: "uuid",
                            example: "bdf4183d-79a0-4f6f-8ead-03400eb6ed60",
                        },
                        title: { type: "string", example: "Matrix" },
                        director: { type: "string", example: "Lana Wachowski" },
                        synopsis: {
                            type: "string",
                            example: "Um hacker descobre que a realidade é uma simulação.",
                        },
                        year: { type: "integer", minimum: 1888, example: 1999 },
                        duration: { type: "integer", minimum: 1, example: 136 },
                        cover: {
                            type: "string",
                            format: "uri",
                            example: "https://exemplo.com/capas/matrix.jpg",
                        },
                        stock: { type: "integer", minimum: 0, default: 0, example: 5 },
                        daily_price: { type: "number", minimum: 0, example: 6.5 },
                    },
                },
                UpdateMovie: {
                    type: "object",
                    properties: {
                        genre_id: {
                            type: "string",
                            format: "uuid",
                            example: "bdf4183d-79a0-4f6f-8ead-03400eb6ed60",
                        },
                        title: { type: "string", example: "Matrix" },
                        director: { type: "string", example: "Lana Wachowski" },
                        synopsis: {
                            type: "string",
                            example: "Um hacker descobre que a realidade é uma simulação.",
                        },
                        year: { type: "integer", minimum: 1888, example: 1999 },
                        duration: { type: "integer", minimum: 1, example: 136 },
                        cover: {
                            type: "string",
                            format: "uri",
                            example: "https://exemplo.com/capas/matrix.jpg",
                        },
                        stock: { type: "integer", minimum: 0, example: 5 },
                        daily_price: { type: "number", minimum: 0, example: 6.5 },
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
