import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function verifyAllDatabases() {
  console.log('[INFO] VERIFICACIÓN COMPLETA DE BASES DE DATOS EN RDS\n');
  console.log('=' .repeat(70));
  
  // Conectar a la base de datos postgres (por defecto)
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('[SUCCESS] Conectado a RDS\n');

    // 1. Listar todas las bases de datos
    console.log('[DATABASES] BASES DE DATOS DISPONIBLES:');
    console.log('-'.repeat(70));
    const databases = await prisma.$queryRaw`
      SELECT 
        datname as nombre,
        pg_size_pretty(pg_database_size(datname)) as tamaño,
        (SELECT count(*) 
         FROM pg_stat_user_tables 
         WHERE schemaname = 'public') as num_tablas
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `;
    
    databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.nombre}`);
      console.log(`   Tamaño: ${db.tamaño}`);
    });

    console.log('\n' + '='.repeat(70));
    
    // 2. Verificar cada base de datos
    const dbNames = ['postgres', 'medisync'];
    
    for (const dbName of dbNames) {
      console.log(`\n[CHECKING] VERIFICANDO BASE DE DATOS: ${dbName.toUpperCase()}`);
      console.log('-'.repeat(70));
      
      // Crear conexión específica para esta base de datos
      const dbUrl = process.env.DATABASE_URL.replace(/\/[^\/]*$/, `/${dbName}`);
      const dbPrisma = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl
          }
        }
      });

      try {
        await dbPrisma.$connect();
        
        // Listar tablas
        const tables = await dbPrisma.$queryRaw`
          SELECT 
            table_name,
            (SELECT count(*) FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = t.table_name) as num_columnas
          FROM information_schema.tables t
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        
        if (tables.length === 0) {
          console.log('[WARNING] No hay tablas en esta base de datos\n');
        } else {
          console.log(`[SUCCESS] ${tables.length} tabla(s) encontrada(s):\n`);
          
          for (const table of tables) {
            console.log(`[TABLE] Tabla: ${table.table_name} (${table.num_columnas} columnas)`);
            
            // Obtener columnas de cada tabla
            const columns = await dbPrisma.$queryRaw`
              SELECT 
                column_name,
                data_type,
                is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public' 
              AND table_name = ${table.table_name}
              ORDER BY ordinal_position
            `;
            
            columns.forEach(col => {
              const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
              console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
            });
            
            // Contar registros
            try {
              const countResult = await dbPrisma.$queryRawUnsafe(
                `SELECT COUNT(*) as total FROM "${table.table_name}"`
              );
              console.log(`   [COUNT] Registros: ${countResult[0].total}\n`);
            } catch (e) {
              console.log(`   [WARNING] No se pudo contar registros\n`);
            }
          }
        }
        
        // Verificar migraciones de Prisma
        try {
          const migrations = await dbPrisma.$queryRaw`
            SELECT 
              migration_name,
              finished_at,
              applied_steps_count
            FROM "_prisma_migrations"
            ORDER BY finished_at DESC
            LIMIT 5
          `;
          
          if (migrations.length > 0) {
            console.log('[MIGRATIONS] MIGRACIONES DE PRISMA:');
            migrations.forEach(m => {
              console.log(`   - ${m.migration_name}`);
              console.log(`     Aplicada: ${m.finished_at}`);
              console.log(`     Steps: ${m.applied_steps_count}\n`);
            });
          }
        } catch (e) {
          console.log('[INFO] No hay tabla de migraciones de Prisma\n');
        }
        
        await dbPrisma.$disconnect();
        
      } catch (error) {
        console.log(`[ERROR] Error al conectar a ${dbName}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('[CONFIG] CONEXIÓN ACTUAL:');
    console.log('-'.repeat(70));
    console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    // Extraer el nombre de la base de datos actual
    const currentDb = process.env.DATABASE_URL.split('/').pop().split('?')[0];
    console.log(`\n[CURRENT] Base de datos actual: ${currentDb}`);
    
    console.log('\n[SUCCESS] Verificación completada!');
    
  } catch (error) {
    console.error('\n[ERROR] Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllDatabases();
