import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Building2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { AuthService } from '../services/api/authService';
import { useAuth } from '../app/AuthContext';
import { DEMO_MODE, DEMO_PASSWORD } from '../config/demo';
import { theme } from '../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
// While DEMO_MODE is on, signup starts with a fresh demo account (random so it's unused)
const demoEmail = () => `office.demo.${Math.random().toString(36).slice(2, 8)}@citymarket.com`;

// Step 1 of office signup: the manager account. The office gate then shows the
// office details form, because this account has no office yet.
const SignupScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(() => (DEMO_MODE ? demoEmail() : ''));
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_PASSWORD : '');
  const [confirm, setConfirm] = useState(DEMO_MODE ? DEMO_PASSWORD : '');
  const [loading, setLoading] = useState(false);
  const align = { textAlign: i18n.language === 'ar' ? 'right' : 'left' } as const;

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) return Toast.show({ type: 'error', text1: t('office_signup.invalid_email') });
    if (password.length < MIN_PASSWORD) return Toast.show({ type: 'error', text1: t('office_signup.password_too_short', { min: MIN_PASSWORD }) });
    if (password !== confirm) return Toast.show({ type: 'error', text1: t('office_signup.passwords_dont_match') });
    setLoading(true);
    try {
      const data = await AuthService.register({ email: email.trim().toLowerCase(), password });
      await signIn(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || t('office_signup.failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}>
              <Building2 size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{t('office_signup.title')}</Text>
            <Text style={styles.subtitle}>{t('office_signup.subtitle')}</Text>
          </View>
          <View style={styles.inputRow}>
            <Mail size={20} color={theme.colors.textMuted} />
            <TextInput style={[styles.input, align]} placeholder={t('office_signup.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} />
          </View>
          <View style={styles.inputRow}>
            <Lock size={20} color={theme.colors.textMuted} />
            <TextInput style={[styles.input, align]} placeholder={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.colors.textMuted} />
          </View>
          <View style={styles.inputRow}>
            <Lock size={20} color={theme.colors.textMuted} />
            <TextInput style={[styles.input, align]} placeholder={t('office_signup.confirm_password')} value={confirm} onChangeText={setConfirm} secureTextEntry placeholderTextColor={theme.colors.textMuted} />
          </View>
          <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>{t('office_signup.create_account')}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>{t('office_signup.have_account')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { padding: 28, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginTop: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.background, borderRadius: theme.radius.md, paddingHorizontal: 14, marginBottom: 14 },
  input: { flex: 1, height: 54, fontSize: 16, color: theme.colors.text },
  button: { backgroundColor: theme.colors.primary, height: 54, borderRadius: theme.radius.md, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.7 },
  buttonText: { color: theme.colors.white, fontSize: 17, fontWeight: 'bold' },
  link: { alignItems: 'center', marginTop: 22 },
  linkText: { color: theme.colors.primary, fontWeight: '600' },
});

export default SignupScreen;
