import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Truck, ChevronRight, Server } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';
import Toast from 'react-native-toast-message';
import { UserRole } from '@city-market/shared';
import { SERVERS, getServerIP, setServerIP } from '../utils/serverConfig';

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('deliverymanager@citymarket.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS.PC);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const loadServer = async () => {
      const ip = await getServerIP();
      setSelectedServer(ip);
    };
    loadServer();
  }, []);

  const handleServerChange = async (ip: string) => {
    await setServerIP(ip);
    setSelectedServer(ip);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.fill_all_fields'),
      });
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });

      if (data.user?.role !== UserRole.DELIVERY_MANAGER) {
        throw new Error(
          'Unauthorized: Only delivery managers can access this app',
        );
      }

      await signIn(data.user, data.accessToken, data.refreshToken);
      Toast.show({ type: 'success', text1: t('common.welcome_back') });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('auth.login_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBackground} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Truck size={42} color={theme.colors.white} />
              </View>
              <Text style={styles.title}>{t('auth.login_title')}</Text>
              <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>
            </View>

            {/* Server Selection */}
            <View style={styles.serverSection}>
              <View style={styles.serverHeader}>
                <Server size={14} color={theme.colors.primary} />
                <Text style={styles.serverTitle}>Server Environment</Text>
              </View>
              <View style={styles.serverButtons}>
                <TouchableOpacity 
                  style={[styles.serverBtn, selectedServer === SERVERS.PC && styles.serverBtnActive]}
                  onPress={() => handleServerChange(SERVERS.PC)}
                >
                  <Text style={[styles.serverBtnText, selectedServer === SERVERS.PC && styles.serverBtnTextActive]}>PC</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.serverBtn, selectedServer === SERVERS.LAPTOP && styles.serverBtnActive]}
                  onPress={() => handleServerChange(SERVERS.LAPTOP)}
                >
                  <Text style={[styles.serverBtnText, selectedServer === SERVERS.LAPTOP && styles.serverBtnTextActive]}>Laptop</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <View style={styles.inputWrapper}>
                <Mail
                  size={20}
                  color={theme.colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                  placeholder="name@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={styles.inputWrapper}>
                <Lock
                  size={20}
                  color={theme.colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      {t('common.login')}
                    </Text>
                    <ChevronRight
                      size={20}
                      color={theme.colors.white}
                      style={isRTL && { transform: [{ rotate: '180deg' }] }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.footerText}>
            {t('auth.authorized_only')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.medium,
  },
  title: { fontSize: 26, fontWeight: theme.typography.weights.black, color: theme.colors.secondary },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  serverSection: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  serverTitle: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serverButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  serverBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serverBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  serverBtnText: {
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
  },
  serverBtnTextActive: {
    color: theme.colors.white,
  },
  form: { width: '100%' },
  label: {
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
    marginBottom: 8,
    marginStart: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: { marginEnd: 12 },
  input: { 
    flex: 1, 
    height: 56, 
    color: theme.colors.secondary, 
    fontSize: 15,
    fontWeight: theme.typography.weights.medium,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: theme.colors.primary, fontWeight: theme.typography.weights.bold, fontSize: 13 },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    marginEnd: 8,
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 30,
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
  }
});

export default LoginScreen;
