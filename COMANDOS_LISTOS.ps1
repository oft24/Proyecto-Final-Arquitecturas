#!/usr/bin/env pwsh

# 🚀 COMANDOS LISTOS PARA EJECUTAR - MediSync
# Copia y pega cada sección en tu terminal PowerShell
# Usa: . .\COMANDOS_LISTOS.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📋 COMANDOS LISTOS PARA COPIAR Y EJECUTAR - MEDISYNC             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

function Show-Menu {
    Write-Host ""
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Setup Inicial (ejecutar UNA SOLA VEZ)" -ForegroundColor Green
    Write-Host "  2. Iniciar Backend (Terminal 1)" -ForegroundColor Cyan
    Write-Host "  3. Iniciar Frontend (Terminal 2)" -ForegroundColor Magenta
    Write-Host "  4. Ejecutar Pruebas (Terminal 3)" -ForegroundColor Yellow
    Write-Host "  5. Verificar Conexión a BD" -ForegroundColor Blue
    Write-Host "  6. Generar JWT Secrets" -ForegroundColor Green
    Write-Host "  7. Validar Datos de Entrada" -ForegroundColor Cyan
    Write-Host "  8. Ver Base de Datos (Prisma Studio)" -ForegroundColor Magenta
    Write-Host "  9. Iniciar TODO de una vez" -ForegroundColor Red
    Write-Host "  0. Salir" -ForegroundColor Gray
    Write-Host ""
}

function Step1-Setup {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Green
    Write-Host "PASO 1️⃣ : SETUP INICIAL" -ForegroundColor Green
    Write-Host "═".PadRight(80, "═") -ForegroundColor Green
    Write-Host ""
    Write-Host "Ejecuta estos comandos en tu terminal:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "node setup-dev.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Esto verificará:" -ForegroundColor Gray
    Write-Host "  ✓ Node.js instalado" -ForegroundColor Gray
    Write-Host "  ✓ Archivo .env existe" -ForegroundColor Gray
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Gray
    Write-Host "  ✓ Prisma cliente generado" -ForegroundColor Gray
    Write-Host "  ✓ Conexión a BD funciona" -ForegroundColor Gray
    Write-Host ""
}

function Step2-Backend {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Cyan
    Write-Host "PASO 2️⃣ : INICIAR BACKEND (Abre una NUEVA terminal)" -ForegroundColor Cyan
    Write-Host "═".PadRight(80, "═") -ForegroundColor Cyan
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Esperado:" -ForegroundColor Gray
    Write-Host "  MediSync API running on http://localhost:4000" -ForegroundColor Gray
    Write-Host ""
}

function Step3-Frontend {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Magenta
    Write-Host "PASO 3️⃣ : INICIAR FRONTEND (Abre una NUEVA terminal)" -ForegroundColor Magenta
    Write-Host "═".PadRight(80, "═") -ForegroundColor Magenta
    Write-Host ""
    Write-Host "cd frontend" -ForegroundColor Cyan
    Write-Host "npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Esperado:" -ForegroundColor Gray
    Write-Host "  Local: http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
}

function Step4-Tests {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Yellow
    Write-Host "PASO 4️⃣ : EJECUTAR PRUEBAS (Abre una NUEVA terminal)" -ForegroundColor Yellow
    Write-Host "═".PadRight(80, "═") -ForegroundColor Yellow
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "node test-auth-complete.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Espera a ver:" -ForegroundColor Gray
    Write-Host "  ✅ Registro de Médico funcionando" -ForegroundColor Gray
    Write-Host "  ✅ Registro de Paciente funcionando" -ForegroundColor Gray
    Write-Host "  ✅ Login funcionando" -ForegroundColor Gray
    Write-Host ""
}

function Step5-VerifyDB {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Blue
    Write-Host "VERIFICAR CONEXIÓN A BASE DE DATOS" -ForegroundColor Blue
    Write-Host "═".PadRight(80, "═") -ForegroundColor Blue
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "npm run verify:connection" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Debe mostrar ✅ Verificación completada exitosamente!" -ForegroundColor Gray
    Write-Host ""
}

function Step6-JWTSecrets {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Green
    Write-Host "GENERAR JWT SECRETS SEGUROS" -ForegroundColor Green
    Write-Host "═".PadRight(80, "═") -ForegroundColor Green
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "npm run jwt:generate" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego copia los valores a backend/.env:" -ForegroundColor Yellow
    Write-Host "  JWT_ACCESS_SECRET=<valor generado>" -ForegroundColor Gray
    Write-Host "  JWT_REFRESH_SECRET=<valor generado>" -ForegroundColor Gray
    Write-Host ""
}

function Step7-ValidateInput {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Cyan
    Write-Host "VALIDAR DATOS DE ENTRADA" -ForegroundColor Cyan
    Write-Host "═".PadRight(80, "═") -ForegroundColor Cyan
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "npm run validate:input" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Simula las validaciones del backend:" -ForegroundColor Gray
    Write-Host "  ✓ Muestra qué datos son válidos" -ForegroundColor Gray
    Write-Host "  ✓ Muestra qué datos son inválidos" -ForegroundColor Gray
    Write-Host "  ✓ Proporciona ejemplos correctos" -ForegroundColor Gray
    Write-Host ""
}

function Step8-PrismaStudio {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Magenta
    Write-Host "VER BASE DE DATOS (Prisma Studio)" -ForegroundColor Magenta
    Write-Host "═".PadRight(80, "═") -ForegroundColor Magenta
    Write-Host ""
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "npx prisma studio" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego abre: http://localhost:5555" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Aquí puedes:" -ForegroundColor Gray
    Write-Host "  ✓ Ver todos los médicos registrados" -ForegroundColor Gray
    Write-Host "  ✓ Ver todos los pacientes registrados" -ForegroundColor Gray
    Write-Host "  ✓ Ver todos los usuarios del sistema" -ForegroundColor Gray
    Write-Host "  ✓ Editar datos directamente" -ForegroundColor Gray
    Write-Host ""
}

function Step9-StartAll {
    Write-Host ""
    Write-Host "═".PadRight(80, "═") -ForegroundColor Red
    Write-Host "INICIAR TODO DE UNA VEZ" -ForegroundColor Red
    Write-Host "═".PadRight(80, "═") -ForegroundColor Red
    Write-Host ""
    Write-Host "Opción A: Script automático (Node.js)" -ForegroundColor Yellow
    Write-Host "  node start-all.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opción B: Script PowerShell (Windows)" -ForegroundColor Yellow
    Write-Host "  .\start-medisync.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Esto ejecutará:" -ForegroundColor Gray
    Write-Host "  1. Setup automático" -ForegroundColor Gray
    Write-Host "  2. Backend en nueva ventana" -ForegroundColor Gray
    Write-Host "  3. Frontend en nueva ventana" -ForegroundColor Gray
    Write-Host ""
}

# Loop principal
do {
    Show-Menu
    $choice = Read-Host "Opción"
    
    Clear-Host
    
    switch ($choice) {
        "1" { Step1-Setup }
        "2" { Step2-Backend }
        "3" { Step3-Frontend }
        "4" { Step4-Tests }
        "5" { Step5-VerifyDB }
        "6" { Step6-JWTSecrets }
        "7" { Step7-ValidateInput }
        "8" { Step8-PrismaStudio }
        "9" { Step9-StartAll }
        "0" { 
            Write-Host "¡Adiós! 👋" -ForegroundColor Green
            exit 
        }
        default { 
            Write-Host "Opción inválida" -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "0") {
        Read-Host "Presiona Enter para continuar..."
        Clear-Host
    }
} while ($true)
