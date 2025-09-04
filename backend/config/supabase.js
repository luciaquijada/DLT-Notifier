const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Falta la variable de entorno SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Falta la variable de entorno SUPABASE_ANON_KEY');
}

// Cliente para operaciones públicas
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones administrativas (solo si está disponible)
let supabaseAdmin = null;
if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY no está configurado, algunas funciones administrativas no estarán disponibles');
}

module.exports = {
  supabase,
  supabaseAdmin
};