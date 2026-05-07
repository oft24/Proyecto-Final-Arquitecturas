import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('[INFO] Probando conexión a RDS PostgreSQL con Prisma...\n');
  console.log('[CONFIG] DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  
  try {
    console.log('\n[CONNECTING] Conectando...');
    
    // Probar conexión con una consulta simple
    await prisma.$connect();
    console.log('[SUCCESS] Conexión exitosa con Prisma!\n');

    // Ejecutar una consulta raw para verificar
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('[VERSION] Versión de PostgreSQL:');
    console.log(result[0].version);

    // Listar bases de datos
    console.log('\n[DATABASES] Bases de datos disponibles:');
    const databases = await prisma.$queryRaw`
      SELECT datname FROM pg_database WHERE datistemplate = false
    `;
    databases.forEach(db => {
      console.log(`  - ${db.datname}`);
    });

    // Listar tablas
    console.log('\n[TABLES] Tablas en el esquema public:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('  [WARNING] No hay tablas creadas aún');
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    console.log('\n[SUCCESS] Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('\n[ERROR] Error de conexión:', error.message);
    console.error('\n[CODE] Código de error:', error.code);
    if (error.meta) {
      console.error('[META] Meta:', error.meta);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
