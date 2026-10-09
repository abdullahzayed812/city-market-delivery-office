import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, User, Phone, Bike, Star } from 'lucide-react-native';
import { Courier, EventType } from '@city-market/shared';
import CustomHeader from '../components/common/CustomHeader';
import { CourierService } from '../services/api/courierService';
import { useSocket } from '../app/SocketContext';
import { theme } from '../theme';

const APPROVAL_COLOR: Record<string, string> = {
  PENDING_REVIEW: theme.colors.warning,
  SUSPENDED: theme.colors.error,
  REJECTED: theme.colors.error,
};

// Office couriers, including requests still waiting for admin review
const CouriersScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: couriers = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['couriers'],
    queryFn: () => CourierService.getAllCouriers(),
  });

  // Admin approved / rejected one of our courier requests
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['couriers'] });
    socket.on(EventType.COURIER_APPROVAL_UPDATED, refresh);
    return () => {
      socket.off(EventType.COURIER_APPROVAL_UPDATED, refresh);
    };
  }, [socket, queryClient]);

  const renderItem = ({ item }: { item: Courier }) => {
    const approved = !item.approvalStatus || item.approvalStatus === 'APPROVED';
    const badgeColor = approved ? (item.isAvailable ? theme.colors.success : theme.colors.textLight) : APPROVAL_COLOR[item.approvalStatus!] ?? theme.colors.textMuted;
    const badgeText = approved
      ? t(item.isAvailable ? 'office_couriers.online' : 'office_couriers.offline')
      : t(`office_couriers.approval_${item.approvalStatus!.toLowerCase()}`);
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <User size={18} color={theme.colors.primary} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.fullName}
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Phone size={14} color={theme.colors.textMuted} />
            <Text style={styles.muted}>{item.phone}</Text>
          </View>
          <View style={styles.metaItem}>
            <Bike size={14} color={theme.colors.textMuted} />
            <Text style={styles.muted}>
              {item.vehicleType ? t(`office_couriers.vehicle_${item.vehicleType.toLowerCase()}`, { defaultValue: item.vehicleType }) : '—'}
              {item.licensePlate ? ` · ${item.licensePlate}` : ''}
            </Text>
          </View>
          {approved && (
            <View style={styles.metaItem}>
              <Star size={14} color={theme.colors.warning} />
              <Text style={styles.muted}>{item.ratingCount ? `${Number(item.rating).toFixed(1)} (${item.ratingCount})` : '—'}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader title={t('office_couriers.title')} showBack />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={couriers ?? []}
          keyExtractor={c => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('office_couriers.empty')}</Text>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddCourier')} activeOpacity={0.85}>
        <Plus size={20} color={theme.colors.white} />
        <Text style={styles.fabText}>{t('office_couriers.add')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.md, padding: 14, marginBottom: 12, ...theme.shadows.soft },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  name: { flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: theme.colors.white, fontSize: 12, fontWeight: 'bold' },
  meta: { marginTop: 10, gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { color: theme.colors.textMuted },
  empty: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 20,
    end: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 52,
    ...theme.shadows.soft,
  },
  fabText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 15 },
});

export default CouriersScreen;
