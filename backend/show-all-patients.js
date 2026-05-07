import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'MediSync2026!Secure',
  database: 'medisync',
  ssl: {
    rejectUnauthorized: false
  }
});

async function showAllPatients() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS - Base de datos: medisync\n');

    // Consultar TODOS los campos de todos los pacientes
    const result = await client.query(`
      SELECT * FROM pacientes ORDER BY created_at DESC;
    `);

    console.log('========================================');
    console.log(`TOTAL DE PACIENTES: ${result.rows.length}`);
    console.log('========================================\n');

    if (result.rows.length > 0) {
      console.table(result.rows);
      
      console.log('\n📋 DETALLES PARA LOGIN:\n');
      result.rows.forEach((paciente, index) => {
        console.log(`${index + 1}. ${paciente.nombre}`);
        console.log(`   📧 Email:    ${paciente.email}`);
        console.log(`   🔑 Password: [HASH] ${paciente.password_hash.substring(0, 20)}...`);
        console.log(`   📱 Teléfono: ${paciente.telefono}`);
        console.log(`   🆔 Folio:    ${paciente.folio}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay pacientes registrados\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showAllPatients();
