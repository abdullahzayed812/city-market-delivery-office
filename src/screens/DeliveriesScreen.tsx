import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Package, MapPin, ChevronRight, Phone, Map, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeliveries } from '../hooks/useDeliveries';
import { theme } from '../theme';
import CustomHeader from '../components/common/CustomHeader';

const DeliveriesScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { allDeliveries, isLoading } = useDeliveries();
  const isRTL = i18n.language === 'ar';

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return theme.colors.warning;
      case 'ASSIGNED': return theme.colors.info;
      case 'PICKED_UP': return theme.colors.primary;
      case 'DELIVERED': return theme.colors.success;
      case 'CANCELLED': return theme.colors.error;
      default: return theme.colors.textMuted;
    }
  };

  const renderDeliveryItem = ({ item }: any) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <View style={[styles.iconBadge, { backgroundColor: statusColor + '10' }]}>
              <Package size={20} color={statusColor} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.idText}>Order #{item.customerOrderId?.slice(-6)}</Text>
              <View style={styles.timeRow}>
                <Clock size={12} color={theme.colors.textLight} />
                <Text style={styles.timeText}>{t('deliveries.just_now')}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {t(`deliveries.status_${item.status.toLowerCase()}`)}
            </Text>
          </View>
        </View>

        <View style={styles.addressSection}>
          {item.pickupLocations?.map((loc: any, index: number) => (
            <View key={index} style={styles.addressRow}>
              <View style={styles.indicatorContainer}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <View style={styles.line} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>
                  {t('deliveries.pickup')} {item.pickupLocations.length > 1 ? `#${index + 1}` : ''}
                </Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {loc.address}
                </Text>
              </View>
            </View>
          ))}
          
          <View style={styles.addressRow}>
            <View style={styles.indicatorContainer}>
              <MapPin size={18} color={theme.colors.success} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{t('deliveries.delivery')}</Text>
              <Text style={styles.addressText} numberOfLines={1}>{item.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn}>
              <Map size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.nextStep}>
            <Text style={styles.footerInfo}>
              {item.courierId ? t('deliveries.assigned') : t('deliveries.unassigned')}
            </Text>
            <ChevronRight size={20} color={theme.colors.textLight} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('deliveries.title')} />
      <FlatList
        data={allDeliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={80} color={theme.colors.border} />
            <Text style={styles.emptyText}>{t('deliveries.no_delivery_history')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: theme.spacing.lg },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 20 
  },
  idGroup: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  headerInfo: {},
  idText: { fontSize: 16, fontWeight: theme.typography.weights.bold, color: theme.colors.secondary },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timeText: { fontSize: 11, color: theme.colors.textLight, marginStart: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full },
  statusBadgeText: { fontSize: 12, fontWeight: theme.typography.weights.bold },
  addressSection: { 
    marginBottom: 20, 
    backgroundColor: 'rgba(0,0,0,0.01)', 
    padding: 12, 
    borderRadius: 12 
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  indicatorContainer: { width: 30, alignItems: 'center', paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 1, height: 24, backgroundColor: theme.colors.border, marginVertical: 4 },
  addressInfo: { flex: 1, marginStart: 8 },
  addressLabel: { fontSize: 10, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  addressText: { fontSize: 14, color: theme.colors.secondary, fontWeight: theme.typography.weights.medium, marginTop: 2 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionGroup: { flexDirection: 'row' },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 10,
  },
  nextStep: { flexDirection: 'row', alignItems: 'center' },
  footerInfo: { fontSize: 12, color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold, marginEnd: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: theme.colors.textMuted },
});

export default DeliveriesScreen;
