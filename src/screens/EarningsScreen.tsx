import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  Calendar,
  Building2,
  Users,
  PlusCircle,
  CheckCircle,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { DeliveryService } from '../services/api/deliveryService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISOStart = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00.000Z`).toISOString();

const toISOEnd = (dateStr: string) =>
  new Date(`${dateStr}T23:59:59.999Z`).toISOString();

const defaultStart = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const defaultEnd = () => new Date().toISOString().split('T')[0];

// ─── Shared components ────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => (
  <View style={[styles.badge, status === 'PAID' ? styles.badgePaid : styles.badgePending]}>
    <Text style={[styles.badgeText, status === 'PAID' ? styles.badgeTextPaid : styles.badgeTextPending]}>
      {status}
    </Text>
  </View>
);

const TabBar = ({
  active,
  onChange,
}: {
  active: 'office' | 'couriers';
  onChange: (t: 'office' | 'couriers') => void;
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, active === 'office' && styles.tabActive]}
        onPress={() => onChange('office')}
        activeOpacity={0.7}
      >
        <Building2 size={15} color={active === 'office' ? theme.colors.primary : theme.colors.textMuted} />
        <Text style={[styles.tabText, active === 'office' && styles.tabTextActive]}>
          {t('earnings.my_office', 'My Office')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, active === 'couriers' && styles.tabActive]}
        onPress={() => onChange('couriers')}
        activeOpacity={0.7}
      >
        <Users size={15} color={active === 'couriers' ? theme.colors.primary : theme.colors.textMuted} />
        <Text style={[styles.tabText, active === 'couriers' && styles.tabTextActive]}>
          {t('earnings.couriers', 'Couriers')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Create Settlement Modal ──────────────────────────────────────────────────

interface CreateSettlementModalProps {
  visible: boolean;
  courierName: string;
  pendingData: any;
  onClose: () => void;
  onConfirm: (periodStart: string, periodEnd: string, notes: string) => void;
  isPending: boolean;
}

const CreateSettlementModal: React.FC<CreateSettlementModalProps> = ({
  visible,
  courierName,
  pendingData,
  onClose,
  onConfirm,
  isPending,
}) => {
  const { t } = useTranslation();
  const [periodStart, setPeriodStart] = useState(defaultStart());
  const [periodEnd, setPeriodEnd] = useState(defaultEnd());
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(toISOStart(periodStart), toISOEnd(periodEnd), notes);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('earnings.settle_for', 'Settle for')} {courierName}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('earnings.unsettled_deliveries', 'Unsettled')}</Text>
              <Text style={styles.summaryValue}>{pendingData?.unsettledDeliveries || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('earnings.delivery_fees', 'Fees')}</Text>
              <Text style={styles.summaryValue}>EGP {(pendingData?.totalDeliveryFees || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
                {t('earnings.net_payout', 'Net Payout')}
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success, fontWeight: 'bold' }]}>
                EGP {(pendingData?.netPayout || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Date fields */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>{t('earnings.period_start', 'Period Start')}</Text>
              <TextInput
                style={styles.dateInput}
                value={periodStart}
                onChangeText={setPeriodStart}
                placeholder="YYYY-MM-DD"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>{t('earnings.period_end', 'Period End')}</Text>
              <TextInput
                style={styles.dateInput}
                value={periodEnd}
                onChangeText={setPeriodEnd}
                placeholder="YYYY-MM-DD"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>{t('earnings.notes', 'Notes (optional)')}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder={t('earnings.notes_placeholder', 'Internal notes...')}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isPending}>
              <Text style={styles.cancelBtnText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (isPending || !pendingData?.unsettledDeliveries) && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isPending || !pendingData?.unsettledDeliveries}
            >
              <Text style={styles.confirmBtnText}>
                {isPending ? t('earnings.creating', 'Creating…') : t('earnings.confirm', 'Confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Office Tab ───────────────────────────────────────────────────────────────

const OfficeTab: React.FC = () => {
  const { t } = useTranslation();

  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['officePendingEarnings'],
    queryFn: DeliveryService.getOfficePendingEarnings,
  });

  const { data: settlements, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ['officeSettlements'],
    queryFn: () => DeliveryService.getOfficeSettlements(),
  });

  if (isPendingLoading || isSettlementsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardLabel}>{t('earnings.unsettled_fees', 'Unsettled Fees')}</Text>
        <Text style={styles.summaryCardAmount}>
          EGP {(pendingData?.netPayout || 0).toLocaleString()}
        </Text>
        <View style={styles.summaryCardRow}>
          <View style={styles.summaryCardStat}>
            <Text style={styles.summaryCardStatLabel}>{t('earnings.unsettled_deliveries', 'Unsettled')}</Text>
            <Text style={styles.summaryCardStatValue}>{pendingData?.unsettledDeliveries || 0}</Text>
          </View>
          <View style={styles.summaryCardDivider} />
          <View style={styles.summaryCardStat}>
            <Text style={styles.summaryCardStatLabel}>{t('earnings.delivery_fees', 'Total Fees')}</Text>
            <Text style={styles.summaryCardStatValue}>
              EGP {(pendingData?.totalDeliveryFees || 0).toLocaleString()}
            </Text>
          </View>
        </View>
        <Text style={styles.readOnlyNote}>
          {t('earnings.admin_manages_office', 'Office settlements are managed by the platform admin')}
        </Text>
      </View>

      {/* History */}
      <Text style={styles.sectionTitle}>{t('earnings.settlement_history', 'Settlement History')}</Text>
      {!settlements || settlements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Wallet size={48} color={theme.colors.border} />
          <Text style={styles.emptyText}>{t('earnings.no_settlements_yet', 'No settlements yet')}</Text>
        </View>
      ) : (
        settlements.map((item: any) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <TrendingUp size={16} color={theme.colors.success} />
              </View>
              <View>
                <Text style={styles.cardTitle}>
                  {new Date(item.periodStart).toLocaleDateString()} – {new Date(item.periodEnd).toLocaleDateString()}
                </Text>
                <View style={styles.cardMeta}>
                  <Calendar size={11} color={theme.colors.textLight} />
                  <Text style={styles.cardMetaText}>
                    {item.deliveryCount} {t('earnings.deliveries', 'deliveries')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>EGP {Number(item.netPayout).toLocaleString()}</Text>
              <StatusBadge status={item.status} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// ─── Couriers Tab ─────────────────────────────────────────────────────────────

const CouriersTab: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCourier, setSelectedCourier] = useState<{ id: string; name: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allPending, isLoading: isAllPendingLoading } = useQuery({
    queryKey: ['allCouriersPendingEarnings'],
    queryFn: DeliveryService.getAllCouriersPendingEarnings,
  });

  const { data: selectedPending } = useQuery({
    queryKey: ['courierPendingEarnings', selectedCourier?.id],
    queryFn: () => DeliveryService.getCourierPendingEarnings(selectedCourier!.id),
    enabled: !!selectedCourier?.id,
  });

  const { data: settlements, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ['courierSettlementsDelivery', selectedCourier?.id ?? 'all'],
    queryFn: () => DeliveryService.getCourierSettlements(selectedCourier?.id),
    enabled: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: { courierId: string; periodStart: string; periodEnd: string; notes: string }) =>
      DeliveryService.createCourierSettlement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCouriersPendingEarnings'] });
      queryClient.invalidateQueries({ queryKey: ['courierPendingEarnings'] });
      queryClient.invalidateQueries({ queryKey: ['courierSettlementsDelivery'] });
      setModalOpen(false);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => DeliveryService.markCourierSettlementPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courierSettlementsDelivery'] });
      queryClient.invalidateQueries({ queryKey: ['allCouriersPendingEarnings'] });
    },
  });

  if (isAllPendingLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Pending couriers list */}
      <Text style={styles.sectionTitle}>{t('earnings.pending_couriers', 'Couriers with Pending Earnings')}</Text>
      {!allPending || allPending.length === 0 ? (
        <View style={[styles.emptyContainer, { marginBottom: 24 }]}>
          <CheckCircle size={40} color={theme.colors.border} />
          <Text style={styles.emptyText}>{t('earnings.no_pending_earnings', 'No pending earnings')}</Text>
        </View>
      ) : (
        allPending.map((c: any) => (
          <TouchableOpacity
            key={c.courierId}
            style={[
              styles.card,
              selectedCourier?.id === c.courierId && styles.cardSelected,
            ]}
            onPress={() =>
              setSelectedCourier(
                selectedCourier?.id === c.courierId ? null : { id: c.courierId, name: c.courierName },
              )
            }
            activeOpacity={0.75}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                <Users size={16} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{c.courierName}</Text>
                <Text style={styles.cardMetaText}>
                  {c.unsettledDeliveries} {t('earnings.deliveries', 'deliveries')}
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>EGP {Number(c.netPayout).toLocaleString()}</Text>
              <TouchableOpacity
                style={styles.settleBtn}
                onPress={() => {
                  setSelectedCourier({ id: c.courierId, name: c.courierName });
                  setModalOpen(true);
                }}
              >
                <PlusCircle size={12} color={theme.colors.primary} />
                <Text style={styles.settleBtnText}>{t('earnings.settle', 'Settle')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Settlement history */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCourier
            ? `${t('earnings.history_for', 'History for')} ${selectedCourier.name}`
            : t('earnings.all_settlements', 'All Settlements')}
        </Text>
        {selectedCourier && (
          <TouchableOpacity onPress={() => setSelectedCourier(null)}>
            <Text style={styles.showAllText}>{t('earnings.show_all', 'Show all')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSettlementsLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
      ) : !settlements || settlements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Wallet size={40} color={theme.colors.border} />
          <Text style={styles.emptyText}>{t('earnings.no_settlements_yet', 'No settlements yet')}</Text>
        </View>
      ) : (
        settlements.map((s: any) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <TrendingUp size={16} color={theme.colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {new Date(s.periodStart).toLocaleDateString()} – {new Date(s.periodEnd).toLocaleDateString()}
                </Text>
                <View style={styles.cardMeta}>
                  <Calendar size={11} color={theme.colors.textLight} />
                  <Text style={styles.cardMetaText}>
                    {s.deliveryCount} {t('earnings.deliveries', 'deliveries')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>EGP {Number(s.netPayout).toLocaleString()}</Text>
              <StatusBadge status={s.status} />
              {s.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.markPaidBtn}
                  onPress={() => markPaidMutation.mutate(s.id)}
                  disabled={markPaidMutation.isPending}
                >
                  <ChevronRight size={11} color={theme.colors.success} />
                  <Text style={styles.markPaidText}>{t('earnings.mark_paid', 'Mark Paid')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}

      {selectedCourier && (
        <CreateSettlementModal
          visible={modalOpen}
          courierName={selectedCourier.name}
          pendingData={selectedPending}
          onClose={() => setModalOpen(false)}
          onConfirm={(ps, pe, notes) =>
            createMutation.mutate({ courierId: selectedCourier.id, periodStart: ps, periodEnd: pe, notes })
          }
          isPending={createMutation.isPending}
        />
      )}
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const EarningsScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'office' | 'couriers'>('office');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Building2 size={20} color={theme.colors.white} />
            <Text style={styles.headerTitle}>{t('earnings.title', 'Earnings')}</Text>
          </View>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </View>
        <View style={styles.body}>
          {activeTab === 'office' ? <OfficeTab /> : <CouriersTab />}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.secondary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },

  header: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 0,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  headerTitle: { color: theme.colors.white, fontSize: 20, fontWeight: 'bold' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: { backgroundColor: theme.colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted },
  tabTextActive: { color: theme.colors.primary },

  body: { flex: 1 },
  tabContent: { padding: theme.spacing.lg, paddingBottom: 40 },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  showAllText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },

  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.card,
    alignItems: 'center',
  },
  summaryCardLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryCardAmount: { fontSize: 28, fontWeight: 'bold', color: theme.colors.secondary, marginVertical: 6 },
  summaryCardRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 8 },
  summaryCardStat: { flex: 1, alignItems: 'center' },
  summaryCardDivider: { width: 1, backgroundColor: theme.colors.border, marginHorizontal: 12 },
  summaryCardStatLabel: { fontSize: 10, color: theme.colors.textMuted, textTransform: 'uppercase' },
  summaryCardStatValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.secondary, marginTop: 2 },
  readOnlyNote: { marginTop: 12, fontSize: 11, color: theme.colors.textLight, textAlign: 'center', fontStyle: 'italic' },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    ...theme.shadows.card,
  },
  cardSelected: { borderWidth: 1.5, borderColor: theme.colors.primary },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.secondary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardMetaText: { fontSize: 11, color: theme.colors.textLight, marginStart: 3 },
  cardAmount: { fontSize: 14, fontWeight: 'bold', color: theme.colors.success },

  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  settleBtnText: { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },

  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  markPaidText: { fontSize: 10, color: theme.colors.success, fontWeight: '600' },

  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  badgePaid: { backgroundColor: '#d1fae5' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeTextPaid: { color: '#065f46' },
  badgeTextPending: { color: '#92400e' },

  emptyContainer: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 12, fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.secondary, flex: 1 },

  summaryBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: { fontSize: 13, color: theme.colors.textMuted },
  summaryValue: { fontSize: 13, color: theme.colors.secondary },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateField: { flex: 1 },
  fieldLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, fontWeight: '500' },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 16,
    marginTop: 4,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: theme.colors.border },
  confirmBtnText: { fontSize: 14, color: theme.colors.white, fontWeight: 'bold' },
});

export default EarningsScreen;
