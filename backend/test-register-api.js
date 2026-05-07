import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function testRegisterPatient() {
  console.log('[TEST] Probando registro de paciente directo con Prisma...\n');
  
  try {
    const hash = await bcrypt.hash('Test123456', 10);
    const folio = `PAC-${Date.now()}`;
    
    console.log('[INFO] Datos a insertar:');
    console.log({
      email: `test${Date.now()}@test.com`,
      nombre: 'Paciente Test',
      telefono: '5551234567',
      folio
    });
    
    const paciente = await prisma.paciente.create({
      data: {
        email: `test${Date.now()}@test.com`,
        passwordHash: hash,
        nombre: 'Paciente Test',
        fechaNacimiento: new Date('1990-05-15'),
        telefono: '5551234567',
        folio,
      },
    });
    
    console.log('\n[SUCCESS] Paciente creado exitosamente!');
    console.log('[DATA]', paciente);
    
  } catch (error) {
    console.error('\n[ERROR] Error al crear paciente:');
    console.error(error.message);
    console.error('\n[STACK]', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testRegisterPatient();
