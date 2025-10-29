import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

export const NIVELES_PERMITIDOS = new Set([1, 2, 3]);
export const ESTADOS_VALIDOS = ["activo", "pendiente", "inactivo"];
export const ID_COAPI_ENUM = ["Colegiado", "Asociado", "Invitado"];

const EjercienteModel = sequelize.define(
  "Ejerciente",
  {
    IdEjerciente: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Num_api: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      unique: false,
    },
    Nombre: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    Apellidos: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    Nombre_Comercial: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    Direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    Localidad: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    Provincia: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    telefono_1: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    telefono_2: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    fax: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Movil: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: true,
      unique: true,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    imagen: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    usuario: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Colegio: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    apilocal: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    web: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tasapi: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    visados: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    IdCoapi: {
      type: DataTypes.ENUM(...ID_COAPI_ENUM),
      defaultValue: "Colegiado",
      allowNull: false,
    },
    Nivel: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
      validate: {
        isIn: [Array.from(NIVELES_PERMITIDOS)],
      },
    },
    imgcom: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_VALIDOS),
      defaultValue: "pendiente",
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ejercientes",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      { unique: false, fields: ["Num_api"] },
      { unique: true, fields: ["usuario"] },
      { unique: false, fields: ["email"] },
    ],
  }
);

const originalFindByPk = EjercienteModel.findByPk.bind(EjercienteModel);

EjercienteModel.findByPk = (id, options) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return Promise.resolve(null);
  }
  return originalFindByPk(numericId, options);
};

EjercienteModel.destroyByPk = async (id) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return { deletedCount: 0 };
  }
  const deletedCount = await EjercienteModel.destroy({
    where: { IdEjerciente: numericId },
  });
  return { deletedCount };
};

EjercienteModel.prototype.toJSON = function toJSON() {
  const values = { ...this.get({ plain: true }) };
  values.id = values.IdEjerciente ?? values.id ?? null;
  return values;
};

export default EjercienteModel;

export function validarEjerciente(data) {
  const errores = [];
  if (data.Num_api !== undefined && data.Num_api !== null && data.Num_api !== "") {
    if (Number.isNaN(Number(data.Num_api))) errores.push("Num_api debe ser un numero");
  }
  if (data.cp !== undefined && data.cp !== null && data.cp !== "") {
    if (Number.isNaN(Number(data.cp))) errores.push("cp debe ser un numero");
  }
  if (data.telefono_1 !== undefined && data.telefono_1 !== null && data.telefono_1 !== "") {
    if (Number.isNaN(Number(data.telefono_1))) errores.push("telefono_1 debe ser un numero");
  }
  if (data.telefono_2 !== undefined && data.telefono_2 !== null && data.telefono_2 !== "") {
    if (Number.isNaN(Number(data.telefono_2))) errores.push("telefono_2 debe ser un numero");
  }
  if (data.Nivel !== undefined && data.Nivel !== null) {
    const nivelNumero = Number(data.Nivel);
    if (Number.isNaN(nivelNumero)) {
      errores.push("Nivel debe ser un numero");
    } else if (!NIVELES_PERMITIDOS.has(nivelNumero)) {
      errores.push("Nivel debe ser 1, 2 o 3");
    }
  }
  return errores;
}
