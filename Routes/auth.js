import { Router } from "express";
import { login, getProfile, updateProfile } from "../Controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/login", (_req, res) => {
  return res.status(405).json({ error: "Usa POST /auth/login para iniciar sesion" });
});
router.post("/login", login);
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);

export default router;
