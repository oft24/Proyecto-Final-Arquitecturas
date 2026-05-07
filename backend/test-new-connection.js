import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  console.log('[INFO] Probando conexión a RDS PostgreSQL...\n');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('[CONFIG] Connection String:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('\n[CONNECTING] Conectando...');
    await client.connect();
    console.log('[SUCCESS] Conexión exitosa!\n');

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('[VERSION] Versión de PostgreSQL:');
    console.log(versionResult.rows[0].version);

    // Listar bases de datos
    console.log('\n[DATABASES] Bases de datos disponibles:');
    const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    dbResult.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });

    // Listar esquemas en la base de datos actual
    console.log('\n[SCHEMAS] Esquemas disponibles:');
    const schemaResult = await client.query('SELECT schema_name FROM information_schema.schemata');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });

    // Listar tablas
    console.log('\n[TABLES] Tablas en el esquema public:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('  [WARNING] No hay tablas creadas aún');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

    await client.end();
    console.log('\n[SUCCESS] Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('\n[ERROR] Error de conexión:', error.message);
    console.error('\n[DETAILS] Detalles del error:', error);
    process.exit(1);
  }
}

testConnection();
