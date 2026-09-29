import { Router } from "express";
import GeneroController from "../controller/GeneroController.js";

const router = Router();

router.get("/", GeneroController.getAll);
router.get("/:id", GeneroController.getById);
router.post("/", GeneroController.create);
router.put("/:id", GeneroController.update);
router.delete("/:id", GeneroController.remove);

export default router;