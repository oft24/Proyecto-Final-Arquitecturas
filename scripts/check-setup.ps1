# Script para verificar que todo está configurado correctamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificación de Configuración MediSync" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Verificar archivo .pem
Write-Host "1. Verificando archivo .pem..." -ForegroundColor Yellow
if (Test-Path "labsuser (4).pem") {
    Write-Host "   ✅ Archivo labsuser (4).pem encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Archivo labsuser (4).pem NO encontrado" -ForegroundColor Red
    $allGood = $false
}

# 2. Verificar archivo .env del backend
Write-Host "2. Verificando configuración del backend..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -match "ec2-13-221-29-239.compute-1.amazonaws.com") {
        Write-Host "   ✅ DATABASE_URL configurada para EC2" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  DATABASE_URL no apunta a EC2" -ForegroundColor Yellow
        $allGood = $false
    }
    
    if ($envContent -match "admin123!") {
        Write-Host "   ✅ Contraseña configurada" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Contraseña no configurada correctamente" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Archivo backend/.env NO encontrado" -ForegroundColor Red
    $allGood = $false
}

# 3. Verificar node_modules del backend
Write-Host "3. Verificando dependencias del backend..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Dependencias NO instaladas. Ejecuta: cd backend && npm install" -ForegroundColor Yellow
    $allGood = $false
}

# 4. Verificar node_modules del frontend
Write-Host "4. Verificando dependencias del frontend..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Dependencias NO instaladas. Ejecuta: cd frontend && npm install" -ForegroundColor Yellow
    $allGood = $false
}

# 5. Verificar Prisma Client
Write-Host "5. Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules/.prisma/client") {
    Write-Host "   ✅ Prisma Client generado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Prisma Client NO generado. Ejecuta: cd backend && npx prisma generate" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ Todo está configurado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Configura PostgreSQL en EC2:" -ForegroundColor White
    Write-Host "      .\scripts\setup-remote-db.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   2. Prueba la conexión:" -ForegroundColor White
    Write-Host "      cd backend" -ForegroundColor Cyan
    Write-Host "      node test-connection.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   3. Ejecuta las migraciones:" -ForegroundColor White
    Write-Host "      cd backend" -ForegroundColor Cyan
    Write-Host "      npx prisma migrate deploy" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   4. Inicia el proyecto:" -ForegroundColor White
    Write-Host "      npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Hay algunos problemas que resolver" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Acciones recomendadas:" -ForegroundColor Yellow
    Write-Host "   1. Instala las dependencias:" -ForegroundColor White
    Write-Host "      npm run setup" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   2. Verifica el archivo .env:" -ForegroundColor White
    Write-Host "      backend/.env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   3. Lee la guía completa:" -ForegroundColor White
    Write-Host "      SETUP-DATABASE.md" -ForegroundColor Cyan
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
