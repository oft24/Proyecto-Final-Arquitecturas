import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

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

function ensureServerEnv() {
  const envPath = join(root, "server", ".env");
  const envExamplePath = join(root, "server", ".env.example");
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log("Creado server/.env desde .env.example");
  }
}

ensureServerEnv();

run("npm", ["install", "--prefix", "client"]);
run("npm", ["install", "--prefix", "server"]);
run("npm", ["run", "prisma:generate", "--prefix", "server"]);
run("python", ["-m", "pip", "install", "-r", "python_service/requirements.txt"]);

console.log("Instalacion completa.");
