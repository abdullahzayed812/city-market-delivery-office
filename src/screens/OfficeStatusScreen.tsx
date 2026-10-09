import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Ban, LogOut, RefreshCw } from 'lucide-react-native';
import { EventType } from '@city-market/shared';
import { MyOffice } from '../services/api/deliveryService';
import { useAuth } from '../app/AuthContext';
import { useSocket } from '../app/SocketContext';
import { theme } from '../theme';

// Office waiting for admin review, or suspended. The gate swaps it for the app once approved.
const OfficeStatusScreen = ({ office, refetch, refreshing }: { office: MyOffice; refetch: () => void; refreshing: boolean }) => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const suspended = office.approvalStatus === 'SUSPENDED';

  // The admin decision is pushed to user:<id>; refetch so the gate reacts at once
  useEffect(() => {
    if (!socket) return;
    const onDecision = () => queryClient.invalidateQueries({ queryKey: ['myOffice'] });
    socket.on(EventType.OFFICE_APPROVAL_UPDATED, onDecision);
    return () => {
      socket.off(EventType.OFFICE_APPROVAL_UPDATED, onDecision);
    };
  }, [socket, queryClient]);

  const Icon = suspended ? Ban : Clock;
  const accent = suspended ? theme.colors.error : theme.colors.warning;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
        <View style={[styles.iconCircle, { backgroundColor: accent + '20' }]}>
          <Icon size={44} color={accent} />
        </View>
        <Text style={styles.title}>{t(suspended ? 'office_signup.suspended_title' : 'office_signup.pending_title')}</Text>
        <Text style={styles.name}>{office.name}</Text>
        <Text style={styles.body}>{t(suspended ? 'office_signup.suspended_body' : 'office_signup.pending_body')}</Text>
        {!suspended && (
          <TouchableOpacity style={styles.primary} onPress={refetch}>
            <RefreshCw size={18} color={theme.colors.white} />
            <Text style={styles.primaryText}>{t('office_signup.check_status')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logout} onPress={signOut}>
          <LogOut size={18} color={theme.colors.textMuted} />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: 24, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  name: { color: theme.colors.primary, fontWeight: '600', marginTop: 6 },
  body: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 10, marginBottom: 24, lineHeight: 22 },
  primary: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, height: 52, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, marginBottom: 12 },
  primaryText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 16 },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  logoutText: { color: theme.colors.textMuted },
});

export default OfficeStatusScreen;
