#!/usr/bin/env node

/**
 * Script para verificar la conexión de Prisma a AWS RDS
 * Uso: node verify-prisma-connection.js
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function verifyConnection() {
  console.log("🔍 Verificando conexión de Prisma...\n");
  
  try {
    // Test 1: Conectar a la base de datos
    console.log("✓ Conectando a la base de datos...");
    await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✓ Conexión establecida correctamente\n");

    // Test 2: Verificar tablas existentes
    console.log("✓ Verificando tablas:");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    tables.forEach((t) => console.log(`  - ${t.table_name}`));
    console.log();

    // Test 3: Contar registros en cada tabla
    console.log("✓ Estadísticas de datos:");
    
    const usuariosCount = await prisma.usuario.count();
    console.log(`  - Usuarios (sistema): ${usuariosCount}`);
    
    const medicosCount = await prisma.medico.count();
    console.log(`  - Médicos: ${medicosCount}`);
    
    const pacientesCount = await prisma.paciente.count();
    console.log(`  - Pacientes: ${pacientesCount}`);
    
    const citasCount = await prisma.cita.count();
    console.log(`  - Citas: ${citasCount}`);
    
    const expedientesCount = await prisma.expediente.count();
    console.log(`  - Expedientes: ${expedientesCount}`);
    
    const notificacionesCount = await prisma.notificacion.count();
    console.log(`  - Notificaciones: ${notificacionesCount}\n`);

    // Test 4: Verificar enums
    console.log("✓ Enumeraciones disponibles en la base de datos:");
    const enums = await prisma.$queryRaw`
      SELECT n.nspname, t.typname, array_agg(e.enumlabel) as values
      FROM pg_catalog.pg_type t
      JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY n.nspname, t.typname
      ORDER BY t.typname
    `;
    
    if (enums.length === 0) {
      console.log("  (No hay enums definidos)");
    } else {
      enums.forEach((e) => {
        console.log(`  - ${e.typname}: ${e.values.join(", ")}`);
      });
    }
    console.log();

    console.log("✅ Verificación completada exitosamente!");
    console.log("\n📊 Configuración detectada:");
    console.log(`  DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 50)}...`);
    console.log(`  JWT_ACCESS_SECRET: ${process.env.JWT_ACCESS_SECRET ? "✓ Configurado" : "✗ No configurado"}`);
    console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "✓ Configurado" : "✗ No configurado"}`);

  } catch (error) {
    console.error("\n❌ Error de conexión:");
    console.error(`  ${error.message}`);
    
    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Sugerencias:");
      console.error("  - Verifica que la instancia RDS esté en ejecución");
      console.error("  - Verifica que el security group permite conexiones desde tu IP");
      console.error("  - Verifica que DATABASE_URL sea correcto");
    } else if (error.code === "ENOTFOUND") {
      console.error("\n💡 Sugerencias:");
      console.error("  - Verifica el nombre de host en DATABASE_URL");
      console.error("  - Verifica tu conexión a Internet");
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();
