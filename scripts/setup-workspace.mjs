import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const backendDir = join(root, "backend");
const pythonDir = join(root, "services", "python");

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureBackendEnv() {
  const envPath = join(backendDir, ".env");
  const envExamplePath = join(backendDir, ".env.example");
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log("Creado backend/.env desde .env.example");
  }
}

ensureBackendEnv();

run("npm", ["install", "--prefix", "frontend"]);
run("npm", ["install", "--prefix", "backend"]);
run("npm", ["run", "prisma:generate", "--prefix", "backend"]);
run("python", ["-m", "pip", "install", "-r", join(pythonDir, "requirements.txt")]);

console.log("Instalacion completa.");
