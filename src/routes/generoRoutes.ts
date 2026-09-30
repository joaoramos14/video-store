import { Router } from "express";
import GeneroController from "../controller/GeneroController.js";
import FilmeController from "../controller/FilmeController.js";

const router = Router();

router.get("/", GeneroController.getAll);
router.get("/:id", GeneroController.getById);
router.post("/", GeneroController.create);
router.put("/:id", GeneroController.update);
router.delete("/:id", GeneroController.remove);
router.get("/:id/filmes", FilmeController.getByGenero);

export default router;