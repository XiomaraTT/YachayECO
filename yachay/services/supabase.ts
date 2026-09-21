/**
 * Configuración del cliente Supabase para Yachay Eco
 * Conexión a Base de Datos PostgreSQL, Autenticación y Almacenamiento de Fotos
 */
import { createClient } from '@supabase/supabase-js';

// Estas variables se pueden definir en un archivo .env en la raíz de /yachay:
// EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
// EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-yachay.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder')
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
    return { success: true, data, offline: false };
  } catch (error) {
    console.warn('[Supabase Error] Fallo al enviar reporte a la nube, guardado localmente:', error);
    return { success: false, error, offline: true };
  }
}
