@echo off
echo ========================================
echo Conectando a EC2...
echo ========================================
echo.
echo Host: ec2-13-221-29-239.compute-1.amazonaws.com
echo Usuario: ec2-user
echo.

REM Cambiar al directorio raíz del proyecto
cd /d "%~dp0\.."

REM Conectar usando SSH
ssh -i "labsuser (4).pem" ec2-user@ec2-13-221-29-239.compute-1.amazonaws.com

pause
