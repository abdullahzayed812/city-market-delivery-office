import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wallet, TrendingUp, Calendar, Building2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useEarnings } from '../hooks/useEarnings';

const StatusBadge = ({ status }: { status: string }) => (
  <View style={[styles.badge, status === 'PAID' ? styles.badgePaid : styles.badgePending]}>
    <Text style={[styles.badgeText, status === 'PAID' ? styles.badgeTextPaid : styles.badgeTextPending]}>
      {status}
    </Text>
  </View>
);

const EarningsScreen = () => {
  const { t } = useTranslation();
  const { pendingData, settlements, totalPendingPayout, unsettledDeliveries, isLoading } = useEarnings();

  const renderSettlementItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <TrendingUp size={18} color={theme.colors.success} />
        </View>
        <View>
          <Text style={styles.cardTitle}>
            {new Date(item.periodStart).toLocaleDateString()} – {new Date(item.periodEnd).toLocaleDateString()}
          </Text>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.colors.textLight} />
            <Text style={styles.dateText}>{item.deliveryCount} {t('earnings.deliveries', 'deliveries')}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amountText}>EGP {Number(item.netPayout).toLocaleString()}</Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Building2 size={20} color={theme.colors.white} />
            <Text style={styles.headerTitle}>{t('earnings.title', 'Earnings')}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('earnings.pending_payout', 'Pending Payout')}</Text>
              <Text style={styles.statValue}>EGP {totalPendingPayout.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('earnings.unsettled_deliveries', 'Unsettled')}</Text>
              <Text style={styles.statValue}>{unsettledDeliveries}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>{t('earnings.settlement_history', 'Settlement History')}</Text>
          <FlatList
            data={settlements}
            renderItem={renderSettlementItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Wallet size={56} color={theme.colors.border} />
                <Text style={styles.emptyText}>{t('earnings.no_earnings_history', 'No settlements yet')}</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.secondary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
    paddingBottom: 50,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  headerTitle: { color: theme.colors.white, fontSize: 20, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  body: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 24,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 16 },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    ...theme.shadows.card,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.secondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  dateText: { fontSize: 12, color: theme.colors.textLight, marginStart: 4 },
  cardRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 15, fontWeight: 'bold', color: theme.colors.success },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  badgePaid: { backgroundColor: '#d1fae5' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeTextPaid: { color: '#065f46' },
  badgeTextPending: { color: '#92400e' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.secondary, fontWeight: 'bold' },
});

export default EarningsScreen;
