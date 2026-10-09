import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { DocumentPhotoPicker } from '../components/onboarding/DocumentPhotoPicker';
import { DeliveryService, PickedImage } from '../services/api/deliveryService';
import { useAuth } from '../app/AuthContext';
import { DEMO_MODE } from '../config/demo';
import { theme } from '../theme';

const PHONE_RE = /^\+?[0-9]{10,15}$/;
const demoPhone = () => `010${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

// Step 2 of office signup: office details and documents. On success the office exists
// as PENDING_REVIEW and the gate switches to the status screen.
const OfficeOnboardingScreen = () => {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const align = { textAlign: i18n.language === 'ar' ? 'right' : 'left' } as const;

  // While DEMO_MODE is on, start with demo details; only the photos still need picking
  const [name, setName] = useState(DEMO_MODE ? 'مكتب توصيل تجريبي' : '');
  const [phone, setPhone] = useState(() => (DEMO_MODE ? demoPhone() : ''));
  const [address, setAddress] = useState(DEMO_MODE ? 'برج العرب الجديدة، الإسكندرية' : '');
  const [ownerId, setOwnerId] = useState<PickedImage | null>(null);
  const [register, setRegister] = useState<PickedImage | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !address.trim()) return Toast.show({ type: 'error', text1: t('office_signup.details_required') });
    if (!PHONE_RE.test(phone.replace(/[\s-]/g, ''))) return Toast.show({ type: 'error', text1: t('office_signup.invalid_phone') });
    if (!ownerId || !register) return Toast.show({ type: 'error', text1: t('office_signup.documents_required') });

    let failedStep = 'office_signup.upload_failed';
    try {
      setProgress(t('office_signup.uploading'));
      const ownerNationalIdUrl = await DeliveryService.uploadOfficeDocument(ownerId);
      const commercialRegisterUrl = await DeliveryService.uploadOfficeDocument(register);
      failedStep = 'office_signup.submit_failed';
      setProgress(t('office_signup.submitting'));
      await DeliveryService.registerOffice({
        name: name.trim(),
        phone: phone.replace(/[\s-]/g, ''),
        address: address.trim(),
        ownerNationalIdUrl,
        commercialRegisterUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ['myOffice'] });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || t(failedStep) });
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <Text style={styles.title}>{t('office_signup.onboarding_title')}</Text>
            <TouchableOpacity onPress={signOut} disabled={busy} hitSlop={10}>
              <LogOut size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{t('office_signup.onboarding_subtitle')}</Text>

          <TextInput style={[styles.input, align]} placeholder={t('office_signup.office_name')} value={name} onChangeText={setName} placeholderTextColor={theme.colors.textMuted} />
          <TextInput style={[styles.input, align]} placeholder={t('office_signup.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.colors.textMuted} />
          <TextInput style={[styles.input, align]} placeholder={t('office_signup.address')} value={address} onChangeText={setAddress} placeholderTextColor={theme.colors.textMuted} />

          <Text style={styles.section}>{t('office_signup.documents')}</Text>
          <DocumentPhotoPicker label={t('office_signup.owner_national_id')} value={ownerId} onChange={setOwnerId} />
          <DocumentPhotoPicker label={t('office_signup.commercial_register')} value={register} onChange={setRegister} />
          <Text style={styles.privacy}>{t('office_signup.documents_privacy')}</Text>

          <TouchableOpacity style={[styles.button, busy && styles.disabled]} onPress={submit} disabled={busy}>
            {busy ? (
              <View style={styles.progressRow}>
                <ActivityIndicator color={theme.colors.white} />
                <Text style={styles.buttonText}>{progress}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('office_signup.submit')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { padding: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary },
  subtitle: { color: theme.colors.textMuted, marginTop: 6, marginBottom: 18 },
  input: { height: 52, backgroundColor: theme.colors.background, borderRadius: theme.radius.md, paddingHorizontal: 14, fontSize: 16, color: theme.colors.text, marginBottom: 12 },
  section: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 10, marginBottom: 10 },
  privacy: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 8 },
  button: { backgroundColor: theme.colors.primary, height: 54, borderRadius: theme.radius.md, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  disabled: { opacity: 0.8 },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default OfficeOnboardingScreen;
