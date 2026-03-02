import { Op, QueryTypes } from "sequelize";
import TestigosModel, { validarTestigo } from "../Models/testigos.js";
import EjercienteModel from "../Models/ejercientes.js";
import db from "../database/db.js";

const EJERCIENTE_ATTRIBUTES = [
  "IdEjerciente",
  "Num_api",
  "Nombre",
  "Apellidos",
  "Nombre_Comercial",
  "Localidad",
  "Provincia",
  "email",
  "telefono_1",
  "telefono_2",
  "estado",
];

function sanitizeTestigos(testigos) {
  if (!testigos) return testigos;
  const data = { ...testigos };

  if (data.Num_api !== undefined && data.Num_api !== null) {
    data.detalleUrl = `/ejercientes/${encodeURIComponent(data.Num_api)}`;
  }

  if (data.ejerciente) {
    const ejerciente = { ...data.ejerciente };
    delete ejerciente.contrasena;
    data.ejerciente = ejerciente;
  }

  return data;
}

function handleControllerError(res, error) {
  console.error("TestigosController error:", error);
  const statusCode = error?.statusCode ?? 500;
  return res.status(statusCode).json({
    error: error?.message ?? "Error interno del servidor",
  });
}

function normalizeNumApi(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return String(numeric);
  return raw;
}

export async function listarTestigos(_req, res) {
  try {
    const testigos = await db.sequelize.query(
      `SELECT
        numero AS id,
        Num_api,
        fecha AS Fecha,
        tipotes AS Tipo,
        cp AS CP,
        dir AS Dir,
        zona,
        valor AS Eur_m2,
        superficie AS Sup_m2,
        tipodir,
        num AS Numero,
        localidad,
        provincia,
        pais,
        lat,
        lng
      FROM testigos
      ORDER BY fecha DESC, numero DESC`,
      { type: QueryTypes.SELECT }
    );

    const numApis = Array.from(
      new Set(
        testigos
          .map((testigo) => normalizeNumApi(testigo.Num_api))
          .filter(Boolean)
      )
    );

    const ejercientes = numApis.length
      ? await EjercienteModel.findAll({
          where: {
            Num_api: {
              [Op.in]: numApis,
            },
          },
          attributes: EJERCIENTE_ATTRIBUTES,
          raw: true,
        })
      : [];

    const ejercienteMap = new Map(
      ejercientes
        .map((ejerciente) => [normalizeNumApi(ejerciente.Num_api), ejerciente])
        .filter(([key]) => key)
    );

    const items = testigos.map((testigo) => {
      const ejerciente = ejercienteMap.get(normalizeNumApi(testigo.Num_api));
      return sanitizeTestigos({
        ...testigo,
        ejerciente: ejerciente ? { ...ejerciente } : undefined,
      });
    });

    res.json(items);
  } catch (error) {
    return handleControllerError(res, error);
  }
}
export async function crearTestigo(req, res) {
  try {
    const payload = { ...(req.body ?? {}) };
    const numApi = Number(payload.Num_api ?? payload.num_api);

    if (!Number.isInteger(numApi)) {
      return res.status(400).json({ error: "Num_api es obligatorio y debe ser numerico" });
    }

    payload.Num_api = numApi;
    const errores = validarTestigo(payload);
    if (errores.length > 0) {
      return res.status(400).json({ error: "Datos invalidos", detalles: errores });
    }

    const ejerciente = await EjercienteModel.findOne({
      where: { Num_api: numApi },
      attributes: EJERCIENTE_ATTRIBUTES,
      raw: true,
    });

    if (!ejerciente) {
      return res.status(404).json({ error: "Ejerciente no encontrado" });
    }

    const normalized = {
      Num_api: numApi,
      Fecha: payload.Fecha ?? payload.fecha ?? undefined,
      Tipo: payload.Tipo ?? payload.tipo ?? undefined,
      CP: payload.CP ?? payload.cp ?? undefined,
      Dir: payload.Dir ?? payload.dir ?? undefined,
      zona: payload.zona ?? payload.Zona ?? undefined,
      Eur_m2: payload.Eur_m2 ?? payload.eur_m2 ?? undefined,
      Operacion: payload.Operacion ?? payload.operacion ?? undefined,
      Sup_m2: payload.Sup_m2 ?? payload.sup_m2 ?? undefined,
    };

    if (normalized.Fecha) {
      normalized.Fecha = new Date(normalized.Fecha);
    }

    ["Eur_m2", "Sup_m2"].forEach((field) => {
      const value = normalized[field];
      if (value !== undefined && value !== null && value !== "") {
        normalized[field] = Number(value);
      } else {
        delete normalized[field];
      }
    });

    ["Tipo", "CP", "Dir", "zona", "Operacion"].forEach((field) => {
      const value = normalized[field];
      if (value === undefined || value === null) {
        delete normalized[field];
      } else {
        const trimmed = String(value).trim();
        if (trimmed) {
          normalized[field] = trimmed;
        } else {
          delete normalized[field];
        }
      }
    });

    const testigo = await TestigosModel.create(normalized);

    return res
      .status(201)
      .json(
        sanitizeTestigos({
          ...(testigo.toJSON ? testigo.toJSON() : testigo),
          ejerciente,
        })
      );
  } catch (error) {
    return handleControllerError(res, error);
  }
}
