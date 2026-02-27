import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import CustomHeader from '../components/common/CustomHeader';
import { useEarnings } from '../hooks/useEarnings';

const EarningsScreen = () => {
  const { t } = useTranslation();
  const { completedDeliveries, totalEarnings, isLoading } = useEarnings();

  const renderHistoryItem = ({ item }: any) => (
    <View style={styles.historyCard}>
      <View style={styles.historyInfo}>
        <View style={styles.iconCircle}>
          <TrendingUp size={20} color={theme.colors.success} />
        </View>
        <View>
          <Text style={styles.orderText}>Order #{item.customerOrderId?.slice(-6)}</Text>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.colors.textLight} />
            <Text style={styles.dateText}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>+$15.00</Text>
        <Text style={styles.statusText}>{t('common.success')}</Text>
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
        <View style={styles.earningsHeader}>
          <View style={styles.headerTop}>
             <Text style={styles.headerTitle}>{t('earnings.title')}</Text>
             <TouchableOpacity style={styles.filterBtn}>
                <Filter size={20} color={theme.colors.white} />
             </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
             <Text style={styles.balanceLabel}>{t('earnings.total_balance')}</Text>
             <View style={styles.balanceRow}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.balanceValue}>{totalEarnings.toFixed(2)}</Text>
             </View>
             <View style={styles.growthBadge}>
                <ArrowUpRight size={14} color={theme.colors.success} />
                <Text style={styles.growthText}>{t('earnings.weekly_growth')}</Text>
             </View>
          </View>
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>{t('earnings.payout_history')}</Text>
             <Text style={styles.historyCount}>{completedDeliveries.length} {t('earnings.transactions')}</Text>
          </View>

          <FlatList
            data={completedDeliveries}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Wallet size={64} color={theme.colors.border} />
                <Text style={styles.emptyText}>{t('earnings.no_earnings_history')}</Text>
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
  earningsHeader: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.lg,
    paddingBottom: 60,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: theme.colors.white, fontSize: 20, fontWeight: theme.typography.weights.bold },
  filterBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  balanceContainer: { alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  currency: { color: theme.colors.primary, fontSize: 24, fontWeight: theme.typography.weights.bold, marginTop: 10, marginEnd: 4 },
  balanceValue: { color: theme.colors.white, fontSize: 56, fontWeight: theme.typography.weights.black },
  growthBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(34, 197, 94, 0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    marginTop: 15
  },
  growthText: { color: theme.colors.success, fontSize: 12, fontWeight: 'bold', marginStart: 4 },
  historySection: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  historyCount: { fontSize: 12, color: theme.colors.textMuted },
  listContent: { paddingBottom: 20 },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    ...theme.shadows.card,
  },
  historyInfo: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  orderText: { fontSize: 15, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dateText: { fontSize: 12, color: theme.colors.textLight, marginStart: 4 },
  amountContainer: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: theme.typography.weights.bold, color: theme.colors.success },
  statusText: { fontSize: 10, color: theme.colors.textLight, textTransform: 'uppercase', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: 'bold', color: theme.colors.secondary },
});

export default EarningsScreen;
