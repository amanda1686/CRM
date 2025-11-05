import { Router } from "express";
import { listarTestigos, crearTestigo } from "../Controllers/testigos.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listarTestigos);
router.post("/", crearTestigo);

export default router;
