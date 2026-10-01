import express from "express";
import generoRoutes from "./routes/generoRoutes.js";
import filmeRoutes from "./routes/filmeRoutes.js";

const app = express();
app.use(express.json());

// =================
// Root
// =================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API Locadora de Filmes",
        version: "1.0.0"
    });
});

// =================
// Gêneros
// =================
app.use("/generos", generoRoutes);

// =================
// Filmes
// =================
app.use("/filmes", filmeRoutes);

export default app;