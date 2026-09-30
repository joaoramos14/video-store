import { Router } from "express";
import FilmeController from "../controller/FilmeController.js";

const router = Router();

router.get("/", FilmeController.getAll);
router.get("/:id", FilmeController.getById);
router.post("/", FilmeController.create);
router.put("/:id", FilmeController.update);
router.delete("/:id", FilmeController.remove);

export default router;