import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import genreRoutes from "./routes/genreRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";

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
app.use("/genres", genreRoutes);
app.use("/movies", movieRoutes);
app.use("/customers", customerRoutes);
app.use("/rentals", rentalRoutes);

export default app;