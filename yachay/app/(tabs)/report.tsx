import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useApp } from '@/context/AppContext';
import { syncReportToSupabase } from '@/services/supabase';

type ProblemType = 'Microbotadero' | 'Quema de residuos' | 'Vertimiento' | 'Otro';
type SeverityType = 'Leve' | 'Moderado' | 'Grave';

const PROBLEM_OPTIONS: { type: ProblemType; label: string; desc: string; icon: any }[] = [
  {
    type: 'Microbotadero',
    label: 'Microbotadero',
    desc: 'Acumulación de basura ilegal',
    icon: 'trash-outline',
  },
  {
    type: 'Quema de residuos',
    label: 'Quema de residuos',
    desc: 'Quema clandestina de basura',
    icon: 'flame-outline',
  },
  {
    type: 'Vertimiento',
    label: 'Vertimiento',
    desc: 'Residuos en ríos o canales',
    icon: 'water-outline',
  },
  {
    type: 'Otro',
    label: 'Otro',
    desc: 'Otro tipo de problema ambiental',
    icon: 'warning-outline',
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const { user, addReport, userLocation } = useApp();

  const [step, setStep] = useState<number>(1);
  const [problemType, setProblemType] = useState<ProblemType>('Microbotadero');
  const [severity, setSeverity] = useState<SeverityType>('Leve');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('Av. Los Pinos 342, Chorrillos');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -12.1783,
    lng: -77.0145,
  });
  const [description, setDescription] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Iniciando...');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Al pasar al paso 2, solicitar permiso de ubicación y GPS automáticamente
  useEffect(() => {
    if (step === 2) {
      handleDetectLocation();
    }
  }, [step]);

  // Tomar foto con la cámara (solicita permiso explícito)
  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permiso de Cámara Denegado',
          'Para tomar la foto de evidencia, debes conceder permiso de acceso a la cámara.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Conceder permiso', onPress: handleTakePhoto },
          ]
        );
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch (e) {
      console.log('Camera error, fallback to mock image:', e);
      setPhotoUri('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80');
    }
  };

  // Seleccionar foto de la galería (solicita permiso)
  const handlePickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Se requiere acceso a las fotos para seleccionar la evidencia.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch (e) {
      console.log('Gallery error, fallback to mock image:', e);
      setPhotoUri('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80');
    }
  };

  // Detección de GPS en tiempo real con permisos activos
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setGpsStatus('Buscando satélites...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('Permiso GPS denegado');
        Alert.alert(
          'Permiso GPS Requerido',
          'La app necesita conocer tu ubicación para georreferenciar el microbotadero.',
          [
            { text: 'Usar Chorrillos por defecto', style: 'cancel' },
            { text: 'Conceder permiso', onPress: handleDetectLocation },
          ]
        );
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      const rev = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (rev && rev.length > 0) {
        const item = rev[0];
        const street = item.street || item.name || 'Av. Los Pinos 342';
        const district = item.district || item.subregion || item.city || 'Chorrillos';
        const detectedAddress = `${street}, ${district}`;
        setAddress(detectedAddress);
        setGpsStatus(`GPS Activo (±${Math.round(loc.coords.accuracy || 10)}m)`);
      } else {
        setGpsStatus('Coordenadas detectadas');
      }
    } catch (e) {
      console.log('Location error:', e);
      setGpsStatus('GPS no disponible');
    } finally {
      setIsLocating(false);
    }
  };

  // Enviar reporte final
  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    const reportData = {
      type: problemType,
      severity,
      imageUri: photoUri || undefined,
      address,
      description,
      latitude: coords.lat,
      longitude: coords.lng,
    };

    // 1. Guardar en estado global y persistencia local (reactivo)
    addReport(reportData);

    // 2. Intentar sincronización con Supabase (en segundo plano)
    await syncReportToSupabase({
      type: problemType,
      severity,
      photo_url: photoUri || undefined,
      latitude: coords.lat,
      longitude: coords.lng,
      address,
      description,
      status: 'activo',
    });

    setIsSubmitting(false);
    setStep(4); // Pantalla de éxito
  };

  const handleResetAndHome = () => {
    setStep(1);
    setProblemType('Microbotadero');
    setSeverity('Leve');
    setPhotoUri(null);
    setDescription('');
    router.push('/(tabs)' as any);
  };

  // ==========================================
  // PANTALLA DE ÉXITO (CONFIRMACIÓN)
  // ==========================================
  if (step === 4) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={48} color="#fff" />
          </View>

          <Text style={styles.successTitle}>¡Reporte enviado!</Text>
          <Text style={styles.successSubtitle}>
            Gracias, {user.name.split(' ')[0]}. Tu reporte ayuda a mantener tu comunidad limpia.
          </Text>

          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={18} color="#f9a825" />
            <Text style={styles.pointsBadgeText}>+50 puntos ganados</Text>
          </View>
          <Text style={styles.totalPointsText}>
            Total: {(user.points).toLocaleString()} pts • Nivel {user.level}
          </Text>

          <TouchableOpacity style={styles.homeButton} onPress={handleResetAndHome}>
            <Text style={styles.homeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // FORMULARIO WIZARD (PASOS 1, 2, 3)
  // ==========================================
  return (
    <View style={styles.container}>
      {/* Header superior con barra de progreso */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {step > 1 ? (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Nuevo Reporte</Text>
            <Text style={styles.headerSubtitle}>Paso {step} de 3</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Barra de progreso de 3 segmentos */}
        <View style={styles.wizardProgressTrack}>
          <View style={[styles.wizardProgressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ========================================== */}
        {/* PASO 1: ¿Qué tipo de problema encontraste? */}
        {/* ========================================== */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionQuestion}>¿Qué tipo de problema encontraste?</Text>

            <View style={styles.optionsList}>
              {PROBLEM_OPTIONS.map(opt => {
                const isSelected = problemType === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    activeOpacity={0.7}
                    onPress={() => setProblemType(opt.type)}>
                    <View
                      style={[
                        styles.optionIconContainer,
                        isSelected && styles.optionIconContainerSelected,
                      ]}>
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={isSelected ? '#4CAF50' : '#666'}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ========================================== */}
        {/* PASO 2: Gravedad, Foto y Ubicación */}
        {/* ========================================== */}
        {step === 2 && (
          <View style={styles.stepContent}>
            {/* Gravedad */}
            <Text style={styles.sectionQuestion}>¿Cuál es la gravedad?</Text>
            <View style={styles.severityRow}>
              {(['Leve', 'Moderado', 'Grave'] as SeverityType[]).map(sev => {
                const isSelected = severity === sev;
                return (
                  <TouchableOpacity
                    key={sev}
                    style={[
                      styles.severityButton,
                      isSelected && styles.severityButtonSelected,
                    ]}
                    onPress={() => setSeverity(sev)}>
                    <Text
                      style={[
                        styles.severityButtonText,
                        isSelected && styles.severityButtonTextSelected,
                      ]}>
                      {sev}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Añadir foto */}
            <Text style={[styles.sectionQuestion, { marginTop: 24 }]}>Añade una foto</Text>
            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <View style={styles.photoActionButtons}>
                  <TouchableOpacity
                    style={styles.retakePhotoButton}
                    onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={16} color="#fff" />
                    <Text style={styles.photoActionText}>Retomar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() => setPhotoUri(null)}>
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.photoActionText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity
                  style={styles.photoOptionButton}
                  activeOpacity={0.8}
                  onPress={handleTakePhoto}>
                  <View style={styles.photoOptionIconCircle}>
                    <Ionicons name="camera" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.photoOptionTitle}>Tomar con Cámara</Text>
                  <Text style={styles.photoOptionSubtitle}>Solicita permiso de cámara</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoOptionButton}
                  activeOpacity={0.8}
                  onPress={handlePickFromGallery}>
                  <View style={styles.photoOptionIconCircle}>
                    <Ionicons name="images" size={24} color="#1976d2" />
                  </View>
                  <Text style={styles.photoOptionTitle}>Elegir de Galería</Text>
                  <Text style={styles.photoOptionSubtitle}>Fotos del dispositivo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Ubicación */}
            <View style={styles.locationHeaderRow}>
              <Text style={styles.sectionQuestion}>Ubicación</Text>
              <View style={styles.gpsLiveBadge}>
                <Ionicons name="radio-outline" size={12} color="#2E7D32" />
                <Text style={styles.gpsLiveText}>{gpsStatus}</Text>
              </View>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location-sharp" size={22} color="#e53935" style={{ marginTop: 2 }} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationInputLabel}>Dirección (editable):</Text>
                  <TextInput
                    style={styles.locationInput}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Ingresa la calle o referencia..."
                  />
                  <Text style={styles.locationCoords}>
                    Coordenadas: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.refreshGpsButton}
                onPress={handleDetectLocation}
                disabled={isLocating}>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 6 }} />
                ) : (
                  <Ionicons
                    name="navigate-outline"
                    size={14}
                    color="#4CAF50"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={styles.refreshGpsText}>
                  {isLocating ? 'Detectando señal...' : 'Actualizar GPS en tiempo real'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================== */}
        {/* PASO 3: Descripción y Resumen */}
        {/* ========================================== */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionQuestion}>Descripción (opcional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe lo que observaste..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            {/* Tarjeta de Resumen */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeader}>RESUMEN DEL REPORTE</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo</Text>
                <Text style={styles.summaryValue}>{problemType}</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gravedad</Text>
                <Text style={styles.summaryValue}>{severity}</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ubicación</Text>
                <Text style={[styles.summaryValue, { maxWidth: '60%', textAlign: 'right' }]}>
                  {address}
                </Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Puntos a ganar</Text>
                <View style={styles.summaryPointsBadge}>
                  <Ionicons name="star" size={12} color="#f9a825" />
                  <Text style={styles.summaryPointsText}>+50 pts</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón de acción inferior fijo */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep(step + 1)}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.continueButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmitReport}
            disabled={isSubmitting}>
            <Text style={styles.continueButtonText}>
              {isSubmitting ? 'Enviando a la nube...' : 'Enviar reporte'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  wizardProgressTrack: {
    height: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  wizardProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContent: {
    paddingBottom: 20,
  },
  sectionQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionIconContainerSelected: {
    backgroundColor: '#e8f5e9',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  optionTitleSelected: {
    color: '#2E7D32',
  },
  optionDesc: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  severityButtonSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  severityButtonTextSelected: {
    color: '#2E7D32',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoOptionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  photoOptionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  photoOptionSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  photoPreviewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  photoActionButtons: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  retakePhotoButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  deletePhotoButton: {
    backgroundColor: 'rgba(211, 47, 47, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  photoActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  gpsLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  gpsLiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  locationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationInputLabel: {
    fontSize: 11,
    color: '#777',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationCoords: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  refreshGpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
  },
  refreshGpsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  descriptionInput: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    fontSize: 14,
    color: '#333',
    minHeight: 110,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ededed',
  },
  summaryPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  summaryPointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f9a825',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  successCard: {
    alignItems: 'center',
    width: '100%',
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  pointsBadgeText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '700',
  },
  totalPointsText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
