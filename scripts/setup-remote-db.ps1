# Script para configurar PostgreSQL en EC2 remotamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración de PostgreSQL en EC2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$pemFile = Join-Path $projectRoot "labsuser (4).pem"

# Verificar que el archivo .pem existe
if (-not (Test-Path $pemFile)) {
    Write-Host "❌ Error: No se encuentra el archivo labsuser (4).pem" -ForegroundColor Red
    exit 1
}

# Configurar permisos
icacls $pemFile /inheritance:r | Out-Null
icacls $pemFile /grant:r "$env:USERNAME`:R" | Out-Null

Write-Host "📦 Paso 1: Instalando PostgreSQL en EC2..." -ForegroundColor Yellow
Write-Host ""

# Crear script de configuración temporal
$setupScript = @'
#!/bin/bash
set -e

echo "🚀 Iniciando configuración de PostgreSQL..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo yum update -y

# Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
sudo yum install postgresql15-server postgresql15 -y

# Inicializar (si es necesario)
if [ ! -d "/var/lib/pgsql/data/base" ]; then
    echo "🔧 Inicializando PostgreSQL..."
    sudo postgresql-setup --initdb
fi

# Iniciar y habilitar PostgreSQL
echo "▶️  Iniciando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar para conexiones remotas
echo "🔧 Configurando postgresql.conf..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf

# Configurar autenticación
echo "🔧 Configurando pg_hba.conf..."
if ! sudo grep -q "host    all             all             0.0.0.0/0               md5" /var/lib/pgsql/data/pg_hba.conf; then
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /var/lib/pgsql/data/pg_hba.conf
fi

# Configurar contraseña
echo "🔑 Configurando contraseña..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'admin123!';" 2>/dev/null || true

# Crear base de datos
echo "🗄️  Creando base de datos medisync..."
sudo -u postgres psql -c "CREATE DATABASE medisync;" 2>/dev/null || echo "Base de datos ya existe"

# Reiniciar PostgreSQL
echo "🔄 Reiniciando PostgreSQL..."
sudo systemctl restart postgresql

# Verificar estado
echo "✅ Verificando estado..."
sudo systemctl status postgresql --no-pager | head -n 10

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "📊 Información de la base de datos:"
sudo -u postgres psql -l

echo ""
echo "🔌 PostgreSQL está escuchando en:"
sudo netstat -tulpn | grep 5432 || echo "Comando netstat no disponible"
'@

# Guardar script temporal
$tempScript = Join-Path $env:TEMP "setup-postgres.sh"
$setupScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📤 Copiando script de configuración a EC2..." -ForegroundColor Yellow
scp -i $pemFile $tempScript ec2-user@ec2-13-221-29-239.compute-1.amazonaws.com:~/setup-postgres.sh

Write-Host "🚀 Ejecutando configuración en EC2..." -ForegroundColor Yellow
Write-Host ""
ssh -i $pemFile ec2-user@ec2-13-221-29-239.compute-1.amazonaws.com "chmod +x ~/setup-postgres.sh && ~/setup-postgres.sh"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Ahora debes configurar el Security Group:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a AWS Console: https://console.aws.amazon.com/ec2/" -ForegroundColor White
Write-Host "2. Selecciona tu instancia EC2" -ForegroundColor White
Write-Host "3. Ve a Security > Security Groups" -ForegroundColor White
Write-Host "4. Edita Inbound Rules" -ForegroundColor White
Write-Host "5. Agrega regla:" -ForegroundColor White
Write-Host "   - Type: PostgreSQL" -ForegroundColor Cyan
Write-Host "   - Port: 5432" -ForegroundColor Cyan
Write-Host "   - Source: My IP (o 0.0.0.0/0 para pruebas)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Presiona Enter cuando hayas configurado el Security Group..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🧪 Probando conexión a la base de datos..." -ForegroundColor Yellow
Set-Location (Join-Path $projectRoot "backend")
node test-connection.js

Write-Host ""
Write-Host "🎉 ¡Listo! Si la conexión fue exitosa, puedes ejecutar las migraciones:" -ForegroundColor Green
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npx prisma migrate deploy" -ForegroundColor Cyan
Write-Host ""
