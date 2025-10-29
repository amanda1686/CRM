import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME ?? "CRM";
const dbUser = process.env.DB_USER ?? "root";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = Number(process.env.DB_PORT ?? 3306);
const maxPool = Number(process.env.DB_MAX_POOL ?? 10);

let sequelizeInstance;

function createSequelizeInstance() {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  sequelizeInstance = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false,
    pool: {
      max: maxPool,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
    dialectOptions: {
      decimalNumbers: true,
    },
  });

  return sequelizeInstance;
}

export function getSequelize() {
  return createSequelizeInstance();
}

export async function connectDB() {
  const sequelize = getSequelize();
  await sequelize.authenticate();
  console.log(`[db] Conexion a MySQL verificada: ${dbName}`);
  return sequelize;
}

export function getConnection() {
  if (!sequelizeInstance) {
    throw new Error("MySQL no esta conectado. Llama a connectDB() primero.");
  }
  return sequelizeInstance;
}

export async function closeDB() {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = undefined;
    console.log("[db] Conexion a MySQL cerrada");
  }
}

export default {
  connectDB,
  getConnection,
  closeDB,
  get sequelize() {
    return getSequelize();
  },
  async authenticate() {
    return connectDB();
  },
};
