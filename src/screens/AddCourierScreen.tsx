import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import CustomHeader from '../components/common/CustomHeader';
import { DocumentPhotoPicker } from '../components/onboarding/DocumentPhotoPicker';
import { DeliveryService, PickedImage } from '../services/api/deliveryService';
import { CourierService } from '../services/api/courierService';
import { DEMO_MODE } from '../config/demo';
import { theme } from '../theme';

const VEHICLES = ['Motorcycle', 'Car', 'Bicycle'] as const;
type Vehicle = (typeof VEHICLES)[number];
const PHONE_RE = /^\+?[0-9]{10,15}$/;
const MIN_PASSWORD = 8;
const demoPhone = () => `010${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
const demoEmail = () => `courier${Date.now().toString().slice(-6)}@citymarket.com`;

// Manager adds a courier to the office. The account is created right away but the
// courier can't work until an admin reviews the documents and approves.
const AddCourierScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const align = { textAlign: i18n.language === 'ar' ? 'right' : 'left' } as const;

  // While DEMO_MODE is on, start with demo details; only the photos still need picking
  const [fullName, setFullName] = useState(DEMO_MODE ? 'مندوب تجريبي' : '');
  const [phone, setPhone] = useState(() => (DEMO_MODE ? demoPhone() : ''));
  const [email, setEmail] = useState(() => (DEMO_MODE ? demoEmail() : ''));
  const [password, setPassword] = useState(DEMO_MODE ? 'password123' : '');
  const [vehicleType, setVehicleType] = useState<Vehicle>('Motorcycle');
  const [licensePlate, setLicensePlate] = useState(DEMO_MODE ? 'أ ب ج 1234' : '');
  const [nationalId, setNationalId] = useState<PickedImage | null>(null);
  const [license, setLicense] = useState<PickedImage | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const needsLicense = vehicleType !== 'Bicycle';

  const submit = async () => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!fullName.trim() || !email.trim()) return Toast.show({ type: 'error', text1: t('office_couriers.details_required') });
    if (!PHONE_RE.test(cleanPhone)) return Toast.show({ type: 'error', text1: t('office_signup.invalid_phone') });
    if (password.length < MIN_PASSWORD) return Toast.show({ type: 'error', text1: t('office_couriers.password') });
    if (!nationalId || (needsLicense && !license)) return Toast.show({ type: 'error', text1: t('office_couriers.documents_required') });

    let failedStep = 'office_signup.upload_failed';
    try {
      setProgress(t('office_signup.uploading'));
      const nationalIdUrl = await DeliveryService.uploadCourierDocument(nationalId);
      const licenseUrl = needsLicense && license ? await DeliveryService.uploadCourierDocument(license) : undefined;
      failedStep = 'office_signup.submit_failed';
      setProgress(t('office_signup.submitting'));
      await CourierService.addOfficeCourier({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        password,
        vehicleType,
        licensePlate: needsLicense ? licensePlate.trim() || undefined : undefined,
        nationalIdUrl,
        licenseUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ['couriers'] });
      Toast.show({ type: 'success', text1: t('office_couriers.sent') });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || t(failedStep) });
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  const input = (value: string, onChange: (v: string) => void, placeholder: string, extra?: object) => (
    <TextInput
      style={[styles.input, align]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      placeholderTextColor={theme.colors.textMuted}
      {...extra}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader title={t('office_couriers.add_title')} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>{t('office_couriers.add_subtitle')}</Text>

          {input(fullName, setFullName, t('office_couriers.full_name'))}
          {input(phone, setPhone, t('office_couriers.phone'), { keyboardType: 'phone-pad' })}
          {input(email, setEmail, t('office_couriers.email'), { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false })}
          {input(password, setPassword, t('office_couriers.password'), { secureTextEntry: true, autoCapitalize: 'none' })}

          <Text style={styles.section}>{t('office_couriers.vehicle')}</Text>
          <View style={styles.vehicles}>
            {VEHICLES.map(v => (
              <TouchableOpacity key={v} style={[styles.vehicle, vehicleType === v && styles.vehicleActive]} onPress={() => setVehicleType(v)}>
                <Text style={[styles.vehicleText, vehicleType === v && styles.vehicleTextActive]}>{t(`office_couriers.vehicle_${v.toLowerCase()}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {needsLicense && input(licensePlate, setLicensePlate, t('office_couriers.license_plate'))}

          <DocumentPhotoPicker label={t('office_couriers.national_id')} value={nationalId} onChange={setNationalId} />
          {needsLicense && <DocumentPhotoPicker label={t('office_couriers.license')} value={license} onChange={setLicense} />}

          <TouchableOpacity style={[styles.button, busy && styles.disabled]} onPress={submit} disabled={busy}>
            {busy ? (
              <View style={styles.progressRow}>
                <ActivityIndicator color={theme.colors.white} />
                <Text style={styles.buttonText}>{progress}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('office_couriers.submit')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { padding: 20, paddingBottom: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 16 },
  input: { height: 52, backgroundColor: theme.colors.background, borderRadius: theme.radius.md, paddingHorizontal: 14, fontSize: 16, color: theme.colors.text, marginBottom: 12 },
  section: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 4, marginBottom: 10 },
  vehicles: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  vehicle: { flex: 1, height: 44, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  vehicleActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  vehicleText: { color: theme.colors.textMuted, fontWeight: '600' },
  vehicleTextActive: { color: theme.colors.primary },
  button: { backgroundColor: theme.colors.primary, height: 54, borderRadius: theme.radius.md, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  disabled: { opacity: 0.8 },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default AddCourierScreen;
