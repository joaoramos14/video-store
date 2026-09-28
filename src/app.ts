import express from "express";
import generoRoutes from "./routes/generoRoutes.js";
import filmeRoutes from "./routes/filmeRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API Locadora de Filmes",
        version: "1.0.0"
    });
});

app.use("/generos", generoRoutes);
app.use("/filmes", filmeRoutes);

export default app;