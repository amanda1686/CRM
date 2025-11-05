import { Router } from "express";
import { listarTasaciones, crearTasacion } from "../Controllers/tasaciones.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listarTasaciones);
router.post("/", crearTasacion);

export default router;
