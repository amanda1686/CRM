import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

const TasacionesModel = sequelize.define(
  "Tasacion",
  {
    sess: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    ref: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false,
    },
    Num_api: {
      type: DataTypes.STRING(9),
      allowNull: false,
      field: "api",
    },
    Tipo: {
      type: DataTypes.STRING(25),
      allowNull: true,
      field: "tipo",
    },
    Direccion: {
      type: DataTypes.STRING(60),
      allowNull: true,
      field: "dir",
    },
    Numero: {
      type: DataTypes.STRING(25),
      allowNull: true,
      field: "num",
    },
    cp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "tasa",
    timestamps: false,
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
