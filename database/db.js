import { readFileSync } from "fs";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME ?? "CRM";
const dbUser = process.env.DB_USER ?? "root";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = Number(process.env.DB_PORT ?? 3306);
const maxPool = Number(process.env.DB_MAX_POOL ?? 10);
const sslEnabled = String(process.env.DB_SSL ?? "").toLowerCase() === "true";
const sslRejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false";

function buildDialectOptions() {
  const options = {
    decimalNumbers: true,
  };

  if (!sslEnabled) {
    return options;
  }

  let ca;
  const inlineCa = process.env.DB_SSL_CA;
  if (inlineCa) {
    ca = inlineCa.replace(/\\n/g, "\n");
  } else if (process.env.DB_SSL_CA_FILE) {
    try {
      ca = readFileSync(process.env.DB_SSL_CA_FILE, "utf8");
    } catch (err) {
      console.warn(`[db] No se pudo leer el archivo CA: ${process.env.DB_SSL_CA_FILE}`, err);
    }
  }

  options.ssl = {
    minVersion: "TLSv1.2",
    rejectUnauthorized: sslRejectUnauthorized,
  };

  if (ca) {
    options.ssl.ca = ca;
  }

  return options;
}

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
    dialectOptions: buildDialectOptions(),
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
