import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function showAllTables() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         ESTRUCTURA COMPLETA DE LA BASE DE DATOS MEDISYNC          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    await prisma.$connect();
    
    // Obtener todas las tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name
    `;

    console.log(`[INFO] Total de tablas: ${tables.length}\n`);
    console.log('═'.repeat(80));

    for (const [index, table] of tables.entries()) {
      const tableName = table.table_name;
      
      console.log(`\n${index + 1}. [TABLE] TABLA: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(80));

      // Obtener columnas con detalles
      const columns = await prisma.$queryRaw`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      console.log('\n   COLUMNAS:');
      columns.forEach((col, idx) => {
        const nullable = col.is_nullable === 'YES' ? '[NULL]' : '[NOT NULL]';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : '';
        
        console.log(`   ${idx + 1}. ${col.column_name}`);
        console.log(`      Tipo: ${col.data_type}${maxLength}`);
        console.log(`      ${nullable}`);
        if (defaultVal) console.log(`      ${defaultVal}`);
      });

      // Obtener constraints (primary keys, foreign keys, unique)
      const constraints = await prisma.$queryRaw`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = ${tableName}
        ORDER BY tc.constraint_type, kcu.ordinal_position
      `;

      if (constraints.length > 0) {
        console.log('\n   CONSTRAINTS:');
        
        const primaryKeys = constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
        if (primaryKeys.length > 0) {
          console.log('   [PK] PRIMARY KEY:');
          primaryKeys.forEach(pk => {
            console.log(`      - ${pk.column_name}`);
          });
        }

        const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
        if (foreignKeys.length > 0) {
          console.log('   [FK] FOREIGN KEYS:');
          foreignKeys.forEach(fk => {
            console.log(`      - ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
          });
        }

        const uniqueKeys = constraints.filter(c => c.constraint_type === 'UNIQUE');
        if (uniqueKeys.length > 0) {
          console.log('   [UQ] UNIQUE:');
          uniqueKeys.forEach(uk => {
            console.log(`      - ${uk.column_name}`);
          });
        }
      }

      // Obtener índices
      const indexes = await prisma.$queryRaw`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = ${tableName}
        ORDER BY indexname
      `;

      if (indexes.length > 0) {
        console.log('\n   [INDEX] ÍNDICES:');
        indexes.forEach(idx => {
          console.log(`      - ${idx.indexname}`);
        });
      }

      // Contar registros
      try {
        const countResult = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as total FROM "${tableName}"`
        );
        const count = Number(countResult[0].total);
        console.log(`\n   [COUNT] REGISTROS: ${count}`);
      } catch (e) {
        console.log(`\n   [WARNING] No se pudo contar registros`);
      }

      console.log('\n' + '═'.repeat(80));
    }

    // Mostrar información de migraciones
    console.log('\n\n[MIGRATIONS] HISTORIAL DE MIGRACIONES DE PRISMA:');
    console.log('─'.repeat(80));
    
    const migrations = await prisma.$queryRaw`
      SELECT 
        migration_name,
        finished_at,
        applied_steps_count,
        logs
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
    `;

    migrations.forEach((m, idx) => {
      console.log(`\n${idx + 1}. ${m.migration_name}`);
      console.log(`   Aplicada: ${m.finished_at}`);
      console.log(`   Steps: ${m.applied_steps_count}`);
      if (m.logs) {
        console.log(`   Logs: ${m.logs.substring(0, 100)}...`);
      }
    });

    // Resumen final
    console.log('\n\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                           RESUMEN                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log(`\n[INFO] Total de tablas: ${tables.length}`);
    console.log(`[INFO] Migraciones aplicadas: ${migrations.length}`);
    console.log(`[INFO] Base de datos: medisync`);
    console.log(`[INFO] Endpoint: db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com`);
    console.log(`\n[SUCCESS] Análisis completado exitosamente!\n`);

  } catch (error) {
    console.error('\n[ERROR] Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showAllTables();
