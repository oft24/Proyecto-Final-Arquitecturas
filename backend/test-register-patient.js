import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testRegisterPatient() {
  console.log('[TEST] Probando registro de paciente...\n');
  
  const testData = {
    nombre: 'Paciente Test ' + Date.now(),
    email: `paciente${Date.now()}@test.com`,
    password: 'Test123456',
    fechaNacimiento: '1990-05-15',
    telefono: '5551234567'
  };
  
  console.log('[REQUEST] Datos enviados:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(`${API_URL}/auth/register/patient`, testData);
    console.log('\n[SUCCESS] Registro exitoso!');
    console.log('[RESPONSE]', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n[ERROR] Error en registro:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

testRegisterPatient();
