import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

const TasacionesModel = sequelize.define(
  "Tasacion",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    Num_api: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    Tipo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Sup_m2: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    Valor_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    Eur_m2: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tasaciones",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

TasacionesModel.prototype.toJSON = function toJSON() {
  return { ...this.get({ plain: true }) };
};

export default TasacionesModel;

export function validarTasacion(data = {}) {
  const errores = [];

  const cp = data.cp;
  if (cp && !/^\d{4,10}$/.test(String(cp))) {
    errores.push("cp debe contener solo digitos (4-10 caracteres)");
  }

  if (data.fecha) {
    const parsedDate = Date.parse(data.fecha);
    if (Number.isNaN(parsedDate)) {
      errores.push("fecha debe tener un formato valido (YYYY-MM-DD)");
    }
  }

  const decimalFields = [
    { key: "Sup_m2", mensaje: "Sup_m2 debe ser un numero" },
    { key: "Valor_total", mensaje: "Valor_total debe ser un numero" },
    { key: "Eur_m2", mensaje: "Eur_m2 debe ser un numero" },
  ];

  decimalFields.forEach(({ key, mensaje }) => {
    const valor = data[key];
    if (valor !== undefined && valor !== null && valor !== "") {
      if (Number.isNaN(Number(valor))) {
        errores.push(mensaje);
      }
    }
  });

  return errores;
}
