import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Star, X } from 'lucide-react-native';
import { Courier } from '@city-market/shared';
import CustomHeader from '../components/common/CustomHeader';
import { DeliveryService } from '../services/api/deliveryService';
import { CourierService } from '../services/api/courierService';
import { theme } from '../theme';

const Stars = ({ value, size = 14 }: { value: number | null | undefined; size?: number }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={size}
        color={theme.colors.warning}
        fill={value != null && n <= Math.round(value) ? theme.colors.warning : 'transparent'}
      />
    ))}
  </View>
);

// Customer ratings of this office's deliveries; tap a courier to see only theirs.
const RatingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [courier, setCourier] = useState<{ id: string; name: string } | null>(null);

  const { data: couriers = [] } = useQuery({
    queryKey: ['couriers'],
    queryFn: () => CourierService.getAllCouriers(),
  });
  const rated = useMemo(
    () => [...(couriers ?? [])].sort((a: Courier, b: Courier) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0)),
    [couriers],
  );

  const { data: result, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveryRatings', courier?.id ?? 'office'],
    queryFn: () => DeliveryService.getDeliveryRatings({ courierId: courier?.id, limit: 50 }),
  });
  const summary = result?.summary;
  const total = summary?.totalRatings ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader title={t('ratings.title')} showBack />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{courier ? `${t('ratings.summary_for')} ${courier.name}` : t('ratings.office_rating')}</Text>
            {courier && (
              <TouchableOpacity onPress={() => setCourier(null)} style={styles.clear}>
                <X size={14} color={theme.colors.primary} />
                <Text style={styles.clearText}>{t('ratings.whole_office')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.average}>
              <Text style={styles.averageValue}>{summary?.averageRating != null ? summary.averageRating.toFixed(1) : '—'}</Text>
              <Stars value={summary?.averageRating} size={16} />
              <Text style={styles.muted}>{t('ratings.count', { count: total })}</Text>
            </View>
            <View style={styles.bars}>
              {[5, 4, 3, 2, 1].map(s => {
                const n = summary?.distribution?.[s] ?? 0;
                return (
                  <View key={s} style={styles.barRow}>
                    <Text style={styles.barLabel}>{s}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: total ? `${(n / total) * 100}%` : 0 }]} />
                    </View>
                    <Text style={styles.barCount}>{n}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={styles.section}>{t('ratings.couriers')}</Text>
        <View style={styles.card}>
          {rated.map((c: Courier) => (
            <TouchableOpacity key={c.id} style={styles.courierRow} onPress={() => setCourier({ id: c.id, name: c.fullName })}>
              <Text style={styles.courierName} numberOfLines={1}>
                {c.fullName}
              </Text>
              {c.ratingCount ? (
                <View style={styles.courierRating}>
                  <Stars value={c.rating} />
                  <Text style={styles.muted}>
                    {c.rating.toFixed(1)} ({c.ratingCount})
                  </Text>
                </View>
              ) : (
                <Text style={styles.muted}>—</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>{t('ratings.latest_reviews')}</Text>
        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : !result?.items.length ? (
            <Text style={styles.muted}>{t('ratings.no_reviews')}</Text>
          ) : (
            result.items.map(r => (
              <View key={r.id} style={styles.review}>
                <View style={styles.reviewTop}>
                  <Text style={styles.courierName}>{r.courierName ?? '—'}</Text>
                  <Stars value={r.stars} />
                </View>
                {!!r.comment && <Text style={styles.comment}>{r.comment}</Text>}
                <Text style={styles.muted}>
                  #{r.customerOrderId.slice(-6)} ·{' '}
                  {new Date(r.createdAt).toLocaleString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.md, padding: 16, ...theme.shadows.soft },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { color: theme.colors.primary, fontWeight: '600', fontSize: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  average: { alignItems: 'center' },
  averageValue: { fontSize: 36, fontWeight: 'bold', color: theme.colors.text },
  bars: { flex: 1, gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { width: 12, fontSize: 12, color: theme.colors.textMuted },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.colors.background },
  barFill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.warning },
  barCount: { width: 28, textAlign: 'right', fontSize: 12, color: theme.colors.textMuted },
  stars: { flexDirection: 'row', gap: 2 },
  section: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 20, marginBottom: 8 },
  courierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  courierName: { fontWeight: '600', color: theme.colors.text, flex: 1 },
  courierRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  review: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  comment: { color: theme.colors.text, marginTop: 4 },
  muted: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});

export default RatingsScreen;
