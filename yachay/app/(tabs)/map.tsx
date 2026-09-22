import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp, MapPoint } from '@/context/AppContext';
import { useRouter } from 'expo-router';

type FilterCategory = 'Todos' | 'Botaderos' | 'Jornadas' | 'Árboles';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

export default function MapScreen() {
  const router = useRouter();
  const { mapPoints, joinJornada, setUserLocation } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('Todos');
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  // Estados de GPS Real
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'granted' | 'denied' | 'idle'>('requesting');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationAddress, setUserLocationAddress] = useState<string>('Detectando satélites GPS...');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Solicitar permiso de ubicación al montar la pantalla
  useEffect(() => {
    requestGPSLocation();
  }, []);

  const requestGPSLocation = async () => {
    setIsLocating(true);
    setGpsStatus('requesting');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('denied');
        setUserLocationAddress('Permiso de GPS no concedido');
        Alert.alert(
          'Permiso de Ubicación',
          'Para ubicar los botaderos y jornadas más cercanas a ti, activa el GPS del teléfono.',
          [
            { text: 'Continuar sin GPS', style: 'cancel' },
            { text: 'Activar permisos', onPress: requestGPSLocation },
          ]
        );
        setIsLocating(false);
        return;
      }

      setGpsStatus('granted');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });

      // Geocodificación inversa para obtener la calle real del dispositivo
      const reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const street = item.street || item.name || 'Mi ubicación';
        const district = item.district || item.subregion || item.city || 'Lima';
        const fullAddress = `${street}, ${district}`;
        setUserLocationAddress(fullAddress);

        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address: fullAddress,
        });
      } else {
        setUserLocationAddress(`Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Error obteniendo ubicación GPS:', error);
      setGpsStatus('denied');
      setUserLocationAddress('Chorrillos, Lima (Referencial)');
    } finally {
      setIsLocating(false);
    }
  };

  // Filtrado de puntos y cálculo de distancia dinámica si el GPS está activo
  const filteredPoints = useMemo(() => {
    return mapPoints
      .map(pt => {
        let calculatedDistance = pt.distance;
        if (userCoords) {
          calculatedDistance = calculateDistanceKm(
            userCoords.lat,
            userCoords.lng,
            pt.latitude,
            pt.longitude
          );
        }
        return {
          ...pt,
          distance: calculatedDistance,
        };
      })
      .filter(pt => {
        if (selectedFilter === 'Botaderos' && pt.type !== 'botadero') return false;
        if (selectedFilter === 'Jornadas' && pt.type !== 'jornada') return false;
        if (selectedFilter === 'Árboles' && pt.type !== 'arbol') return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            pt.title.toLowerCase().includes(q) ||
            pt.address.toLowerCase().includes(q) ||
            pt.categoryLabel.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [mapPoints, selectedFilter, searchQuery, userCoords]);

  const handlePointAction = (point: MapPoint) => {
    if (point.type === 'jornada' || point.type === 'arbol') {
      joinJornada(point.id);
      Alert.alert('¡Excelente!', `Te has sumado a la actividad en "${point.title}". ¡Sumaste +100 puntos!`);
      setSelectedPoint(null);
    } else {
      setSelectedPoint(null);
      router.push('/(tabs)/report');
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra superior de control */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Mapa Comunitario</Text>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar zona o dirección..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Banner de Estado del GPS Real */}
        <TouchableOpacity
          style={[
            styles.gpsStatusBanner,
            gpsStatus === 'granted' ? styles.gpsBannerActive : styles.gpsBannerWarning,
          ]}
          onPress={requestGPSLocation}>
          <Ionicons
            name={gpsStatus === 'granted' ? 'navigate-circle' : 'warning-outline'}
            size={18}
            color={gpsStatus === 'granted' ? '#2E7D32' : '#E65100'}
          />
          <Text
            style={[
              styles.gpsBannerText,
              gpsStatus === 'granted' ? styles.gpsTextActive : styles.gpsTextWarning,
            ]}
            numberOfLines={1}>
            {isLocating
              ? 'Conectando con GPS...'
              : gpsStatus === 'granted'
              ? `Ubicación: ${userLocationAddress}`
              : 'GPS inactivo • Toca aquí para conceder permisos'}
          </Text>
          {isLocating ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Ionicons name="refresh" size={14} color="#666" />
          )}
        </TouchableOpacity>

        {/* Chips de filtro */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'Todos' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Todos')}>
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'Todos' && styles.filterChipTextActive,
              ]}>
              Todos ({mapPoints.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'Botaderos' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Botaderos')}>
            <Ionicons
              name="trash-outline"
              size={14}
              color={selectedFilter === 'Botaderos' ? '#fff' : '#f44336'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'Botaderos' && styles.filterChipTextActive,
              ]}>
              Botaderos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'Jornadas' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Jornadas')}>
            <Ionicons
              name="brush-outline"
              size={14}
              color={selectedFilter === 'Jornadas' ? '#fff' : '#1976d2'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'Jornadas' && styles.filterChipTextActive,
              ]}>
              Jornadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'Árboles' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Árboles')}>
            <Ionicons
              name="leaf-outline"
              size={14}
              color={selectedFilter === 'Árboles' ? '#fff' : '#388e3c'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'Árboles' && styles.filterChipTextActive,
              ]}>
              Árboles
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contenedor de Mapa Visual */}
      <View style={styles.mapCanvas}>
        <View style={styles.mapGridBackground}>
          <View style={[styles.mapBlock, { top: 40, left: 30, width: 140, height: 110 }]} />
          <View style={[styles.mapBlock, { top: 50, right: 25, width: 150, height: 130 }]} />
          <View style={[styles.mapBlock, { top: 190, left: 20, width: 150, height: 160 }]} />
          <View style={[styles.mapBlock, { top: 210, right: 30, width: 160, height: 150 }]} />
          <View style={[styles.mapBlock, { bottom: 60, left: 40, width: 130, height: 120 }]} />
          <View style={[styles.mapBlock, { bottom: 50, right: 35, width: 150, height: 130 }]} />

          <View style={styles.avenueHorizontal} />
          <View style={styles.avenueVertical} />
          <View style={styles.avenueDiagonal} />

          <Text style={[styles.streetLabel, { top: 155, left: 35 }]}>Av. Los Pinos</Text>
          <Text style={[styles.streetLabel, { top: 355, left: 30 }]}>Av. Bolognesi</Text>
          <Text style={[styles.parkLabel, { top: 80, left: 55 }]}>🌲 Parque</Text>
        </View>

        {/* Indicador de puntos activos */}
        <View style={styles.activeCountBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeCountText}>{filteredPoints.length} puntos activos</Text>
        </View>

        {/* Punto GPS del voluntario actual con pulso */}
        <View style={styles.userLocationMarker}>
          <View style={styles.userLocationPulse} />
          <View style={styles.userLocationDot} />
        </View>

        {/* Marcadores / Pines interactivos en el mapa */}
        {filteredPoints.map(point => {
          const isBotadero = point.type === 'botadero';
          const isJornada = point.type === 'jornada';
          const isArbol = point.type === 'arbol';

          return (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.mapPin,
                { top: `${point.yPercent}%`, left: `${point.xPercent}%` },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedPoint(point)}>
              <View
                style={[
                  styles.pinCircle,
                  isBotadero && styles.pinBotadero,
                  isJornada && styles.pinJornada,
                  isArbol && styles.pinArbol,
                ]}>
                <Ionicons
                  name={
                    isBotadero
                      ? 'trash'
                      : isJornada
                      ? 'people'
                      : 'leaf'
                  }
                  size={16}
                  color="#ffffff"
                />
              </View>
              <View
                style={[
                  styles.pinTriangle,
                  isBotadero && styles.triangleBotadero,
                  isJornada && styles.triangleJornada,
                  isArbol && styles.triangleArbol,
                ]}
              />
            </TouchableOpacity>
          );
        })}

        {/* Botón flotante para centrar mapa en mi ubicación GPS */}
        <TouchableOpacity
          style={styles.gpsCenterButton}
          onPress={requestGPSLocation}>
          <Ionicons name="locate" size={24} color="#4CAF50" />
        </TouchableOpacity>

        {/* Leyenda inferior */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>Botadero</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1976d2' }]} />
            <Text style={styles.legendText}>Jornada</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#388e3c' }]} />
            <Text style={styles.legendText}>Árboles</Text>
          </View>
        </View>
      </View>

      {/* Modal / Card inferior de detalle al tocar un pin */}
      <Modal
        visible={!!selectedPoint}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPoint(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPoint(null)}>
          <View style={styles.pointDetailCard}>
            <View style={styles.cardDragHandle} />

            {selectedPoint && (
              <>
                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.detailBadge,
                      selectedPoint.type === 'jornada' && styles.detailBadgeBlue,
                      selectedPoint.type === 'arbol' && styles.detailBadgeGreen,
                    ]}>
                    <Text
                      style={[
                        styles.detailBadgeText,
                        selectedPoint.type === 'jornada' && styles.detailBadgeBlueText,
                        selectedPoint.type === 'arbol' && styles.detailBadgeGreenText,
                      ]}>
                      {selectedPoint.categoryLabel}
                    </Text>
                  </View>
                  <View style={styles.detailDistance}>
                    <Ionicons name="navigate-outline" size={13} color="#4CAF50" />
                    <Text style={styles.detailDistanceText}>A {selectedPoint.distance} de ti</Text>
                  </View>
                </View>

                <Text style={styles.detailTitle}>{selectedPoint.title}</Text>
                <Text style={styles.detailAddress}>
                  <Ionicons name="location-outline" size={14} color="#666" /> {selectedPoint.address}
                </Text>

                {selectedPoint.description && (
                  <Text style={styles.detailDesc}>{selectedPoint.description}</Text>
                )}

                {selectedPoint.date && (
                  <View style={styles.extraInfoRow}>
                    <Ionicons name="calendar-outline" size={15} color="#555" />
                    <Text style={styles.extraInfoText}>{selectedPoint.date}</Text>
                  </View>
                )}

                {selectedPoint.participants !== undefined && (
                  <View style={styles.extraInfoRow}>
                    <Ionicons name="people-outline" size={15} color="#555" />
                    <Text style={styles.extraInfoText}>
                      {selectedPoint.participants} voluntarios confirmados
                    </Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.closeCardButton}
                    onPress={() => setSelectedPoint(null)}>
                    <Text style={styles.closeCardText}>Cerrar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => handlePointAction(selectedPoint)}>
                    <Text style={styles.primaryActionText}>
                      {selectedPoint.type === 'botadero'
                        ? 'Reportar limpieza (+50)'
                        : 'Unirme a la jornada (+100)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    backgroundColor: '#ffffff',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  gpsStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  gpsBannerActive: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  gpsBannerWarning: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  gpsBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  gpsTextActive: {
    color: '#2E7D32',
  },
  gpsTextWarning: {
    color: '#E65100',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#eaf1ea',
    overflow: 'hidden',
  },
  mapGridBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eaf1ea',
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: '#f6f9f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dce5da',
  },
  avenueHorizontal: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d8ded6',
  },
  avenueVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '52%',
    width: 24,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d8ded6',
  },
  avenueDiagonal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '20%',
    width: 16,
    backgroundColor: '#fbfcfb',
    transform: [{ rotate: '35deg' }],
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    color: '#9aa099',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  parkLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '600',
    color: '#388e3c',
  },
  activeCountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  activeCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  userLocationMarker: {
    position: 'absolute',
    top: '48%',
    left: '49%',
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(33, 150, 243, 0.35)',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pinBotadero: {
    backgroundColor: '#f44336',
  },
  pinJornada: {
    backgroundColor: '#1976d2',
  },
  pinArbol: {
    backgroundColor: '#388e3c',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  triangleBotadero: {
    borderTopColor: '#f44336',
  },
  triangleJornada: {
    borderTopColor: '#1976d2',
  },
  triangleArbol: {
    borderTopColor: '#388e3c',
  },
  gpsCenterButton: {
    position: 'absolute',
    bottom: 55,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pointDetailCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailBadgeText: {
    color: '#f44336',
    fontSize: 10,
    fontWeight: '700',
  },
  detailBadgeBlue: {
    backgroundColor: '#e3f2fd',
  },
  detailBadgeBlueText: {
    color: '#1976d2',
  },
  detailBadgeGreen: {
    backgroundColor: '#e8f5e9',
  },
  detailBadgeGreenText: {
    color: '#388e3c',
  },
  detailDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailDistanceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  detailAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  detailDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  extraInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  extraInfoText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  closeCardButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  closeCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  primaryActionButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
