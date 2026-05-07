import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function showTablesCLI() {
  try {
    await prisma.$connect();
    
    console.log('\n=== TABLA: MEDICOS ===\n');
    const medicos = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'medicos' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(medicos);

    console.log('\n=== TABLA: PACIENTES ===\n');
    const pacientes = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'pacientes' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(pacientes);

    console.log('\n=== TABLA: USUARIOS ===\n');
    const usuarios = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(usuarios);

    console.log('\n=== REGISTROS EN MEDICOS ===\n');
    const medicosData = await prisma.$queryRaw`
      SELECT medico_id, email, nombre, especialidad, activo, created_at
      FROM medicos
    `;
    console.table(medicosData);

    console.log('\n=== REGISTROS EN PACIENTES ===\n');
    const pacientesData = await prisma.$queryRaw`
      SELECT paciente_id, email, nombre, telefono, folio, created_at
      FROM pacientes
    `;
    console.table(pacientesData);

    console.log('\n=== REGISTROS EN USUARIOS ===\n');
    const usuariosData = await prisma.$queryRaw`
      SELECT usuario_id, email, nombre, rol, activo, created_at
      FROM usuarios
    `;
    console.table(usuariosData);

  } catch (error) {
    console.error('[ERROR]', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showTablesCLI();
