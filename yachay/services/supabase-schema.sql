-- ========================================================
-- YACHAY ECO - ESQUEMA DE BASE DE DATOS (SUPABASE POSTGRESQL)
-- Proyecto: Aplicación Móvil con Gamificación y Reporte Ambiental
-- Integrantes: Jean Franco Dávila & Xiomara Torres
-- Organización: ONG Perú Te Quiero Limpio (PTQL)
-- ========================================================

-- 1. Habilitar extensión PostGIS para geolocalización avanzada (opcional pero recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO (VOLUNTARIOS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Xiomara Torres',
  email TEXT,
  role TEXT DEFAULT 'Guardián Verde',
  level INT DEFAULT 3,
  points INT DEFAULT 1250,
  rank_title TEXT DEFAULT '#3 Lima',
  avatar_url TEXT,
  reports_count INT DEFAULT 12,
  jornadas_count INT DEFAULT 5,
  recovered_zones_count INT DEFAULT 8,
  trees_planted_count INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE REPORTES DE RESIDUOS / INCIDENCIAS AMBIENTALES
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('Microbotadero', 'Quema de residuos', 'Vertimiento', 'Otro')),
  severity TEXT NOT NULL CHECK (severity IN ('Leve', 'Moderado', 'Grave')),
  photo_url TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  points_awarded INT DEFAULT 50,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'en_proceso', 'resuelto')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE JORNADAS DE VOLUNTARIADO (LIMPIEZAS Y ARBORIZACIÓN)
CREATE TABLE IF NOT EXISTS public.jornadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('MICROBOTADERO ACTIVO', 'JORNADA DE LIMPIEZA', 'ARBORIZACIÓN', 'LIMPIEZA DE PLAYA')),
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_label TEXT,
  event_date TEXT,
  participants_count INT DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE CATÁLOGO DE RECOMPENSAS
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  cost_points INT NOT NULL,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE CANJES REALIZADOS
CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- DATOS INICIALES DE PRUEBA (SEED DATA)
-- ========================================================

-- Insertar recompensas iniciales
INSERT INTO public.rewards (title, organization, cost_points, category)
VALUES
  ('Entrada Biomuseo', 'Municipalidad de Lima', 500, 'Cultura y Naturaleza'),
  ('Kit de semillas', 'Municipalidad de Chorrillos', 300, 'Jardinería Urbana'),
  ('Botella ecológica', 'PTQL x TuChorrillos', 400, 'Merchandising Eco'),
  ('Pase transporte ecológico', 'Metropolitano Lima', 600, 'Movilidad Sostenible')
ON CONFLICT DO NOTHING;

-- Insertar jornadas de voluntariado
INSERT INTO public.jornadas (title, category, address, latitude, longitude, distance_label, event_date, participants_count, description)
VALUES
  ('Av. Los Pinos 342, Chorrillos', 'MICROBOTADERO ACTIVO', 'Av. Los Pinos 342, Chorrillos', -12.1783, -77.0145, '0.8 km', 'Reportado hoy', 0, 'Acumulación de basura y desmonte en la vía pública.'),
  ('Parque Zonal Sinchi Roca', 'JORNADA DE LIMPIEZA', 'Av. Universitaria s/n, Comas', -12.1850, -77.0200, '1.2 km', 'Dom 24 ago • 8:00 am', 45, 'Jornada integral de recojo de residuos y limpieza comunitaria.'),
  ('Humedales de Villa', 'ARBORIZACIÓN', 'Área de amortiguamiento, Pantanos de Villa', -12.2020, -77.0080, '2.5 km', 'Sáb 30 ago • 7:30 am', 30, 'Siembra de árboles nativos y recuperación paisajística.')
ON CONFLICT DO NOTHING;

-- ========================================================
-- POLÍTICAS DE ACCESO PÚBLICO (ROW LEVEL SECURITY - RLS)
-- Para facilitar las pruebas del prototipo universitario
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Lectura y creación pública de reportes" ON public.reports FOR ALL USING (true);
CREATE POLICY "Lectura de jornadas" ON public.jornadas FOR SELECT USING (true);
CREATE POLICY "Lectura de recompensas" ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Creación de canjes" ON public.redemptions FOR ALL USING (true);
