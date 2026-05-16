import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
  Package,
  MapPin,
  Store,
  UserPlus,
  Circle,
  AlertTriangle,
  X,
  Star,
  Truck,
  XCircle,
  UserRound,
  Phone,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { DeliveryStatus } from '@city-market/shared';
import CustomHeader from '../components/common/CustomHeader';
import { useDeliveryDetails } from '../hooks/useDeliveryDetails';

const CANCEL_REASONS = [
  'cancel_reason_not_available',
  'cancel_reason_wrong_address',
  'cancel_reason_other',
] as const;

const DeliveryDetailsScreen = ({ route }: any) => {
  const { deliveryId } = route.params;
  const { t } = useTranslation();

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const {
    delivery,
    availableCouriers,
    isLoading,
    refetch,
    isRefetching,
    acceptDelivery,
    isAccepting,
    assignCourier,
    isAssigning,
    cancelDelivery,
    isCancelling,
  } = useDeliveryDetails(deliveryId);

  const handleCall = (phone: string | undefined) => {
    if (!phone) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('deliveries.no_phone_number') });
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleConfirmCancel = () => {
    if (!selectedReason) return;
    const reason =
      selectedReason === 'cancel_reason_other'
        ? customReason.trim() || t(`deliveries.${selectedReason}`)
        : t(`deliveries.${selectedReason}`);
    cancelDelivery(reason);
    setCancelModalVisible(false);
    setSelectedReason(null);
    setCustomReason('');
  };

  const totalPrice =
    delivery?.vendorOrders?.reduce((total: number, vo: any) => {
      return (
        total +
        (vo.items?.reduce((sum: number, item: any) => {
          return sum + (item.totalPrice || 0);
        }, 0) || 0)
      );
    }, 0) || 0;

  const handleOpenAssignModal = (courier: any) => {
    setSelectedCourier(courier);
    setAssignModalVisible(true);
  };

  const confirmAssign = () => {
    if (selectedCourier) {
      assignCourier(selectedCourier.id);
      setAssignModalVisible(false);
      setSelectedCourier(null);
    }
  };

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

  // const isCompleted = delivery.status === DeliveryStatus.DELIVERED;
  const isPending = delivery.status === DeliveryStatus.PENDING;
  const isAccepted = delivery.status === DeliveryStatus.ACCEPTED;
  const isAssigned = !!delivery.courierId;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('deliveries.details')} showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
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

        {!isPending && (
          <View style={styles.contactsCard}>
            <Text style={styles.contactsTitle}>{t('deliveries.contacts')}</Text>
            <View style={styles.contactsRow}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => handleCall(delivery.customerPhone)}
              >
                <View
                  style={[
                    styles.contactIconBox,
                    { backgroundColor: '#ECFDF5' },
                  ]}
                >
                  <UserRound size={20} color="#059669" />
                </View>
                <Text style={styles.contactLabel}>
                  {t('deliveries.call_customer')}
                </Text>
                <Phone size={14} color="#059669" />
              </TouchableOpacity>

              {isAccepted && !isAssigned && (
                <TouchableOpacity
                  style={[styles.contactItem, styles.contactItemDanger]}
                  onPress={() => setCancelModalVisible(true)}
                  disabled={isCancelling}
                >
                  <View
                    style={[
                      styles.contactIconBox,
                      { backgroundColor: '#FEF2F2' },
                    ]}
                  >
                    <XCircle size={20} color={theme.colors.error} />
                  </View>
                  <Text
                    style={[styles.contactLabel, { color: theme.colors.error }]}
                  >
                    {t('deliveries.cancel_delivery')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

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
                  <Text style={pointLabelStyle(theme)}>
                    {t('deliveries.pickup_location')}{' '}
                    {delivery.pickupLocations.length > 1 ? `#${index + 1}` : ''}
                  </Text>
                </View>
                <Text style={styles.addressText}>{loc.address}</Text>
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
            <View>
              <View style={styles.pointHeader}>
                <MapPin size={14} color={theme.colors.textMuted} />
                <Text style={pointLabelStyle(theme)}>
                  {t('deliveries.delivery_address')}
                </Text>
              </View>
              <Text style={styles.addressText}>{delivery.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>{t('deliveries.order_items')}</Text>
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
                        ? ` (${(item.requestedWeightGrams / 1000).toFixed(
                            2,
                          )} kg)`
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

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {t('deliveries.total_price')}: {totalPrice.toFixed(2)}{' '}
              {t('common.currency')}
            </Text>
          </View>

          {(!delivery.vendorOrders || delivery.vendorOrders.length === 0) && (
            <Text style={styles.emptyMsg}>
              {t('deliveries.no_items_found')}
            </Text>
          )}
        </View>

        {isAccepted && !isAssigned && (
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
                  <View key={courier.id} style={styles.courierItem}>
                    <View style={styles.courierItemTop}>
                      <View style={styles.courierInfo}>
                        <View style={styles.courierAvatar}>
                          <Text style={styles.avatarText}>
                            {courier.fullName?.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.courierDetails}>
                          <Text style={styles.courierName}>
                            {courier.fullName}
                          </Text>
                          <View style={styles.vehicleRow}>
                            <Truck size={12} color={theme.colors.textMuted} />
                            <Text style={styles.courierVehicle}>
                              {courier.vehicleType}
                            </Text>
                            {courier.licensePlate && (
                              <>
                                <View style={styles.dotSeparator} />
                                <Text style={styles.courierVehicle}>
                                  {courier.licensePlate}
                                </Text>
                              </>
                            )}
                          </View>
                          {courier.phone && (
                            <Text style={styles.courierPhone}>
                              {courier.phone}
                            </Text>
                          )}
                        </View>
                      </View>
                      {courier.phone && (
                        <TouchableOpacity
                          style={styles.courierCallBtn}
                          onPress={() =>
                            Linking.openURL(`tel:${courier.phone}`)
                          }
                        >
                          <Phone size={16} color="#0284c7" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.assignBtn}
                      onPress={() => handleOpenAssignModal(courier)}
                      disabled={isAssigning}
                    >
                      <Text style={styles.assignBtnText}>
                        {t('deliveries.assign')}
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {isPending && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => acceptDelivery()}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>{t('deliveries.accept')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={assignModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.alertIconBox}>
                <UserPlus size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.modalTitle}>
                {t('deliveries.assign_courier_title', 'Assign Courier')}
              </Text>
              <TouchableOpacity
                onPress={() => setAssignModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                {t(
                  'deliveries.assign_courier_desc',
                  'Are you sure you want to assign this courier to the delivery?',
                )}
              </Text>

              {selectedCourier && (
                <View style={styles.selectedCourierCard}>
                  <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>
                      {selectedCourier.fullName?.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.selectedCourierName}>
                    {selectedCourier.fullName}
                  </Text>

                  <View style={styles.courierDetailsGrid}>
                    <View style={styles.detailItem}>
                      <Truck size={16} color={theme.colors.textMuted} />
                      <Text style={styles.detailText}>
                        {selectedCourier.vehicleType}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Star size={16} color={theme.colors.warning} />
                      <Text style={styles.detailText}>4.8 Rating</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.warningInfo}>
                <AlertTriangle size={16} color={theme.colors.warning} />
                <Text style={styles.warningText}>
                  {t(
                    'deliveries.assign_warning',
                    'The courier will be notified immediately.',
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssignModalVisible(false)}
                disabled={isAssigning}
              >
                <Text style={styles.modalCancelBtnText}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmAssign}
                disabled={isAssigning}
              >
                {isAssigning ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>
                    {t('deliveries.confirm_assignment', 'Confirm')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.alertIconBox}>
                <XCircle size={24} color={theme.colors.error} />
              </View>
              <Text style={styles.modalTitle}>
                {t('deliveries.cancel_delivery')}
              </Text>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {CANCEL_REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      selectedReason === reason && styles.radioCircleSelected,
                    ]}
                  />
                  <Text style={styles.reasonText}>
                    {t(`deliveries.${reason}`)}
                  </Text>
                </TouchableOpacity>
              ))}
              {selectedReason === 'cancel_reason_other' && (
                <View style={styles.customReasonInput}>
                  <Text style={styles.customReasonLabel}>
                    {t('deliveries.specify_reason')}
                  </Text>
                  <View style={styles.textInputBox}>
                    <Text
                      style={[
                        styles.textInput,
                        !customReason && styles.textInputPlaceholder,
                      ]}
                      onPress={() => {}}
                    >
                      {customReason || t('deliveries.enter_reason')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>
                  {t('common.back')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: theme.colors.error },
                  !selectedReason && { opacity: 0.5 },
                ]}
                onPress={handleConfirmCancel}
                disabled={!selectedReason || isCancelling}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper for dynamic pointLabel style if needed, or just keep it in styles
const pointLabelStyle = (theme: any) => ({
  fontSize: 12,
  color: theme.colors.textMuted,
  marginStart: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
});

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
  addressText: {
    fontSize: 15,
    color: theme.colors.secondary,
    fontWeight: theme.typography.weights.medium,
    lineHeight: 22,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: theme.spacing.lg,
    marginBottom: 12,
    gap: 10,
  },
  countdownTitle: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  countdownTimer: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#b45309',
    marginTop: 2,
  },
  contactsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: 12,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    ...theme.shadows.card,
  },
  contactsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  contactsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  contactIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  contactItemDanger: {
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: theme.colors.background,
    gap: 10,
  },
  reasonItemSelected: {
    backgroundColor: theme.colors.primary + '15',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  customReasonInput: { marginTop: 8 },
  customReasonLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  textInputBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: { fontSize: 14, color: theme.colors.text },
  textInputPlaceholder: { color: theme.colors.textMuted },
  stickyFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  acceptBtn: {
    backgroundColor: '#0284c7',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  acceptBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
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
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...theme.shadows.soft,
    gap: 12,
  },
  courierItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courierInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  courierDetails: { flex: 1 },
  courierPhone: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
  },
  courierCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 8,
  },
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
    backgroundColor: theme.colors.primary,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignBtnText: {
    color: theme.colors.white,
    fontSize: 14,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    width: '100%',
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  modalDesc: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  selectedCourierCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedCourierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  courierDetailsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  warningInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  modalConfirmBtn: {
    flex: 2,
    height: 52,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    ...theme.shadows.soft,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});

export default DeliveryDetailsScreen;
