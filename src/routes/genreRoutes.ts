import { Router } from "express";
import GenreController from "../controller/GenreController.js";

const router = Router();

router.get("/", GenreController.getAll);

router.get("/search", GenreController.search);

router.get("/:id", GenreController.getById);

router.get("/:id/movies", GenreController.getMovies);

router.post("/", GenreController.create);

router.put("/:id", GenreController.update);

router.delete("/:id", GenreController.remove);

export default router;
