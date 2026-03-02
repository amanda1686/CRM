import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

const TestigosModel = sequelize.define(
  "Testigo",
  {
    numero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    Num_api: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "fecha",
    },
    Tipo: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: "tipotes",
    },
    CP: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cp",
    },
    Dir: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "dir",
    },
    zona: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Eur_m2: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "valor",
    },
    Sup_m2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "superficie",
    },
    Operacion: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "tipoinm",
    },
  },
  {
    tableName: "testigos",
    timestamps: false,
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
