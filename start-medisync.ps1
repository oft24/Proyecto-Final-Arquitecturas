# 🚀 Script de Inicio - MediSync (Windows PowerShell)
# Este script inicia el setup y los servidores
# Uso: .\start-medisync.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                    🚀 MEDISYNC - INICIO DESARROLLO                         ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado" -ForegroundColor Red
    Write-Host "Descargalo desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar archivos
$backendDir = ".\backend"
$frontendDir = ".\frontend"

if (!(Test-Path $backendDir)) {
    Write-Host "✗ Carpeta backend no encontrada" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "$backendDir\.env")) {
    Write-Host "✗ Archivo backend\.env no encontrado" -ForegroundColor Red
    Write-Host "💡 Copia el contenido de .env.example a .env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1️⃣ EJECUTANDO SETUP" -ForegroundColor Cyan
Write-Host "─".PadRight(80, "─") -ForegroundColor Cyan
Write-Host ""

# Setup
Push-Location $backendDir
node setup-dev.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Setup falló" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "2️⃣ INICIANDO SERVIDORES" -ForegroundColor Cyan
Write-Host "─".PadRight(80, "─") -ForegroundColor Cyan
Write-Host ""

# Backend en nueva ventana
Write-Host "🔌 Iniciando Backend (Puerto 4000)..." -ForegroundColor Green
Start-Process -FilePath "PowerShell" -ArgumentList "-NoExit -Command `"cd backend; npm run dev`"" -WindowStyle Normal

# Esperar un poco
Start-Sleep -Seconds 3

# Frontend en nueva ventana
if (Test-Path $frontendDir) {
    Write-Host "🎨 Iniciando Frontend (Puerto 5173)..." -ForegroundColor Green
    Start-Process -FilePath "PowerShell" -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`"" -WindowStyle Normal
} else {
    Write-Host "⚠️  Carpeta frontend no encontrada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                        ✅ MEDISYNC INICIADO                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend:   http://localhost:4000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Para ejecutar pruebas en otra terminal PowerShell:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   node test-auth-complete.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentación: INSTRUCCIONES_EJECUCION.md" -ForegroundColor Yellow
Write-Host ""
