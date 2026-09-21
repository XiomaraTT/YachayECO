import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, mapPoints, joinJornada } = useApp();
  const [joinedEvents, setJoinedEvents] = useState<{ [key: string]: boolean }>({});

  const handleJoin = (eventId: string, title: string) => {
    if (joinedEvents[eventId]) {
      Alert.alert('Ya estás inscrito', `Ya confirmaste tu asistencia a "${title}".`);
      return;
    }
    joinJornada(eventId);
    setJoinedEvents(prev => ({ ...prev, [eventId]: true }));
    Alert.alert('¡Inscripción exitosa!', `Te has unido a "${title}". ¡Ganaste +100 puntos de voluntariado!`);
  };

  const nearbyItems = mapPoints.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con saludo */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>¡Buenos días,</Text>
            <Text style={styles.userName}>{user.name.split(' ')[0]} 🍀</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notificaciones', 'Tienes 3 nuevas notificaciones de jornadas comunitarias.')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.reportsCount}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.jornadasCount}</Text>
            <Text style={styles.statLabel}>Jornadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.treesPlantedCount}</Text>
            <Text style={styles.statLabel}>Árboles</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de Reportar microbotadero */}
      <TouchableOpacity 
        style={styles.reportCard}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/report')}>
        <View style={styles.reportCardContent}>
          <View style={styles.reportCardIcon}>
            <Ionicons name="trash-outline" size={28} color="#4CAF50" />
          </View>
          <View style={styles.reportCardText}>
            <Text style={styles.reportCardTitle}>Reportar microbotadero</Text>
            <Text style={styles.reportCardSubtitle}>Ayuda a mantener tu comunidad limpia</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </View>
      </TouchableOpacity>

      {/* CERCA DE TI */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CERCA DE TI</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Listado dinámico de puntos cercanos */}
        {nearbyItems.map(item => {
          const isBotadero = item.type === 'botadero';
          const isJornada = item.type === 'jornada';
          const isArbol = item.type === 'arbol';

          return (
            <View key={item.id} style={styles.nearbyCard}>
              <View style={styles.nearbyCardHeader}>
                <View
                  style={[
                    styles.nearbyBadge,
                    isJornada && styles.nearbyBadgeBlue,
                    isArbol && styles.nearbyBadgeGreen,
                  ]}>
                  <Text
                    style={[
                      styles.nearbyBadgeText,
                      isJornada && styles.nearbyBadgeBlueText,
                      isArbol && styles.nearbyBadgeGreenText,
                    ]}>
                    {item.categoryLabel}
                  </Text>
                </View>
                <View style={styles.nearbyDistance}>
                  <Ionicons name="location" size={14} color="#4CAF50" />
                  <Text style={styles.nearbyDistanceText}>{item.distance}</Text>
                </View>
              </View>
              <Text style={styles.nearbyTitle}>{item.title}</Text>
              <View style={styles.nearbyFooter}>
                <TouchableOpacity 
                  style={styles.nearbyButton}
                  onPress={() => router.push('/(tabs)/map')}>
                  <Text style={styles.nearbyButtonText}>Ver en mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* PRÓXIMAS JORNADAS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRÓXIMAS JORNADAS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {/* Evento 1 */}
        <View style={styles.eventCard}>
          <View style={styles.eventCardContent}>
            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDay}>Dom</Text>
              <Text style={styles.eventDate}>24</Text>
              <Text style={styles.eventMonth}>ago</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Limpieza de playa en Chorrillos</Text>
              <View style={styles.eventParticipants}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.eventParticipantsText}>
                  {joinedEvents['ev-1'] ? 35 : 34} participantes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.eventJoinButton,
                joinedEvents['ev-1'] && styles.eventJoinedButton,
              ]}
              onPress={() => handleJoin('ev-1', 'Limpieza de playa en Chorrillos')}>
              <Text style={styles.eventJoinText}>
                {joinedEvents['ev-1'] ? 'Unido ✓' : 'Unirse'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Evento 2 */}
        <View style={[styles.eventCard, { marginTop: 10 }]}>
          <View style={styles.eventCardContent}>
            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDay}>Sáb</Text>
              <Text style={styles.eventDate}>30</Text>
              <Text style={styles.eventMonth}>ago</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Siembra de 50 árboles en VES</Text>
              <View style={styles.eventParticipants}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.eventParticipantsText}>
                  {joinedEvents['ev-2'] ? 22 : 21} participantes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.eventJoinButton,
                joinedEvents['ev-2'] && styles.eventJoinedButton,
              ]}
              onPress={() => handleJoin('ev-2', 'Siembra de 50 árboles en VES')}>
              <Text style={styles.eventJoinText}>
                {joinedEvents['ev-2'] ? 'Unido ✓' : 'Unirse'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
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
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 14,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportCardText: {
    flex: 1,
  },
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportCardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.8,
  },
  seeAll: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  nearbyCard: {
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
  nearbyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nearbyBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nearbyBadgeText: {
    color: '#f44336',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nearbyBadgeBlue: {
    backgroundColor: '#e3f2fd',
  },
  nearbyBadgeBlueText: {
    color: '#1976d2',
  },
  nearbyBadgeGreen: {
    backgroundColor: '#e8f5e9',
  },
  nearbyBadgeGreenText: {
    color: '#388e3c',
  },
  nearbyDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  nearbyDistanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  nearbyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nearbyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  nearbyButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateContainer: {
    alignItems: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    marginRight: 15,
    minWidth: 50,
  },
  eventDay: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 1,
  },
  eventMonth: {
    fontSize: 12,
    color: '#666',
    textTransform: 'lowercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventParticipantsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventJoinButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventJoinedButton: {
    backgroundColor: '#2E7D32',
  },
  eventJoinText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});