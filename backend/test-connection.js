import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔄 Probando conexión a la base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión exitosa a PostgreSQL en EC2!");
    
    // Intentar una consulta simple
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log("📊 Versión de PostgreSQL:", result);
    
  } catch (error) {
    console.error("❌ Error al conectar:", error.message);
    console.error("\n🔍 Posibles causas:");
    console.error("  1. El Security Group de EC2 no permite conexiones en el puerto 5432");
    console.error("  2. PostgreSQL no está configurado para aceptar conexiones remotas");
    console.error("  3. Las credenciales son incorrectas");
    console.error("  4. La base de datos 'medisync' no existe");
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
