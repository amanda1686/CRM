import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

const TestigosModel = sequelize.define(
  "Testigo",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    Num_api: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    Fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Tipo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CP: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    Dir: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    zona: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Eur_m2: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    Operacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Sup_m2: {
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
    tableName: "testigos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

TestigosModel.prototype.toJSON = function toJSON() {
  return { ...this.get({ plain: true }) };
};

export default TestigosModel;

export function validarTestigo(data = {}) {
  const errores = [];

  const cp = data.CP ?? data.cp;
  if (cp && !/^\d{4,10}$/.test(String(cp))) {
    errores.push("CP debe contener solo digitos (4-10 caracteres)");
  }

  const fecha = data.Fecha ?? data.fecha;
  if (fecha) {
    const parsedDate = Date.parse(fecha);
    if (Number.isNaN(parsedDate)) {
      errores.push("Fecha debe tener un formato valido (YYYY-MM-DD)");
    }
  }

  const decimalFields = [
    { key: "Sup_m2", mensaje: "Sup_m2 debe ser un numero" },
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
