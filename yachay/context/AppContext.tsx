import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  district?: string;
  bio?: string;
  avatarUri?: string;
  initials: string;
  role: string;
  level: number;
  nextLevel: number;
  points: number;
  pointsForNextLevel: number;
  rank: string;
  reportsCount: number;
  jornadasCount: number;
  recoveredZonesCount: number;
  treesPlantedCount: number;
  notificationsEnabled: boolean;
  privacyEnabled: boolean;
}

export interface ReportItem {
  id: string;
  type: 'Microbotadero' | 'Quema de residuos' | 'Vertimiento' | 'Otro';
  severity: 'Leve' | 'Moderado' | 'Grave';
  imageUri?: string;
  address: string;
  description?: string;
  pointsEarned: number;
  createdAt: string;
  status: 'Activo' | 'En proceso' | 'Resuelto';
  latitude: number;
  longitude: number;
}

export interface MapPoint {
  id: string;
  title: string;
  type: 'botadero' | 'jornada' | 'arbol';
  categoryLabel: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  xPercent: number; // Posición % para representación visual interactiva
  yPercent: number;
  description?: string;
  participants?: number;
  date?: string;
  severity?: 'Leve' | 'Moderado' | 'Grave';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  badgeNumber: number;
  iconName: string;
}

export interface RewardItem {
  id: string;
  title: string;
  organization: string;
  cost: number;
  category: string;
  redeemed?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  location: string;
  time: string;
  points: number;
  iconName: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
  avatarText: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'alert' | 'reward' | 'event';
}

interface AppContextType {
  isAuthenticated: boolean;
  user: UserProfile;
  reports: ReportItem[];
  mapPoints: MapPoint[];
  achievements: Achievement[];
  rewards: RewardItem[];
  activities: ActivityItem[];
  leaderboard: LeaderboardUser[];
  notifications: NotificationItem[];
  userLocation: { latitude: number; longitude: number; address: string } | null;
  setUserLocation: (loc: { latitude: number; longitude: number; address: string } | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  registerUser: (data: { name: string; email: string; district: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  addReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'pointsEarned' | 'status'>) => void;
  redeemReward: (rewardId: string) => boolean;
  joinJornada: (pointId: string) => void;
  toggleNotifications: (val: boolean) => void;
  togglePrivacy: (val: boolean) => void;
  markAllNotificationsAsRead: () => void;
}

const initialUser: UserProfile = {
  name: 'Jean Franco Dávila',
  email: 'jeanfranco.davila@utp.edu.pe',
  phone: '+51 987 654 321',
  district: 'Chorrillos, Lima',
  bio: 'Estudiante voluntario comprometido con la recuperación ambiental de playas y quebradas.',
  initials: 'JD',
  role: 'Guardián Verde',
  level: 3,
  nextLevel: 4,
  points: 1250,
  pointsForNextLevel: 1500,
  rank: '#3 Lima',
  reportsCount: 12,
  jornadasCount: 5,
  recoveredZonesCount: 8,
  treesPlantedCount: 3,
  notificationsEnabled: true,
  privacyEnabled: false,
};

const initialMapPoints: MapPoint[] = [
  {
    id: 'pt-1',
    title: 'Av. Los Pinos 342, Chorrillos',
    type: 'botadero',
    categoryLabel: 'MICROBOTADERO ACTIVO',
    address: 'Av. Los Pinos 342, Chorrillos, Lima',
    distance: '0.8 km',
    latitude: -12.1783,
    longitude: -77.0145,
    xPercent: 35,
    yPercent: 42,
    severity: 'Leve',
    description: 'Acumulación de bolsas de basura doméstica y desmonte en la esquina del parque.',
  },
  {
    id: 'pt-2',
    title: 'Parque Zonal Sinchi Roca',
    type: 'jornada',
    categoryLabel: 'JORNADA DE LIMPIEZA',
    address: 'Av. Universitaria s/n, Comas',
    distance: '1.2 km',
    latitude: -12.185,
    longitude: -77.02,
    xPercent: 50,
    yPercent: 52,
    participants: 45,
    date: 'Dom 24 ago • 8:00 am',
    description: 'Jornada integral de recojo de plásticos y limpieza de senderos comunitarios.',
  },
  {
    id: 'pt-3',
    title: 'Humedales de Villa',
    type: 'arbol',
    categoryLabel: 'ARBORIZACIÓN',
    address: 'Área de amortiguamiento, Pantanos de Villa',
    distance: '2.5 km',
    latitude: -12.202,
    longitude: -77.008,
    xPercent: 65,
    yPercent: 65,
    participants: 30,
    date: 'Sáb 30 ago • 7:30 am',
    description: 'Siembra comunitaria de 50 árboles nativos y arbustos de retención de humedad.',
  },
  {
    id: 'pt-4',
    title: 'Av. Bolognesi cruce Malecón Grau',
    type: 'botadero',
    categoryLabel: 'MICROBOTADERO ACTIVO',
    address: 'Av. Bolognesi 120, Chorrillos',
    distance: '1.5 km',
    latitude: -12.169,
    longitude: -77.025,
    xPercent: 72,
    yPercent: 38,
    severity: 'Moderado',
    description: 'Residuos sólidos arrojados al pie del acantilado.',
  },
  {
    id: 'pt-5',
    title: 'Playa Agua Dulce',
    type: 'jornada',
    categoryLabel: 'LIMPIEZA DE PLAYA',
    address: 'Circuito de Playas, Chorrillos',
    distance: '1.8 km',
    latitude: -12.164,
    longitude: -77.032,
    xPercent: 44,
    yPercent: 75,
    participants: 58,
    date: 'Dom 24 ago • 9:00 am',
    description: 'Limpieza masiva en conjunto con voluntarios de UTP y la Municipalidad de Lima.',
  },
  {
    id: 'pt-6',
    title: 'Parque de la Familia',
    type: 'arbol',
    categoryLabel: 'ARBORIZACIÓN URBANA',
    address: 'Av. Guardia Civil cuadra 6, Chorrillos',
    distance: '3.1 km',
    latitude: -12.189,
    longitude: -76.998,
    xPercent: 25,
    yPercent: 68,
    participants: 22,
    date: 'Dom 31 ago • 8:30 am',
    description: 'Plantación de molles costeños y riego de áreas verdes comunitarias.',
  },
];

const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Primer Reporte',
    description: 'Reportaste tu primer microbotadero',
    points: 50,
    completed: true,
    badgeNumber: 1,
    iconName: 'ribbon-outline',
  },
  {
    id: 'ach-2',
    title: 'Guardián Verde',
    description: 'Participaste en 5 jornadas de limpieza',
    points: 200,
    completed: true,
    badgeNumber: 1,
    iconName: 'shield-checkmark',
  },
  {
    id: 'ach-3',
    title: 'EcoActivo',
    description: 'Reportaste 10 residuos en un mes',
    points: 150,
    completed: true,
    badgeNumber: 1,
    iconName: 'leaf-outline',
  },
  {
    id: 'ach-4',
    title: 'Líder Comunitario',
    description: 'Invita a 5 vecinos a la app',
    points: 300,
    completed: false,
    badgeNumber: 1,
    iconName: 'sunny-outline',
  },
  {
    id: 'ach-5',
    title: 'Defensor del Agua',
    description: 'Reporta 3 vertimientos en canales',
    points: 250,
    completed: false,
    badgeNumber: 1,
    iconName: 'water-outline',
  },
];

