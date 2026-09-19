import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con saludo */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>¡Buenos días,</Text>
            <Text style={styles.userName}>Xiomara 🍀</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Jornadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Árboles</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de Reportar microbotadero */}
      <TouchableOpacity style={styles.reportCard}>
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
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Microbotadero activo */}
        <View style={styles.nearbyCard}>
          <View style={styles.nearbyCardHeader}>
            <View style={styles.nearbyBadge}>
              <Text style={styles.nearbyBadgeText}>MICROBOTADERO ACTIVO</Text>
            </View>
            <View style={styles.nearbyDistance}>
              <Ionicons name="location" size={14} color="#4CAF50" />
              <Text style={styles.nearbyDistanceText}>0.8 km</Text>
            </View>
          </View>
          <Text style={styles.nearbyTitle}>Av. Los Pinos 342, Chorrillos</Text>
          <View style={styles.nearbyFooter}>
            <TouchableOpacity style={styles.nearbyButton}>
              <Text style={styles.nearbyButtonText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Jornada de limpieza */}
        <View style={styles.nearbyCard}>
          <View style={styles.nearbyCardHeader}>
            <View style={[styles.nearbyBadge, styles.nearbyBadgeBlue]}>
              <Text style={styles.nearbyBadgeText}>JORNADA DE LIMPIEZA</Text>
            </View>
            <View style={styles.nearbyDistance}>
              <Ionicons name="location" size={14} color="#4CAF50" />
              <Text style={styles.nearbyDistanceText}>1.2 km</Text>
            </View>
          </View>
          <Text style={styles.nearbyTitle}>Parque Zonal Sinchi Roca</Text>
          <View style={styles.nearbyFooter}>
            <TouchableOpacity style={styles.nearbyButton}>
              <Text style={styles.nearbyButtonText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Arborización */}
        <View style={styles.nearbyCard}>
          <View style={styles.nearbyCardHeader}>
            <View style={[styles.nearbyBadge, styles.nearbyBadgeGreen]}>
              <Text style={styles.nearbyBadgeText}>ARBORIZACIÓN</Text>
            </View>
            <View style={styles.nearbyDistance}>
              <Ionicons name="location" size={14} color="#4CAF50" />
              <Text style={styles.nearbyDistanceText}>2.5 km</Text>
            </View>
          </View>
          <Text style={styles.nearbyTitle}>Humedales de Villa</Text>
          <View style={styles.nearbyFooter}>
            <TouchableOpacity style={styles.nearbyButton}>
              <Text style={styles.nearbyButtonText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* PRÓXIMAS JORNADAS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRÓXIMAS JORNADAS</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

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
                <Text style={styles.eventParticipantsText}>34 participantes</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.eventJoinButton}>
              <Text style={styles.eventJoinText}>Unirse</Text>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.8)',
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
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  seeAll: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
  },
  nearbyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '500',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    minWidth: 60,
  },
  eventDay: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventJoinText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});