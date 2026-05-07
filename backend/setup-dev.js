#!/usr/bin/env node

/**
 * 🚀 Setup Inicial - MediSync
 * Verifica y prepara todo el sistema para desarrollo
 * Uso: node setup-dev.js
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n🚀 SETUP INICIAL - MEDISYNC\n");
console.log("═".repeat(80));

// Helper para ejecutar comandos
function run(cmd, cwd = __dirname) {
  try {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { 
      cwd, 
      stdio: "inherit",
      shell: true 
    });
    return true;
  } catch (error) {
    console.error(`✗ Error ejecutando: ${cmd}`);
    return false;
  }
}

// 1. Verificar Node.js
console.log("\n📋 PASO 1: Verificar Node.js");
console.log("─".repeat(80));
try {
  const version = execSync("node --version", { encoding: "utf-8" }).trim();
  console.log(`✓ Node.js ${version}`);
} catch {
  console.error("✗ Node.js no encontrado");
  process.exit(1);
}

// 2. Verificar .env
console.log("\n📋 PASO 2: Verificar configuración (.env)");
console.log("─".repeat(80));
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.error("✗ Archivo .env no encontrado");
  console.log("\n💡 Copia el contenido de .env.example a .env y completa los valores:");
  console.log("   cp .env.example .env");
  process.exit(1);
} else {
  console.log("✓ Archivo .env existe");
  
  const envContent = fs.readFileSync(envPath, "utf-8");
  if (envContent.includes("tu_secret_access_aqui")) {
    console.warn("⚠ JWT_ACCESS_SECRET aún es placeholder");
    console.log("   Ejecuta: npm run jwt:generate");
  } else {
    console.log("✓ JWT_ACCESS_SECRET configurado");
  }
}

// 3. Instalar dependencias backend
console.log("\n📋 PASO 3: Instalar dependencias backend");
console.log("─".repeat(80));
if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
  if (!run("npm install")) {
    process.exit(1);
  }
} else {
  console.log("✓ node_modules ya existe");
}

// 4. Generar cliente Prisma
console.log("\n📋 PASO 4: Generar cliente Prisma");
console.log("─".repeat(80));
if (!run("npm run prisma:generate")) {
  process.exit(1);
}

// 5. Verificar conexión a BD
console.log("\n📋 PASO 5: Verificar conexión a Base de Datos");
console.log("─".repeat(80));
if (!run("node verify-prisma-connection.js")) {
  console.error("\n✗ No se puede conectar a la base de datos");
  console.log("\n💡 Soluciones:");
  console.log("   1. Verifica que RDS esté en ejecución en AWS");
  console.log("   2. Verifica que DATABASE_URL sea correcto en .env");
  console.log("   3. Verifica que el security group permita tu IP");
  console.log("   4. Ejecuta: npm run verify:connection");
  process.exit(1);
}

// 6. Instalar dependencias frontend
console.log("\n📋 PASO 6: Instalar dependencias frontend");
console.log("─".repeat(80));
const frontendDir = path.join(__dirname, "..", "frontend");
if (fs.existsSync(frontendDir)) {
  if (!fs.existsSync(path.join(frontendDir, "node_modules"))) {
    if (!run("npm install", frontendDir)) {
      console.warn("⚠ Error instalando dependencias frontend (continuar)");
    }
  } else {
    console.log("✓ node_modules frontend ya existe");
  }
} else {
  console.warn("⚠ Carpeta frontend no encontrada");
}

// Resumen final
console.log("\n" + "═".repeat(80));
console.log("✅ SETUP COMPLETADO\n");
console.log("🚀 Para iniciar desarrollo:");
console.log("\n   Terminal 1 (Backend):");
console.log("   $ cd backend");
console.log("   $ npm run dev\n");
console.log("   Terminal 2 (Frontend):");
console.log("   $ cd frontend");
console.log("   $ npm run dev\n");
console.log("   Terminal 3 (Testing - opcional):");
console.log("   $ cd backend");
console.log("   $ node test-api.js\n");
console.log("📱 Accede a: http://localhost:5173");
console.log("═".repeat(80) + "\n");
