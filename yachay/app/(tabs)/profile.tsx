import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con fondo verde */}
      <View style={styles.header}>
        {/* Icono de perfil y nombre */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>XT</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Xiomara Torres</Text>
            <View style={styles.badgeContainer}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.badgeText}>Guardión Verde</Text>
            </View>
          </View>
        </View>

        {/* Puntos y nivel */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>NIVEL 3</Text>
            <Text style={styles.statLabel}>Nivel actual</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,250 pts</Text>
            <Text style={styles.statLabel}>Puntos totales</Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Nivel 3</Text>
            <Text style={styles.progressLabel}>Nivel 4</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressPoints}>
            <Text style={styles.progressText}>500 pts</Text>
            <Text style={styles.progressText}>1,500 pts</Text>
          </View>
        </View>
      </View>

      {/* Mi Impacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MI IMPACTO</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>12</Text>
            <Text style={styles.impactLabel}>Reportes realizados</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>5</Text>
            <Text style={styles.impactLabel}>Jornadas participadas</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>8</Text>
            <Text style={styles.impactLabel}>Zonas recuperadas</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>3</Text>
            <Text style={styles.impactLabel}>Árboles sembrados</Text>
          </View>
        </View>
      </View>

      {/* Mis Logros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MIS LOGROS</Text>
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trophy-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Primer Reporte</Text>
              <Text style={styles.achievementDate}>Completado</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementBadgeText}>1</Text>
            </View>
          </View>

          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="shield" size={24} color="#4CAF50" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Guardión Verde</Text>
              <Text style={styles.achievementDate}>Completado</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementBadgeText}>1</Text>
            </View>
          </View>

          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>EcoActivo</Text>
              <Text style={styles.achievementDate}>Completado</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementBadgeText}>1</Text>
            </View>
          </View>
        </View>
      </View>

      {/* MI ACTIVIDAD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MI ACTIVIDAD</Text>

        {/* Actividad 1 */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="trash-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.activityTitle}>
              Reportaste un microbotadero
            </Text>
          </View>
          <Text style={styles.activityLocation}>
            <Ionicons name="location-outline" size={14} color="#666" /> Av. Los
            Pinos 342, Chorrillos
          </Text>
          <View style={styles.activityFooter}>
            <Text style={styles.activityDate}>
              <Ionicons name="time-outline" size={14} color="#666" /> Hoy, 9:14
              am
            </Text>
            <View style={styles.activityPoints}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.activityPointsText}>+50 pts</Text>
            </View>
          </View>
        </View>

        {/* Actividad 2 */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="brush-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.activityTitle}>
              Participaste en una jornada de limpieza
            </Text>
          </View>
          <Text style={styles.activityLocation}>
            <Ionicons name="location-outline" size={14} color="#666" /> Parque
            Zonal Sinchi Roca
          </Text>
          <View style={styles.activityFooter}>
            <Text style={styles.activityDate}>
              <Ionicons name="time-outline" size={14} color="#666" /> Ayer, 8:00
              am
            </Text>
            <View style={styles.activityPoints}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.activityPointsText}>+100 pts</Text>
            </View>
          </View>
        </View>

        {/* Actividad 3 */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="leaf-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.activityTitle}>
              Participaste en arborización
            </Text>
          </View>
          <Text style={styles.activityLocation}>
            <Ionicons name="location-outline" size={14} color="#666" />{" "}
            Humedales de Villa
          </Text>
          <View style={styles.activityFooter}>
            <Text style={styles.activityDate}>
              <Ionicons name="time-outline" size={14} color="#666" /> 18 ago,
              7:30 am
            </Text>
            <View style={styles.activityPoints}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.activityPointsText}>+80 pts</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CONFIGURACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
        <View style={styles.configCard}>
          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configLeft}>
              <Ionicons name="person-outline" size={22} color="#4CAF50" />
              <Text style={styles.configText}>Editar perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#4CAF50"
              />
              <Text style={styles.configText}>Notificaciones</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#d1d1d1", true: "#4CAF50" }}
              thumbColor={notifications ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" />
              <Text style={styles.configText}>Privacidad</Text>
            </View>
            <Switch
              value={privacy}
              onValueChange={setPrivacy}
              trackColor={{ false: "#d1d1d1", true: "#4CAF50" }}
              thumbColor={privacy ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.configItem, styles.configItemLast]}>
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

      {/* Espacio extra al final */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 15,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 5,
  },
  progressFill: {
    width: "45%",
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  progressPoints: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    letterSpacing: 1,
  },
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  impactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  impactNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  impactLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  achievementsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  achievementDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  achievementBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  achievementBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Estilos para MI ACTIVIDAD
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  activityLocation: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    marginLeft: 42,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 42,
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
  },
  activityPoints: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityPointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f9a825",
    marginLeft: 4,
  },
  // Estilos para CONFIGURACIÓN
  configCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  configItemLast: {
    borderBottomWidth: 0,
  },
  configLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  configText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
  },
  configTextDanger: {
    color: "#f44336",
  },
});
