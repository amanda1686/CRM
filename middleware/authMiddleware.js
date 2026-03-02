import EjercienteModel from "../Models/ejercientes.js";
import { verifyAccessToken, sanitizeUser } from "../Utils/auth.js";

const ADMIN_LEVEL = 1;
const USER_LEVELS = new Set([2, 3]);

function normalizeNivel(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function authenticate(req, res, next) {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }

    const authHeader = req.headers?.authorization ?? "";
    const [scheme, token] = authHeader.split(" ");
    if (!token || scheme?.toLowerCase() !== "bearer") {
      return res.status(401).json({ error: "Autenticacion requerida" });
    }

    const decoded = verifyAccessToken(token);
    const authId = Number(decoded?.IdEjerciente ?? decoded?.id);
    if (!Number.isInteger(authId)) {
      return res.status(401).json({ error: "Token invalido" });
    }

    decoded.IdEjerciente = authId;

    const ejerciente = await EjercienteModel.findByPk(authId);
    if (!ejerciente) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.user = sanitizeUser(ejerciente);
    const nivel = normalizeNivel(req.user?.Nivel ?? req.user?.nivel);
    req.userRole = nivel === ADMIN_LEVEL ? "admin" : USER_LEVELS.has(nivel) ? "usuario" : "desconocido";
    req.auth = decoded;
    return next();
  } catch (err) {
    console.error("[auth] Error autenticando:", err);
    return res.status(401).json({ error: err.message ?? "Token invalido" });
  }
}

export function requireNivel(requiredNivel = 1, options = {}) {
  return (req, res, next) => {
    const nivel = normalizeNivel(req.user?.Nivel ?? req.user?.nivel);
    if (!Number.isInteger(nivel)) {
      return res.status(403).json({ error: "Nivel del usuario no disponible" });
    }

    const authId = Number(req.auth?.IdEjerciente ?? req.auth?.id);
    if (options.allowSelfUpdate && req.params.id && authId === Number(req.params.id)) {
      return next();
    }

    let allowed = [];
    if (requiredNivel === "admin") {
      allowed = [ADMIN_LEVEL];
    } else if (requiredNivel === "usuario" || requiredNivel === "user") {
      // El admin puede usar endpoints de usuario.
      allowed = [ADMIN_LEVEL, ...USER_LEVELS];
    } else if (Array.isArray(requiredNivel)) {
      allowed = requiredNivel.map((value) => Number(value)).filter(Number.isInteger);
    } else {
      const parsed = Number(requiredNivel);
      if (Number.isInteger(parsed)) {
        allowed = [parsed];
      }
    }

    if (!allowed.includes(nivel)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta accion",
        requiredNivel: allowed.length === 1 ? allowed[0] : allowed,
      });
    }

    return next();
  };
}

export const requireAdmin = requireNivel("admin");
export const requireUsuario = requireNivel("usuario");
