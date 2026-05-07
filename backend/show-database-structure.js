import { prisma } from './src/config/prisma.js';

async function showDatabaseStructure() {
  try {
    console.log('\n===========================================');
    console.log('BASE DE DATOS: medisync');
    console.log('HOST: db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com');
    console.log('===========================================\n');

    // Listar todas las tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log('TABLAS CREADAS:');
    console.log('---------------');
    tables.forEach((t, i) => {
      console.log(`${i + 1}. ${t.table_name}`);
    });

    console.log('\n===========================================\n');

    // Mostrar estructura de cada tabla
    for (const table of tables) {
      if (table.table_name === '_prisma_migrations') continue;

      console.log(`TABLA: ${table.table_name.toUpperCase()}`);
      console.log('='.repeat(50));

      const columns = await prisma.$queryRaw`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;

      console.log('\nCOLUMNAS:');
      columns.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name.padEnd(25)} ${type.padEnd(20)} ${nullable.padEnd(10)} ${defaultVal}`);
      });

      // Mostrar foreign keys
      const foreignKeys = await prisma.$queryRaw`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = ${table.table_name};
      `;

      if (foreignKeys.length > 0) {
        console.log('\nFOREIGN KEYS:');
        foreignKeys.forEach(fk => {
          console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        });
      }

      // Mostrar índices
      const indexes = await prisma.$queryRaw`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = ${table.table_name}
        AND indexname NOT LIKE '%_pkey'
        ORDER BY indexname;
      `;

      if (indexes.length > 0) {
        console.log('\nINDICES:');
        indexes.forEach(idx => {
          console.log(`  - ${idx.indexname}`);
        });
      }

      console.log('\n');
    }

    // Contar registros en cada tabla
    console.log('===========================================');
    console.log('CONTEO DE REGISTROS');
    console.log('===========================================\n');

    for (const table of tables) {
      if (table.table_name === '_prisma_migrations') continue;
      
      const count = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM ${table.table_name}`
      );
      console.log(`${table.table_name.padEnd(20)} : ${count[0].count} registros`);
    }

    console.log('\n===========================================\n');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showDatabaseStructure();
