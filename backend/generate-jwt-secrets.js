#!/usr/bin/env node

/**
 * Script para generar secretos JWT seguros
 * Uso: node generate-jwt-secrets.js
 */

import crypto from "crypto";

console.log("🔐 Generador de JWT Secrets - MediSync\n");

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

const accessSecret = generateSecret();
const refreshSecret = generateSecret();

console.log("✅ Secretos JWT generados:\n");
console.log("═".repeat(80));
console.log("JWT_ACCESS_SECRET (15 minutos):");
console.log(accessSecret);
console.log("\nJWT_REFRESH_SECRET (7 días):");
console.log(refreshSecret);
console.log("═".repeat(80));

console.log("\n📋 Copia estos valores a tu archivo .env:\n");
console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);

console.log("\n⚠️  IMPORTANTE:");
console.log("  1. Mantén estos valores seguros");
console.log("  2. No los compartas públicamente");
console.log("  3. No los versionices en Git");
console.log("  4. Guárdalos en AWS Secrets Manager para producción");
console.log("  5. Rótalo regularmente en producción\n");
