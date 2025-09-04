require('dotenv').config();
const { supabase } = require('./config/supabase');

async function testConnection() {
  try {
    console.log('🔗 Probando conexión a Supabase...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
    } else {
      console.log('✅ Conexión exitosa a Supabase');
      console.log('📊 Datos de prueba:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testConnection();
