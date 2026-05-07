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

async function checkAllUsers() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS - Base de datos: medisync\n');

    // Verificar usuarios
    console.log('========================================');
    console.log('TABLA: USUARIOS');
    console.log('========================================');
    const usuarios = await client.query('SELECT * FROM usuarios ORDER BY created_at DESC;');
    console.log(`Total: ${usuarios.rows.length}\n`);
    if (usuarios.rows.length > 0) {
      console.table(usuarios.rows);
    } else {
      console.log('⚠️  No hay usuarios\n');
    }

    // Verificar médicos
    console.log('========================================');
    console.log('TABLA: MEDICOS');
    console.log('========================================');
    const medicos = await client.query('SELECT * FROM medicos ORDER BY created_at DESC;');
    console.log(`Total: ${medicos.rows.length}\n`);
    if (medicos.rows.length > 0) {
      console.table(medicos.rows);
    } else {
      console.log('⚠️  No hay médicos\n');
    }

    // Verificar pacientes
    console.log('========================================');
    console.log('TABLA: PACIENTES');
    console.log('========================================');
    const pacientes = await client.query('SELECT * FROM pacientes ORDER BY created_at DESC;');
    console.log(`Total: ${pacientes.rows.length}\n`);
    if (pacientes.rows.length > 0) {
      console.table(pacientes.rows);
    } else {
      console.log('⚠️  No hay pacientes\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllUsers();
