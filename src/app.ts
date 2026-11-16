import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import genreRoutes from "./routes/genreRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

// ==============================
// Root
// ==============================
app.get("/", (req, res) => {
    res.redirect("/api-docs");
});

// ==============================
// Swagger Documentation
// ==============================
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

// ==============================
// Routes
// ==============================

export default app;
app.use("/genres", genreRoutes);