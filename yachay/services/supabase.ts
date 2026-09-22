/**
 * Configuración del cliente Supabase para Yachay Eco
 * Conexión a Base de Datos PostgreSQL, Autenticación y Almacenamiento de Fotos
 */
import { createClient } from '@supabase/supabase-js';

// Normalizar la URL en caso de que termine en /rest/v1/ o /rest/v1
const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://selddzzxcfjhwrryutpw.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbGRkenp4Y2ZqaHdycnl1dHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU4MDksImV4cCI6MjEwNTU5MTgwOX0.DepkyFhtw0ns0l3yl6qYs9Zej0bt9FFcvj-PwEbziCU';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export interface DatabaseReport {
  id?: string;
  user_id?: string;
  type: string;
  severity: string;
  photo_url?: string;
  latitude: number;
  longitude: number;
  address: string;
  description?: string;
  status: 'activo' | 'en_proceso' | 'resuelto';
  created_at?: string;
}

/**
 * Servicio para sincronizar reportes con Supabase
 */
export async function syncReportToSupabase(report: DatabaseReport) {
  if (!isSupabaseConfigured) {
    console.log('[Supabase] Credenciales no detectadas. Usando almacenamiento local reactivo.');
    return { success: true, offline: true };
  }

  try {
    const { data, error } = await supabase.from('reports').insert([report]).select();
    if (error) throw error;
    console.log('[Supabase] Reporte guardado con éxito en la base de datos remota:', data);
    return { success: true, data, offline: false };
  } catch (error) {
    console.warn('[Supabase Error] Fallo al enviar reporte a la nube, guardado localmente:', error);
    return { success: false, error, offline: true };
  }
}

/**
 * Probar conexión con la base de datos
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('rewards').select('*').limit(2);
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
