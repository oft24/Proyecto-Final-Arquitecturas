import { prisma } from './src/config/prisma.js';

async function verifyTables() {
  try {
    console.log('Verificando tablas en AWS RDS...\n');

    // Query directo a PostgreSQL para listar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('Tablas creadas:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    console.log('\nVerificando indices...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `;

    console.log('Indices creados:');
    indexes.forEach(i => console.log(`  - ${i.indexname} en ${i.tablename}`));

    console.log('\nBase de datos verificada exitosamente en AWS RDS');
    console.log(`Host: db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com`);
    console.log(`Database: medisync\n`);

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