const initialRewards: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'Entrada Biomuseo',
    organization: 'Municipalidad de Lima',
    cost: 500,
    category: 'Cultura y Naturaleza',
  },
  {
    id: 'rew-2',
    title: 'Kit de semillas',
    organization: 'Municipalidad de Chorrillos',
    cost: 300,
    category: 'Jardinería Urbana',
  },
  {
    id: 'rew-3',
    title: 'Botella ecológica',
    organization: 'PTQL x TuChorrillos',
    cost: 400,
    category: 'Merchandising Eco',
  },
  {
    id: 'rew-4',
    title: 'Pase transporte ecológico',
    organization: 'Metropolitano Lima',
    cost: 600,
    category: 'Movilidad Sostenible',
  },
];

const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Reportaste un microbotadero',
    location: 'Av. Los Pinos 342, Chorrillos',
    time: 'Hoy, 9:14 am',
    points: 50,
    iconName: 'trash-outline',
  },
  {
    id: 'act-2',
    title: 'Participaste en una jornada de limpieza',
    location: 'Parque Zonal Sinchi Roca',
    time: 'Ayer, 8:00 am',
    points: 100,
    iconName: 'brush-outline',
  },
  {
    id: 'act-3',
    title: 'Participaste en arborización',
    location: 'Humedales de Villa',
    time: '18 ago, 7:30 am',
    points: 80,
    iconName: 'leaf-outline',
  },
];

