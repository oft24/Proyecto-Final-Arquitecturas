import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testLogin() {
  console.log('[TEST] Probando login con usuarios existentes\n');
  console.log('='.repeat(60));

  // Verificar médicos existentes
  console.log('\n[MÉDICOS] Usuarios en tabla medicos:');
  const medicos = await prisma.medico.findMany({
    select: { email: true, nombre: true, medicoId: true }
  });
  medicos.forEach(m => {
    console.log(`  - ${m.email} (${m.nombre})`);
  });

  // Verificar pacientes existentes
  console.log('\n[PACIENTES] Usuarios en tabla pacientes:');
  const pacientes = await prisma.paciente.findMany({
    select: { email: true, nombre: true, pacienteId: true }
  });
  pacientes.forEach(p => {
    console.log(`  - ${p.email} (${p.nombre})`);
  });

  // Verificar usuarios del sistema
  console.log('\n[USUARIOS] Usuarios en tabla usuarios:');
  const usuarios = await prisma.usuario.findMany({
    select: { email: true, nombre: true, rol: true }
  });
  if (usuarios.length === 0) {
    console.log('  (vacío - sin usuarios)');
  } else {
    usuarios.forEach(u => {
      console.log(`  - ${u.email} (${u.nombre}) - Rol: ${u.rol}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('[INFO] Para probar el login, usa:');
  console.log('  Médico: <email de médico> + password');
  console.log('  Paciente: <email de paciente> + password');
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

testLogin().catch(console.error);
