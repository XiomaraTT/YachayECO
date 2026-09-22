import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllNotificationsAsRead } = useApp();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.markReadButton} onPress={markAllNotificationsAsRead}>
          <Text style={styles.markReadText}>Marcar leídas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No tienes notificaciones pendientes</Text>
            <Text style={styles.emptySubtitle}>Te avisaremos cuando haya nuevas jornadas cerca de ti.</Text>
          </View>
        ) : (
          notifications.map(item => {
            const isEvent = item.type === 'event';
            const isReward = item.type === 'reward';

            return (
              <View
                key={item.id}
                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
                <View
                  style={[
                    styles.iconCircle,
                    isEvent && styles.iconEvent,
                    isReward && styles.iconReward,
                  ]}>
                  <Ionicons
                    name={
                      isEvent
                        ? 'people'
                        : isReward
                        ? 'star'
                        : 'notifications'
                    }
                    size={20}
                    color="#fff"
                  />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifDesc}>{item.description}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            );
          })
        )}

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
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  unreadCard: {
    backgroundColor: '#f1f8e9',
    borderColor: '#c8e6c9',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEvent: {
    backgroundColor: '#1976d2',
  },
  iconReward: {
    backgroundColor: '#4CAF50',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  notifDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
});
