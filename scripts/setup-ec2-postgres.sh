#!/bin/bash

echo "🚀 Configurando PostgreSQL en EC2 para conexiones remotas..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar si PostgreSQL está instalado
echo -e "${YELLOW}📦 Verificando instalación de PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado. Instalando...${NC}"
    sudo yum update -y
    sudo yum install postgresql15-server postgresql15 -y
    sudo postgresql-setup --initdb
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo -e "${GREEN}✅ PostgreSQL ya está instalado${NC}"
fi

# 2. Configurar PostgreSQL para aceptar conexiones remotas
echo -e "${YELLOW}🔧 Configurando postgresql.conf...${NC}"
PG_CONF=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW config_file')
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# 3. Configurar pg_hba.conf para permitir conexiones con contraseña
echo -e "${YELLOW}🔧 Configurando pg_hba.conf...${NC}"
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW hba_file')
# Agregar regla para permitir conexiones remotas con contraseña
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_HBA"

# 4. Configurar contraseña del usuario postgres
echo -e "${YELLOW}🔑 Configurando contraseña del usuario postgres...${NC}"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'admin123!';"

# 5. Crear la base de datos medisync
echo -e "${YELLOW}🗄️  Creando base de datos 'medisync'...${NC}"
sudo -u postgres psql -c "CREATE DATABASE medisync;" 2>/dev/null || echo "Base de datos 'medisync' ya existe"

# 6. Reiniciar PostgreSQL
echo -e "${YELLOW}🔄 Reiniciando PostgreSQL...${NC}"
sudo systemctl restart postgresql

# 7. Verificar estado
echo -e "${YELLOW}📊 Verificando estado de PostgreSQL...${NC}"
sudo systemctl status postgresql --no-pager

echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Ahora debes configurar el Security Group de AWS:${NC}"
echo "   1. Ve a la consola de AWS EC2"
echo "   2. Selecciona tu instancia"
echo "   3. Ve a la pestaña 'Security'"
echo "   4. Haz clic en el Security Group"
echo "   5. Edita las reglas de entrada (Inbound rules)"
echo "   6. Agrega una regla:"
echo "      - Type: PostgreSQL"
echo "      - Protocol: TCP"
echo "      - Port: 5432"
echo "      - Source: Tu IP o 0.0.0.0/0 (para permitir desde cualquier IP - menos seguro)"
echo ""
echo -e "${GREEN}🎉 Una vez configurado el Security Group, podrás conectarte!${NC}"
