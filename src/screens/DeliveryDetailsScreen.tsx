import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Package,
  MapPin,
  Store,
  User,
  UserPlus,
  Circle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { DeliveryStatus } from '@city-market/shared';
import CustomHeader from '../components/common/CustomHeader';
import { useDeliveryDetails } from '../hooks/useDeliveryDetails';

const DeliveryDetailsScreen = ({ route }: any) => {
  const { deliveryId } = route.params;
  const { t } = useTranslation();

  const { delivery, availableCouriers, isLoading, assignCourier, isAssigning } =
    useDeliveryDetails(deliveryId);

  if (!delivery && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title={t('deliveries.details')} />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title={t('deliveries.details')} showBack />
        <View style={styles.centered}>
          <Text>{t('common.not_found')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = delivery.status === DeliveryStatus.DELIVERED;
  const isAssigned = !!delivery.courierId;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('deliveries.details')} showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.mainInfo}>
            <View style={styles.iconCircle}>
              <Package size={32} color={theme.colors.white} />
            </View>
            <View style={styles.idContainer}>
              <Text style={styles.orderLabel}>
                {t('deliveries.tracking_id')}
              </Text>
              <Text style={styles.orderId}>
                #{delivery.customerOrderId?.slice(-12)}
              </Text>
            </View>
          </View>
          <View style={styles.statusSection}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Text style={styles.statusText}>
                {t(`deliveries.status_${delivery.status.toLowerCase()}`)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>
            {t('deliveries.route_details')}
          </Text>

          {delivery.pickupLocations?.map((loc: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Circle
                  size={16}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineRight}>
                <View style={styles.pointHeader}>
                  <Store size={14} color={theme.colors.textMuted} />
                  <Text style={styles.pointLabel}>
                    {t('deliveries.pickup_location')} {delivery.pickupLocations.length > 1 ? `#${index + 1}` : ''}
                  </Text>
                </View>
                <Text style={styles.addressText}>
                  {loc.address}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <MapPin
                size={20}
                color={theme.colors.success}
                fill={theme.colors.success}
              />
            </View>
          </View>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>
            {t('deliveries.order_items')}
          </Text>
          {delivery.vendorOrders?.map((vo: any) => (
            <View key={vo.id} style={styles.vendorOrderSection}>
              <View style={styles.vendorHeader}>
                <Store size={16} color={theme.colors.primary} />
                <Text style={styles.vendorName}>
                  {vo.vendorName || t('common.vendor')}
                </Text>
              </View>
              {vo.items?.map((item: any) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity ? `x${item.quantity}` : ''}
                      {item.actualWeightGrams
                        ? ` (${(item.actualWeightGrams / 1000).toFixed(2)} kg)`
                        : item.requestedWeightGrams
                          ? ` (${(item.requestedWeightGrams / 1000).toFixed(2)} kg)`
                          : ''}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {item.totalPrice.toFixed(2)} {t('common.currency')}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          {(!delivery.vendorOrders || delivery.vendorOrders.length === 0) && (
            <Text style={styles.emptyMsg}>{t('deliveries.no_items_found')}</Text>
          )}
        </View>

        {!isAssigned && !isCompleted && (
          <View style={styles.assignSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.rowLead}>
                <UserPlus size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitleSub}>
                  {t('deliveries.assign_courier')}
                </Text>
              </View>
              <Text style={styles.courierCount}>
                {availableCouriers?.length || 0} {t('deliveries.available')}
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={styles.courierList}>
                {availableCouriers?.map((courier: any) => (
                  <TouchableOpacity
                    key={courier.id}
                    style={styles.courierItem}
                    onPress={() => assignCourier(courier.id)}
                    disabled={isAssigning}
                  >
                    <View style={styles.courierInfo}>
                      <View style={styles.courierAvatar}>
                        <Text style={styles.avatarText}>
                          {courier.fullName?.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.courierName}>
                          {courier.fullName}
                        </Text>
                        <View style={styles.vehicleRow}>
                          <Text style={styles.courierVehicle}>
                            {courier.vehicleType}
                          </Text>
                          <View style={styles.dotSeparator} />
                          <Text style={styles.courierRating}>4.8 ★</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.assignBtn}>
                      <Text style={styles.assignBtnText}>
                        {t('deliveries.assign')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {availableCouriers?.length === 0 && (
                  <View style={styles.emptyCourier}>
                    <Text style={styles.emptyMsg}>
                      {t('deliveries.no_available_couriers')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {isAssigned && (
          <View style={styles.assignedSection}>
            <Text style={styles.sectionTitleSub}>
              {t('deliveries.assigned_courier')}
            </Text>
            <View style={styles.assignedCard}>
              <View style={styles.courierInfo}>
                <View
                  style={[
                    styles.courierAvatar,
                    { backgroundColor: theme.colors.success },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {delivery.courierName?.charAt(0) || 'C'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.courierName}>
                    {delivery.courierName || t('deliveries.assigned')}
                  </Text>
                  {/* <Text style={styles.courierVehicle}>
                    {delivery.courierPhone || t('deliveries.out_for_delivery')}
                  </Text> */}
                </View>
              </View>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() =>
                  delivery.courierPhone &&
                  Linking.openURL(`tel:${delivery.courierPhone}`)
                }
              >
                <Text style={styles.contactBtnText}>{t('common.call')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  headerCard: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadows.medium,
  },
  mainInfo: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: theme.spacing.md,
  },
  idContainer: {},
  orderLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  orderId: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginTop: 2,
  },
  statusSection: {},
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'capitalize',
  },
  timelineCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
    marginBottom: 20,
  },
  sectionTitleSub: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
    marginStart: 8,
  },
  timelineItem: { flexDirection: 'row', marginBottom: 5 },
  timelineLeft: { width: 30, alignItems: 'center' },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  timelineRight: { flex: 1, paddingBottom: 25, marginStart: 10 },
  pointHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pointLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginStart: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    color: theme.colors.secondary,
    fontWeight: theme.typography.weights.medium,
    lineHeight: 22,
  },
  assignSection: { paddingHorizontal: theme.spacing.lg },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowLead: { flexDirection: 'row', alignItems: 'center' },
  courierCount: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  courierList: {},
  courierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...theme.shadows.soft,
  },
  courierInfo: { flexDirection: 'row', alignItems: 'center' },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  avatarText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 18 },
  courierName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  courierVehicle: { fontSize: 12, color: theme.colors.textMuted },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.border,
    marginHorizontal: 6,
  },
  courierRating: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: 'bold',
  },
  assignBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignBtnText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCourier: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyMsg: { color: theme.colors.textLight, fontSize: 14 },
  assignedSection: { padding: theme.spacing.lg },
  assignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginTop: 12,
    ...theme.shadows.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  contactBtn: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  contactBtnText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemsCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    ...theme.shadows.card,
  },
  vendorOrderSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginStart: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
});

export default DeliveryDetailsScreen;
