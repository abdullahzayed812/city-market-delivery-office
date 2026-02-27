import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Package, Clock, ChevronRight, Bell, Navigation } from 'lucide-react-native';
import { useDeliveries } from '../hooks/useDeliveries';
import CustomHeader from '../components/common/CustomHeader';

const DashboardScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { allDeliveries, pendingDeliveries, isLoading } = useDeliveries();
  const isRTL = i18n.language === 'ar';

  const StatCard = ({ icon: Icon, label, value, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>{t('common.welcome_back')}</Text>
          <Text style={styles.nameText}>{t('common.delivery_manager')}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color={theme.colors.secondary} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <StatCard 
            icon={Truck} 
            label={t('dashboard.total_deliveries')} 
            value={allDeliveries.length.toString()} 
            color={theme.colors.primary}
            subtitle={t('dashboard.stats_comparison')}
          />
          <StatCard 
            icon={Clock} 
            label={t('dashboard.pending_assignment')} 
            value={pendingDeliveries.length.toString()} 
            color={theme.colors.warning}
            subtitle={t('dashboard.needs_attention')}
          />
        </View>

        <View style={styles.actionBanner}>
          <View style={styles.bannerInfo}>
            <Navigation size={28} color={theme.colors.white} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>{t('dashboard.quick_dispatch')}</Text>
              <Text style={styles.bannerSubtitle}>{t('dashboard.dispatch_subtitle')}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bannerBtn}
            onPress={() => navigation.navigate('DeliveriesTab')}
          >
            <Text style={styles.bannerBtnText}>{t('common.start')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.recent_pending')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveriesTab')}>
              <Text style={styles.viewAllText}>{t('dashboard.view_all')}</Text>
            </TouchableOpacity>
          </View>

          {pendingDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Package size={40} color={theme.colors.textLight} />
              <Text style={styles.emptyCardText}>{t('dashboard.no_pending')}</Text>
            </View>
          ) : (
            pendingDeliveries.slice(0, 5).map((delivery: any) => (
              <TouchableOpacity 
                key={delivery.id} 
                style={styles.deliveryRow}
                onPress={() => navigation.navigate('DeliveriesTab', { screen: 'DeliveryDetails', params: { deliveryId: delivery.id } })}
              >
                <View style={styles.rowLead}>
                  <View style={styles.rowIcon}>
                    <Package size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.rowTitle}>Order #{delivery.customerOrderId?.slice(-6)}</Text>
                    <Text style={styles.rowSubtitle}>{delivery.deliveryAddress}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.colors.textLight} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  welcomeText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: theme.typography.weights.medium },
  nameText: { fontSize: 24, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  scrollContent: { padding: theme.spacing.lg },
  statsContainer: { marginBottom: theme.spacing.xl },
  statCard: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: theme.spacing.md,
  },
  statInfo: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  statLabel: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  statSubtitle: { fontSize: 11, color: theme.colors.textLight, marginTop: 4 },
  actionBanner: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  bannerInfo: { flexDirection: 'row', alignItems: 'center' },
  bannerTextContainer: { marginStart: theme.spacing.md },
  bannerTitle: { color: theme.colors.white, fontSize: 18, fontWeight: theme.typography.weights.bold },
  bannerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  bannerBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  bannerBtnText: { color: theme.colors.white, fontWeight: theme.typography.weights.bold },
  section: { marginTop: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  viewAllText: { color: theme.colors.primary, fontWeight: theme.typography.weights.semibold },
  deliveryRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft
  },
  rowLead: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: theme.typography.weights.semibold, color: theme.colors.secondary },
  rowSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  emptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: theme.radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCardText: { marginTop: 10, color: theme.colors.textLight },
});

export default DashboardScreen;
