#!/usr/bin/env node

/**
 * 🚀 Script de Inicio Todo en Uno - MediSync
 * Ejecuta setup, backend y frontend en terminales separadas
 * Uso: node start-all.js
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n🚀 INICIANDO MEDISYNC - MODO DESARROLLO\n");
console.log("═".repeat(80));

const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");

// Colores
const colors = {
  reset: "\x1b[0m",
  bg_blue: "\x1b[44m",
  bg_green: "\x1b[42m",
  fg_white: "\x1b[37m",
};

let isSetupDone = false;

function runCommand(command, cwd, label) {
  console.log(
    `\n${colors.bg_blue}${colors.fg_white} ${label} ${colors.reset}`
  );
  console.log(`Ejecutando: ${command}`);
  console.log(`Directorio: ${cwd}`);
  console.log("─".repeat(80));

  const child = spawn("npm", command.split(" ").slice(1), {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`Error en ${label}:`, err.message);
  });

  return child;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Verificar que existan los directorios
  if (!fs.existsSync(backendDir)) {
    console.error("❌ Carpeta backend no encontrada");
    process.exit(1);
  }

  if (!fs.existsSync(frontendDir)) {
    console.warn("⚠️  Carpeta frontend no encontrada");
  }

  // Verificar .env
  const envPath = path.join(backendDir, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Archivo backend/.env no encontrado");
    console.log("💡 Copia el contenido de .env.example a .env");
    process.exit(1);
  }

  console.log("\n1️⃣ EJECUTANDO SETUP\n");

  // Correr setup
  await new Promise((resolve) => {
    const setup = spawn("node", ["setup-dev.js"], {
      cwd: backendDir,
      stdio: "inherit",
      shell: true,
    });

    setup.on("close", (code) => {
      if (code === 0) {
        isSetupDone = true;
        console.log("\n✅ Setup completado\n");
      } else {
        console.error("\n❌ Setup falló");
      }
      resolve();
    });
  });

  if (!isSetupDone) {
    process.exit(1);
  }

  // Esperar un poco antes de iniciar los servidores
  await sleep(2000);

  console.log("\n2️⃣ INICIANDO SERVIDORES\n");

  // Backend
  console.log(
    `${colors.bg_green}${colors.fg_white} BACKEND (Puerto 4000) ${colors.reset}`
  );
  const backend = spawn("npm", ["run", "dev"], {
    cwd: backendDir,
    stdio: "inherit",
    shell: true,
  });

  // Frontend (esperar un poco después del backend)
  await sleep(3000);

  if (fs.existsSync(frontendDir)) {
    console.log(
      `\n${colors.bg_green}${colors.fg_white} FRONTEND (Puerto 5173) ${colors.reset}`
    );
    const frontend = spawn("npm", ["run", "dev"], {
      cwd: frontendDir,
      stdio: "inherit",
      shell: true,
    });

    frontend.on("error", (err) => {
      console.error("Error en frontend:", err.message);
    });
  }

  backend.on("error", (err) => {
    console.error("Error en backend:", err.message);
    process.exit(1);
  });

  // Instrucciones finales
  console.log("\n" + "═".repeat(80));
  console.log("✅ MEDISYNC INICIADO\n");
  console.log("🌐 Frontend:  http://localhost:5173");
  console.log("🔌 Backend:   http://localhost:4000/api/health");
  console.log("\n📝 Para probar en otra terminal:");
  console.log("   cd backend");
  console.log("   node test-auth-complete.js\n");
  console.log("═".repeat(80) + "\n");

  // Mantener el proceso vivo
  process.on("SIGINT", () => {
    console.log("\n👋 Deteniendo servidores...");
    backend.kill();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Error fatal:", err.message);
  process.exit(1);
});
