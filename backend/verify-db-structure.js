import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'MediSync2026!Secure',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyDatabase() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS PostgreSQL\n');

    // 1. Listar todas las bases de datos
    console.log('========================================');
    console.log('BASES DE DATOS DISPONIBLES');
    console.log('========================================');
    const databases = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname;
    `);
    console.table(databases.rows);

    // 2. Verificar si existe la base de datos 'medisync'
    const medisyncExists = databases.rows.find(row => row.datname === 'medisync');
    
    if (!medisyncExists) {
      console.log('\n⚠️  La base de datos "medisync" NO existe. Creándola...\n');
      await client.query('CREATE DATABASE medisync;');
      console.log('✅ Base de datos "medisync" creada exitosamente\n');
    } else {
      console.log('\n✅ La base de datos "medisync" existe\n');
    }

    // Desconectar y reconectar a la base de datos medisync
    await client.end();
    
    const medisyncClient = new Client({
      host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: 'MediSync2026!Secure',
      database: 'medisync',
      ssl: {
        rejectUnauthorized: false
      }
    });

    await medisyncClient.connect();
    console.log('✅ Conectado a la base de datos "medisync"\n');

    // 3. Listar todas las tablas en medisync
    console.log('========================================');
    console.log('TABLAS EN LA BASE DE DATOS "medisync"');
    console.log('========================================');
    const tables = await medisyncClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.table(tables.rows);

    // 4. Para cada tabla, mostrar su estructura
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n========================================`);
      console.log(`ESTRUCTURA DE LA TABLA: ${tableName}`);
      console.log(`========================================`);
      
      const columns = await medisyncClient.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.table(columns.rows);

      // Contar registros
      const count = await medisyncClient.query(`SELECT COUNT(*) as total FROM "${tableName}";`);
      console.log(`📊 Total de registros: ${count.rows[0].total}\n`);
    }

    // 5. Verificar enums
    console.log('========================================');
    console.log('TIPOS ENUM DEFINIDOS');
    console.log('========================================');
    const enums = await medisyncClient.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);
    
    if (enums.rows.length > 0) {
      console.table(enums.rows);
    } else {
      console.log('⚠️  No hay tipos ENUM definidos\n');
    }

    await medisyncClient.end();
    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }
}

verifyDatabase();
