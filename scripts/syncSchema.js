import "dotenv/config";
import db from "../database/db.js";

// Importa los modelos para que Sequelize registre las tablas
import "../Models/ejercientes.js";
import "../Models/communication.js";
import "../Models/notification.js";
import "../Models/tasaciones.js";
import "../Models/testigos.js";

async function main() {
  const sequelize = await db.connectDB();
  // Forzamos la creación de las tablas
  await sequelize.sync({ force: true });
  console.log("[db] Esquema sincronizado y tablas creadas");
  
  // Verificamos las tablas creadas
  const [results] = await sequelize.query('SHOW TABLES;');
  console.log("[db] Tablas creadas:", results);
  
  await db.closeDB();
}

main().catch((error) => {
  console.error("[db] Error sincronizando esquema:", error);
  process.exit(1);
});
