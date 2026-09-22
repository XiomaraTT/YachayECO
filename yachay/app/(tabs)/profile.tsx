import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, achievements, activities, toggleNotifications, togglePrivacy, logout } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Cálculo del progreso de nivel
  const currentBase = 1000;
  const targetBase = 1500;
  const progressRatio = Math.min(
    Math.max((user.points - currentBase) / (targetBase - currentBase), 0.1),
    1
  );
  const progressPercent = `${Math.round(progressRatio * 100)}%`;
  const pointsRemaining = Math.max(targetBase - user.points, 0);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con fondo verde */}
      <View style={styles.header}>
        {/* Icono de perfil y nombre */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => router.push('/edit-profile' as any)}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
            )}
            <View style={styles.editAvatarIcon}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.districtText}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.9)" /> {user.district || 'Chorrillos, Lima'}
            </Text>
            <View style={styles.badgeContainer}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.badgeText}>{user.role}</Text>
            </View>
          </View>
        </View>

        {/* Puntos y nivel */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>NIVEL {user.level}</Text>
            <Text style={styles.statLabel}>Nivel actual</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.points.toLocaleString()} pts</Text>
            <Text style={styles.statLabel}>Puntos totales</Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Nivel {user.level}</Text>
            <Text style={styles.progressLabel}>
              {pointsRemaining > 0 ? `${pointsRemaining} pts para Nivel ${user.nextLevel}` : `¡Nivel Máximo!`}
            </Text>
            <Text style={styles.progressLabel}>Nivel {user.nextLevel}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: progressPercent as any }]} />
          </View>
          <View style={styles.progressPoints}>
            <Text style={styles.progressText}>1,000 pts</Text>
            <Text style={styles.progressText}>1,500 pts</Text>
          </View>
        </View>
      </View>

      {/* Mi Impacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MI IMPACTO</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{user.reportsCount}</Text>
            <Text style={styles.impactLabel}>Reportes realizados</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{user.jornadasCount}</Text>
            <Text style={styles.impactLabel}>Jornadas participadas</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{user.recoveredZonesCount}</Text>
            <Text style={styles.impactLabel}>Zonas recuperadas</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{user.treesPlantedCount}</Text>
            <Text style={styles.impactLabel}>Árboles sembrados</Text>
          </View>
        </View>
      </View>

      {/* Mis Logros */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MIS LOGROS</Text>
          <Text style={styles.logrosCount}>
            {achievements.filter(a => a.completed).length}/{achievements.length} completados
          </Text>
        </View>
        <View style={styles.achievementsList}>
          {achievements.slice(0, 3).map((ach, index) => (
            <View
              key={ach.id}
              style={[
                styles.achievementItem,
                index === 2 && { borderBottomWidth: 0 },
              ]}>
              <View style={styles.achievementIcon}>
                <Ionicons name={ach.iconName as any} size={22} color="#4CAF50" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{ach.title}</Text>
                <Text style={styles.achievementDate}>
                  {ach.completed ? 'Obtenido' : 'Pendiente'} • +{ach.points} pts
                </Text>
              </View>
              <View style={[styles.achievementBadge, !ach.completed && styles.achievementBadgePending]}>
                <Text style={styles.achievementBadgeText}>
                  {ach.completed ? '✓' : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* MI ACTIVIDAD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MI ACTIVIDAD</Text>

        {activities.map(act => (
          <View key={act.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIconContainer}>
                <Ionicons name={act.iconName as any} size={20} color="#4CAF50" />
              </View>
              <Text style={styles.activityTitle}>{act.title}</Text>
            </View>
            <Text style={styles.activityLocation}>
              <Ionicons name="location-outline" size={14} color="#666" /> {act.location}
            </Text>
            <View style={styles.activityFooter}>
              <Text style={styles.activityDate}>
                <Ionicons name="time-outline" size={14} color="#666" /> {act.time}
              </Text>
              <View
                style={[
                  styles.activityPoints,
                  act.points < 0 && styles.activityPointsNegative,
                ]}>
                <Ionicons
                  name={act.points < 0 ? 'gift' : 'star'}
                  size={14}
                  color={act.points < 0 ? '#E65100' : '#FFD700'}
                />
                <Text
                  style={[
                    styles.activityPointsText,
                    act.points < 0 && styles.activityPointsNegativeText,
                  ]}>
                  {act.points > 0 ? `+${act.points} pts` : `${act.points} pts`}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* CONFIGURACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
        <View style={styles.configCard}>
          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => router.push('/edit-profile' as any)}>
            <View style={styles.configLeft}>
              <Ionicons name="person-outline" size={22} color="#4CAF50" />
              <Text style={styles.configText}>Editar perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.configItem}>
            <View style={styles.configLeft}>
              <Ionicons name="notifications-outline" size={22} color="#4CAF50" />
              <Text style={styles.configText}>Notificaciones</Text>
            </View>
            <Switch
              value={user.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
              thumbColor={user.notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.configItem}>
            <View style={styles.configLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" />
              <Text style={styles.configText}>Privacidad de reportes</Text>
            </View>
            <Switch
              value={user.privacyEnabled}
              onValueChange={togglePrivacy}
              trackColor={{ false: '#d1d1d1', true: '#4CAF50' }}
              thumbColor={user.privacyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[styles.configItem, styles.configItemLast]}
            onPress={handleLogout}>
            <View style={styles.configLeft}>
              <Ionicons name="log-out-outline" size={22} color="#f44336" />
              <Text style={[styles.configText, styles.configTextDanger]}>
                Cerrar sesión
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de confirmación de cierre de sesión (Cross-platform) */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutCard}>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={30} color="#f44336" />
            </View>
            <Text style={styles.logoutTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.logoutMessage}>
              ¿Estás seguro de que deseas salir de tu cuenta? Tendrás que iniciar sesión nuevamente para continuar sumando puntos.
            </Text>
            <View style={styles.logoutActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmLogout}>
                <Text style={styles.confirmButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Espacio extra al final */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2E7D32',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  districtText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    padding: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressPoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.8,
  },
  logrosCount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  impactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  impactNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  achievementBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgePending: {
    backgroundColor: '#e0e0e0',
  },
  achievementBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activityLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    marginLeft: 42,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 42,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  activityPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityPointsNegative: {
    backgroundColor: '#ffebee',
  },
  activityPointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f9a825',
    marginLeft: 4,
  },
  activityPointsNegativeText: {
    color: '#e53935',
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 10,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configItemLast: {
    borderBottomWidth: 0,
  },
  configLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  configTextDanger: {
    color: '#f44336',
  },
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoutCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
