import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthContext';
import {
  LogOut,
  Globe,
  Clock,
  ChevronRight,
  Settings,
  ShieldCheck,
  HelpCircle,
  Building,
} from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/common/CustomHeader';
import { useCourierProfile } from '../hooks/useDeliveryProfile';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { profile, isLoading } = useCourierProfile();

  const ProfileItem = ({
    icon: Icon,
    label,
    value,
    onPress,
    isLast = false,
    color = theme.colors.primary,
  }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconBadge, { backgroundColor: color + '10' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        {onPress && (
          <ChevronRight
            size={18}
            color={theme.colors.textMuted}
            style={isRTL && { transform: [{ rotate: '180deg' }] }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader title={t('profile.title')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.fullName?.charAt(0) || 'A'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Settings size={14} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{profile?.fullName || 'Admin'}</Text>
          <View style={styles.roleBadge}>
            <ShieldCheck size={14} color={theme.colors.success} />
            <Text style={styles.roleText}>{t('profile.verified_manager')}</Text>
          </View>
          <Text style={styles.emailText}>{profile?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.vehicle_schedule')}
          </Text>
          <View style={styles.menuGroup}>
            <ProfileItem
              icon={Building}
              label={t('profile.vehicle')}
              value="Central Hub - CityMarket"
            />
            <ProfileItem
              icon={Clock}
              label={t('profile.working_hours')}
              value="08:00 - 18:00"
              onPress={() => {}}
              isLast={true}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.app_settings')}</Text>
          <View style={styles.menuGroup}>
            <ProfileItem
              icon={Globe}
              label={t('profile.language')}
              value={isRTL ? 'العربية' : 'English'}
              onPress={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
              color={theme.colors.info}
            />
            <ProfileItem
              icon={HelpCircle}
              label={t('profile.support_help')}
              onPress={() => {}}
              color={theme.colors.textMuted}
              isLast={true}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          {t('profile.version', { version: '2.4.0 (Build 102)' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: theme.colors.surface,
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  editBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 42,
    fontWeight: theme.typography.weights.black,
  },
  nameText: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: 'bold',
    marginStart: 6,
  },
  emailText: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8 },
  section: { marginTop: 25, paddingHorizontal: theme.spacing.lg },
  sectionTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginStart: 4,
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: theme.colors.secondary,
    fontWeight: theme.typography.weights.semibold,
  },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  menuValue: { fontSize: 14, color: theme.colors.textMuted, marginEnd: 8 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 18,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: 24,
    ...theme.shadows.card,
  },
  logoutText: {
    marginStart: 10,
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 30,
    marginBottom: 40,
  },
});

export default ProfileScreen;
