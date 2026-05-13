import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

// Conectar a la base de datos por defecto "postgres" para crear "medisync"
// Reemplaza el nombre de la BD en la URL por "postgres"
const adminUrl = process.env.DATABASE_URL.replace(/\/[^/]+(\?|$)/, '/postgres$1');

const client = new Client({
  connectionString: adminUrl,
  ssl: { rejectUnauthorized: false },
});

async function createDatabase() {
  try {
    console.log("🔄 Conectando a RDS PostgreSQL...");
    await client.connect();
    console.log("✅ Conectado!");

    // Verificar si la base de datos ya existe
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'medisync'`
    );

    if (res.rowCount > 0) {
      console.log("✅ La base de datos 'medisync' ya existe.");
    } else {
      console.log("🗄️  Creando base de datos 'medisync'...");
      await client.query("CREATE DATABASE medisync");
      console.log("✅ Base de datos 'medisync' creada exitosamente!");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

createDatabase();
