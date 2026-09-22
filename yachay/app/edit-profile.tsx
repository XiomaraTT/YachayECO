import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useApp();

  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [phone, setPhone] = useState<string>(user.phone || '+51 987 654 321');
  const [district, setDistrict] = useState<string>(user.district || 'Chorrillos, Lima');
  const [bio, setBio] = useState<string>(user.bio || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri || null);
  const [saving, setSaving] = useState<boolean>(false);

  const handlePickAvatar = async () => {
    Alert.alert(
      'Foto de Perfil',
      'Selecciona el origen de tu foto de perfil',
      [
        {
          text: 'Tomar foto con la cámara',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets[0]) {
              setAvatarUri(res.assets[0].uri);
            }
          },
        },
        {
          text: 'Elegir de la galería',
          onPress: async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets[0]) {
              setAvatarUri(res.assets[0].uri);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      district: district.trim(),
      bio: bio.trim(),
      avatarUri: avatarUri || undefined,
    });
    setSaving(false);

    Alert.alert('Perfil actualizado', 'Tus datos han sido guardados con éxito.', [
      { text: 'Listo', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          style={[styles.saveHeaderButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.saveHeaderText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
            )}
            <View style={styles.cameraIconCircle}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickAvatar}>
            <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Campos de texto */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Nombre y Apellidos</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#666" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
            />
          </View>

          <Text style={styles.fieldLabel}>Correo Electrónico</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#666" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="tu.correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.fieldLabel}>Teléfono / WhatsApp</Text>
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={18} color="#666" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+51 999 888 777"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.fieldLabel}>Distrito de Voluntariado</Text>
          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={18} color="#666" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={district}
              onChangeText={setDistrict}
              placeholder="Chorrillos, Lima"
            />
          </View>

          <Text style={styles.fieldLabel}>Biografía / Interés Ambiental</Text>
          <View style={[styles.inputBox, styles.inputBoxMultiline]}>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Cuéntanos por qué eres voluntario ecológico..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Botón Guardar Inferior */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  saveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIconCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  formSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ece8',
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxMultiline: {
    height: 90,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  fieldInputMultiline: {
    height: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
