import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

type RewardTab = 'Logros' | 'Canjear' | 'Ranking';

export default function RewardsScreen() {
  const { user, achievements, rewards, leaderboard, redeemReward } = useApp();
  const [activeTab, setActiveTab] = useState<RewardTab>('Logros');

  const handleRedeem = (rewardId: string, title: string, cost: number) => {
    if (user.points < cost) {
      Alert.alert(
        'Puntos insuficientes',
        `Necesitas ${cost.toLocaleString()} puntos para canjear "${title}". Tu saldo actual es de ${user.points.toLocaleString()} pts.`
      );
      return;
    }

    Alert.alert(
      'Confirmar canje',
      `¿Deseas canjear "${title}" por ${cost.toLocaleString()} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: () => {
            const success = redeemReward(rewardId);
            if (success) {
              Alert.alert(
                '¡Canje exitoso! 🎉',
                `Has canjeado "${title}". Se te ha enviado el código a tu correo electrónico registrado.`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con tarjeta de puntos */}
      <View style={styles.header}>
        <View style={styles.headerHeader}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.headerTitle}>Recompensas</Text>
            <Text style={styles.headerSubtitle}>Tu impacto tiene valor</Text>
          </View>
        </View>

        <View style={styles.pointsCard}>
          <View>
            <Text style={styles.pointsCardLabel}>Tus puntos disponibles</Text>
            <Text style={styles.pointsCardValue}>{user.points.toLocaleString()} pts</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankLabel}>Rango</Text>
            <Text style={styles.rankValue}>{user.rank}</Text>
          </View>
        </View>
      </View>

      {/* Tabs Selector */}
      <View style={styles.tabBar}>
        {(['Logros', 'Canjear', 'Ranking'] as RewardTab[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {/* ========================================== */}
        {/* TAB 1: LOGROS */}
        {/* ========================================== */}
        {activeTab === 'Logros' && (
          <View style={styles.tabContent}>
            {achievements.map(ach => (
              <View key={ach.id} style={styles.achievementCard}>
                <View
                  style={[
                    styles.achievementIconCircle,
                    ach.completed ? styles.iconUnlocked : styles.iconLocked,
                  ]}>
                  <Ionicons
                    name={ach.iconName as any}
                    size={24}
                    color={ach.completed ? '#4CAF50' : '#aaa'}
                  />
                </View>

                <View style={styles.achievementDetails}>
                  <View style={styles.achievementTitleRow}>
                    <Text style={styles.achievementTitle}>{ach.title}</Text>
                    <View
                      style={[
                        styles.achievementStatusBadge,
                        ach.completed ? styles.statusUnlocked : styles.statusLocked,
                      ]}>
                      <Text
                        style={[
                          styles.achievementStatusText,
                          ach.completed ? styles.statusUnlockedText : styles.statusLockedText,
                        ]}>
                        {ach.completed ? 'Obtenido' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.achievementDesc}>{ach.description}</Text>
                </View>

                <View style={styles.achievementPoints}>
                  <Text
                    style={[
                      styles.achievementPointsText,
                      ach.completed && styles.achievementPointsTextGreen,
                    ]}>
                    +{ach.points}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ========================================== */}
        {/* TAB 2: CANJEAR */}
        {/* ========================================== */}
        {activeTab === 'Canjear' && (
          <View style={styles.tabContent}>
            <Text style={styles.catalogNote}>
              Canjea tus puntos por implementos ecológicos y beneficios gracias a nuestros aliados.
            </Text>

            {rewards.map(reward => {
              const canAfford = user.points >= reward.cost;
              return (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={styles.rewardIconBox}>
                    <Ionicons
                      name={
                        reward.category.includes('Semilla')
                          ? 'leaf'
                          : reward.category.includes('Cultura')
                          ? 'ticket'
                          : reward.category.includes('Movilidad')
                          ? 'bus'
                          : 'gift'
                      }
                      size={24}
                      color="#4CAF50"
                    />
                  </View>

                  <View style={styles.rewardDetails}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardOrg}>{reward.organization}</Text>
                    <View style={styles.costBadge}>
                      <Ionicons name="star" size={12} color="#f9a825" />
                      <Text style={styles.costText}>{reward.cost.toLocaleString()} pts</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      reward.redeemed && styles.redeemButtonDone,
                      !canAfford && !reward.redeemed && styles.redeemButtonDisabled,
                    ]}
                    onPress={() => handleRedeem(reward.id, reward.title, reward.cost)}
                    disabled={reward.redeemed || !canAfford}>
                    <Text
                      style={[
                        styles.redeemButtonText,
                        !canAfford && !reward.redeemed && styles.redeemButtonTextDisabled,
                      ]}>
                      {reward.redeemed ? 'Canjeado' : 'Canjear'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* ========================================== */}
        {/* TAB 3: RANKING */}
        {/* ========================================== */}
        {activeTab === 'Ranking' && (
          <View style={styles.tabContent}>
            {/* Podio visual de los 3 primeros */}
            <View style={styles.podiumContainer}>
              {/* Puesto 2 */}
              <View style={[styles.podiumColumn, styles.podiumSecond]}>
                <View style={[styles.podiumAvatar, styles.avatarSecond]}>
                  <Text style={styles.podiumAvatarText}>LR</Text>
                  <View style={[styles.rankMedal, { backgroundColor: '#B0BEC5' }]}>
                    <Text style={styles.rankMedalText}>2</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>Lucía R.</Text>
                <Text style={styles.podiumPoints}>1,830 pts</Text>
                <View style={[styles.podiumStep, { height: 75, backgroundColor: '#cfd8dc' }]}>
                  <Text style={styles.podiumStepNumber}>2</Text>
                </View>
              </View>

              {/* Puesto 1 (Centro) */}
              <View style={[styles.podiumColumn, styles.podiumFirst]}>
                <Ionicons name="sparkles" size={18} color="#FFD700" style={{ marginBottom: 2 }} />
                <View style={[styles.podiumAvatar, styles.avatarFirst]}>
                  <Text style={styles.podiumAvatarText}>CM</Text>
                  <View style={[styles.rankMedal, { backgroundColor: '#FFD700' }]}>
                    <Text style={styles.rankMedalText}>1</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>Carlos M.</Text>
                <Text style={styles.podiumPoints}>2,140 pts</Text>
                <View style={[styles.podiumStep, { height: 100, backgroundColor: '#ffe082' }]}>
                  <Text style={styles.podiumStepNumber}>1</Text>
                </View>
              </View>

              {/* Puesto 3 (Tú) */}
              <View style={[styles.podiumColumn, styles.podiumThird]}>
                <View style={[styles.podiumAvatar, styles.avatarThird]}>
                  <Text style={styles.podiumAvatarText}>XT</Text>
                  <View style={[styles.rankMedal, { backgroundColor: '#bcaaa4' }]}>
                    <Text style={styles.rankMedalText}>3</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>Xiomara (Tú)</Text>
                <Text style={styles.podiumPoints}>{user.points.toLocaleString()} pts</Text>
                <View style={[styles.podiumStep, { height: 60, backgroundColor: '#d7ccc8' }]}>
                  <Text style={styles.podiumStepNumber}>3</Text>
                </View>
              </View>
            </View>

            {/* Lista del ranking */}
            <View style={styles.rankingListCard}>
              <Text style={styles.rankingCardHeader}>Ranking de Guardianes Verdes • Lima Metropolitana</Text>
              {leaderboard.map(item => (
                <View
                  key={item.id}
                  style={[
                    styles.rankingRow,
                    item.isCurrentUser && styles.rankingRowHighlight,
                  ]}>
                  <Text style={styles.rankingPosition}>#{item.rank}</Text>
                  <View style={styles.rankingAvatarCircle}>
                    <Text style={styles.rankingAvatarInitial}>{item.avatarText}</Text>
                  </View>
                  <Text style={[styles.rankingItemName, item.isCurrentUser && styles.boldText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.rankingItemPoints, item.isCurrentUser && styles.boldGreenText]}>
                    {item.points.toLocaleString()} pts
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
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
  headerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pointsCardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  pointsCardValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  rankBadge: {
    alignItems: 'flex-end',
  },
  rankLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  rankValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#4CAF50',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  tabButtonTextActive: {
    color: '#4CAF50',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabContent: {
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  achievementIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconUnlocked: {
    backgroundColor: '#e8f5e9',
  },
  iconLocked: {
    backgroundColor: '#f5f5f5',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  achievementStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusUnlocked: {
    backgroundColor: '#e8f5e9',
  },
  statusUnlockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#388e3c',
  },
  statusLocked: {
    backgroundColor: '#f5f5f5',
  },
  statusLockedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
  },
  achievementPoints: {
    marginLeft: 8,
  },
  achievementPointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  achievementPointsTextGreen: {
    color: '#4CAF50',
  },
  catalogNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  rewardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rewardOrg: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f9a825',
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  redeemButtonDone: {
    backgroundColor: '#9E9E9E',
  },
  redeemButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  redeemButtonTextDisabled: {
    color: '#888',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 20,
    marginBottom: 15,
  },
  podiumColumn: {
    alignItems: 'center',
    width: 90,
  },
  podiumFirst: {
    zIndex: 3,
  },
  podiumSecond: {
    marginRight: -5,
  },
  podiumThird: {
    marginLeft: -5,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  avatarFirst: {
    backgroundColor: '#fff3e0',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarSecond: {
    backgroundColor: '#eceff1',
    borderWidth: 2,
    borderColor: '#B0BEC5',
  },
  avatarThird: {
    backgroundColor: '#efebe9',
    borderWidth: 2,
    borderColor: '#bcaaa4',
  },
  podiumAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
  },
  rankMedal: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankMedalText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  podiumPoints: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 6,
  },
  podiumStep: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumStepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.35)',
  },
  rankingListCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  rankingCardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingRowHighlight: {
    backgroundColor: '#f1f8e9',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  rankingPosition: {
    width: 30,
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  rankingAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankingAvatarInitial: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rankingItemName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  rankingItemPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  boldGreenText: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});