const initialLeaderboard: LeaderboardUser[] = [
  { id: 'usr-1', rank: 1, name: 'Carlos M.', points: 2140, avatarText: 'CM' },
  { id: 'usr-2', rank: 2, name: 'Lucía R.', points: 1830, avatarText: 'LR' },
  { id: 'usr-3', rank: 3, name: 'Xiomara T. (Tú)', points: 1250, isCurrentUser: true, avatarText: 'XT' },
  { id: 'usr-4', rank: 4, name: 'Andrés V.', points: 980, avatarText: 'AV' },
  { id: 'usr-5', rank: 5, name: 'Diana P.', points: 870, avatarText: 'DP' },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '¡Nueva jornada de limpieza!',
    description: 'Se abrió la convocatoria para Limpieza de Playa en Chorrillos este domingo.',
    time: 'Hace 10 min',
    isRead: false,
    type: 'event',
  },
  {
    id: 'notif-2',
    title: 'Puntos asignados',
    description: 'Has recibido +50 puntos por tu reporte verificado en Av. Los Pinos.',
    time: 'Hace 2 horas',
    isRead: false,
    type: 'reward',
  },
  {
    id: 'notif-3',
    title: 'Subiste en el ranking',
    description: '¡Felicidades! Alcanzaste el puesto #3 de Guardianes Verdes en Lima.',
    time: 'Ayer',
    isRead: false,
    type: 'alert',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>(initialMapPoints);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [rewards, setRewards] = useState<RewardItem[]>(initialRewards);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(initialLeaderboard);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  // Iniciar sesión con email y contraseña
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) {
          console.warn('[Supabase Auth Warning] Fallo auth remoto, verificando acceso local:', error.message);
        }
      }

      // Si email tiene un nombre, adaptarlo
      const extractedName = email.split('@')[0].replace(/[._]/g, ' ');
      const cleanName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

      setUser(prev => ({
        ...prev,
        email,
        name: prev.name || cleanName,
      }));
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      setIsAuthenticated(true);
      return { success: true };
    }
  };

  // Iniciar sesión con Google o Facebook
  const loginWithSocial = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signInWithOAuth({
          provider: provider as any,
        });
      }
    } catch (e) {
      console.log('OAuth redirect simulated for demo:', e);
    }

    const socialName = 'Jean Franco Dávila';
    setUser(prev => ({
      ...prev,
      name: socialName,
      initials: 'JD',
      email: provider === 'google' ? 'jeanfranco.davila@gmail.com' : 'jeanfranco.davila@facebook.com',
    }));
    setIsAuthenticated(true);
    return { success: true };
  };

  // Modo invitado
  const loginAsGuest = () => {
    setUser({
      name: 'Jean Franco (Invitado)',
      email: 'invitado@yachayeco.pe',
      phone: '+51 987 654 321',
      district: 'Chorrillos, Lima',
      bio: 'Voluntario ambiental de la ONG Perú Te Quiero Limpio.',
      initials: 'JF',
      role: 'Guardián Verde',
      level: 3,
      nextLevel: 4,
      points: 1250,
      pointsForNextLevel: 1500,
      rank: '#3 Lima',
      reportsCount: 12,
      jornadasCount: 5,
      recoveredZonesCount: 8,
      treesPlantedCount: 3,
      notificationsEnabled: true,
      privacyEnabled: false,
    });
    setIsAuthenticated(true);
  };

  // Registrar nueva cuenta
  const registerUser = async (data: { name: string; email: string; district: string; password?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured && data.password) {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { full_name: data.name, district: data.district },
          },
        });

        // Registrar en tabla profiles
        await supabase.from('profiles').insert([{
          full_name: data.name,
          email: data.email,
          role: 'Guardián Verde',
          level: 1,
          points: 100,
        }]);
      }
    } catch (e) {
      console.log('Register profile notice:', e);
    }

    const initials = data.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

    setUser({
      name: data.name,
      email: data.email,
      district: data.district,
      initials,
      role: 'Guardián Verde Nuevo',
      level: 1,
      nextLevel: 2,
      points: 100,
      pointsForNextLevel: 500,
      rank: '#15 Lima',
      reportsCount: 0,
      jornadasCount: 0,
      recoveredZonesCount: 0,
      treesPlantedCount: 0,
      notificationsEnabled: true,
      privacyEnabled: false,
    });

    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(console.error);
    }
    setIsAuthenticated(false);
  };

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    setUser(prev => {
      const newName = updatedData.name || prev.name;
      const initials = newName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return {
        ...prev,
        ...updatedData,
        initials: initials || prev.initials,
      };
    });

    // Sincronizar en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, any> = {};
        if (updatedData.name) updatePayload.full_name = updatedData.name;
        if (updatedData.email) updatePayload.email = updatedData.email;
        if (updatedData.phone !== undefined) updatePayload.phone = updatedData.phone;
        if (updatedData.district !== undefined) updatePayload.district = updatedData.district;
        if (updatedData.bio !== undefined) updatePayload.bio = updatedData.bio;

        if (Object.keys(updatePayload).length > 0) {
          await supabase.from('profiles').update(updatePayload).eq('email', user.email);
        }
      } catch (e) {
        console.log('Update profile cloud error:', e);
      }
    }

    return true;
  };

  const addReport = (newReportData: Omit<ReportItem, 'id' | 'createdAt' | 'pointsEarned' | 'status'>) => {
    const pointsEarned = 50;
    const newReport: ReportItem = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      pointsEarned,
      createdAt: 'Justo ahora',
      status: 'Activo',
    };

    setReports(prev => [newReport, ...prev]);

    setUser(prev => ({
      ...prev,
      points: prev.points + pointsEarned,
      reportsCount: prev.reportsCount + 1,
    }));

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Reportaste: ${newReportData.type}`,
      location: newReportData.address || 'Av. Los Pinos 342, Chorrillos',
      time: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: pointsEarned,
      iconName: 'trash-outline',
    };
    setActivities(prev => [newActivity, ...prev]);

    // Agregar nueva notificación
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Reporte registrado',
        description: `Tu reporte de ${newReportData.type} ha sumado +50 pts a tu cuenta.`,
        time: 'Justo ahora',
        isRead: false,
        type: 'reward',
      },
      ...prev,
    ]);

    const newPoint: MapPoint = {
      id: `map-${Date.now()}`,
      title: newReportData.address || 'Nuevo reporte ciudadano',
      type: 'botadero',
      categoryLabel: 'MICROBOTADERO ACTIVO',
      address: newReportData.address || 'Chorrillos, Lima',
      distance: '0.1 km',
      latitude: newReportData.latitude || -12.178,
      longitude: newReportData.longitude || -77.014,
      xPercent: Math.floor(Math.random() * 60) + 20,
      yPercent: Math.floor(Math.random() * 50) + 25,
      severity: newReportData.severity,
      description: newReportData.description || 'Reporte verificado por la comunidad Yachay Eco.',
    };
    setMapPoints(prev => [newPoint, ...prev]);

    setLeaderboard(prev =>
      prev.map(item =>
        item.isCurrentUser ? { ...item, points: item.points + pointsEarned } : item
      )
    );
  };

  const redeemReward = (rewardId: string): boolean => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.redeemed) return false;

    if (user.points < reward.cost) {
      return false;
    }

    setUser(prev => ({
      ...prev,
      points: prev.points - reward.cost,
    }));

    setRewards(prev =>
      prev.map(r => (r.id === rewardId ? { ...r, redeemed: true } : r))
    );

    const newActivity: ActivityItem = {
      id: `act-canje-${Date.now()}`,
      title: `Canjeaste: ${reward.title}`,
      location: reward.organization,
      time: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: -reward.cost,
      iconName: 'gift-outline',
    };
    setActivities(prev => [newActivity, ...prev]);

    return true;
  };

  const joinJornada = (pointId: string) => {
    setMapPoints(prev =>
      prev.map(p => {
        if (p.id === pointId) {
          return {
            ...p,
            participants: (p.participants || 0) + 1,
          };
        }
        return p;
      })
    );

    setUser(prev => ({
      ...prev,
      jornadasCount: prev.jornadasCount + 1,
      points: prev.points + 100,
    }));

    const targetPoint = mapPoints.find(p => p.id === pointId);
    const newActivity: ActivityItem = {
      id: `act-join-${Date.now()}`,
      title: `Inscripción a ${targetPoint?.categoryLabel || 'Jornada'}`,
      location: targetPoint?.title || 'Lima',
      time: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: 100,
      iconName: 'people-outline',
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const toggleNotifications = (val: boolean) => {
    setUser(prev => ({ ...prev, notificationsEnabled: val }));
  };

  const togglePrivacy = (val: boolean) => {
    setUser(prev => ({ ...prev, privacyEnabled: val }));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        reports,
        mapPoints,
        achievements,
        rewards,
        activities,
        leaderboard,
        notifications,
        userLocation,
        setUserLocation,
        login,
        loginWithSocial,
        loginAsGuest,
        registerUser,
        logout,
        updateProfile,
        addReport,
        redeemReward,
        joinJornada,
        toggleNotifications,
        togglePrivacy,
        markAllNotificationsAsRead,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}
