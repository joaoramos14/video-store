import { Router } from "express";
import CustomerController from "../controller/CustomerController.js";

const router = Router();

router.get("/", CustomerController.getAll);

router.get("/search", CustomerController.search);

router.get("/:id", CustomerController.getById);

router.get("/:id/rentals", CustomerController.getRentals);

router.post("/", CustomerController.create);

router.put("/:id", CustomerController.update);

router.delete("/:id", CustomerController.remove);

export default router;
