# Script para conectar a EC2 desde PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conectando a EC2..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Host: ec2-13-221-29-239.compute-1.amazonaws.com" -ForegroundColor Yellow
Write-Host "Usuario: ec2-user" -ForegroundColor Yellow
Write-Host ""

# Obtener el directorio del script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$pemFile = Join-Path $projectRoot "labsuser (4).pem"

# Verificar que el archivo .pem existe
if (-not (Test-Path $pemFile)) {
    Write-Host "❌ Error: No se encuentra el archivo labsuser (4).pem" -ForegroundColor Red
    exit 1
}

# Configurar permisos del archivo .pem (solo en Windows)
Write-Host "🔐 Configurando permisos del archivo .pem..." -ForegroundColor Yellow
icacls $pemFile /inheritance:r | Out-Null
icacls $pemFile /grant:r "$env:USERNAME`:R" | Out-Null
Write-Host "✅ Permisos configurados" -ForegroundColor Green
Write-Host ""

# Conectar
Write-Host "🚀 Conectando..." -ForegroundColor Green
ssh -i $pemFile ec2-user@ec2-13-221-29-239.compute-1.amazonaws.com
