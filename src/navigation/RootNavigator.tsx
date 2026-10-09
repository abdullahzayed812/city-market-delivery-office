import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export const navigationRef = createNavigationContainerRef();
import { useAuth } from '../app/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OfficeOnboardingScreen from '../screens/OfficeOnboardingScreen';
import OfficeStatusScreen from '../screens/OfficeStatusScreen';
import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '../services/api/deliveryService';
import { useSocket } from '../app/SocketContext';
import MainTabNavigator from './MainTabNavigator';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';

const Stack = createNativeStackNavigator();
const TERMS_ACCEPTED_KEY = '@citymarket_delivery_terms_accepted';

// What a signed-in manager sees, from their office:
//   no office yet (new signup)        -> office details + documents
//   office pending review / suspended -> status screen
//   approved                          -> the app
const OfficeGate = () => {
  const { socket } = useSocket();
  const { data: office, error, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myOffice'],
    queryFn: () => DeliveryService.getMyOffice(),
    // 404 just means "no office yet"; don't retry it
    retry: (count, err: any) => err?.response?.status !== 404 && count < 2,
  });

  // The gateway joins office:<id> only on connect: reconnect once the office is approved
  const previous = React.useRef(office?.approvalStatus);
  React.useEffect(() => {
    if (previous.current && previous.current !== 'APPROVED' && office?.approvalStatus === 'APPROVED' && socket) {
      socket.disconnect();
      socket.connect();
    }
    previous.current = office?.approvalStatus;
  }, [office?.approvalStatus, socket]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if ((error as any)?.response?.status === 404) return <OfficeOnboardingScreen />;
  if (office && office.approvalStatus !== 'APPROVED') {
    return <OfficeStatusScreen office={office} refetch={() => refetch()} refreshing={isRefetching} />;
  }
  return <MainTabNavigator />;
};

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [termsAccepted, setTermsAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem(TERMS_ACCEPTED_KEY).then(value => {
      setTermsAccepted(value === 'true');
    });
  }, []);

  const handleAcceptTerms = async () => {
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setTermsAccepted(true);
  };

  if (isLoading || termsAccepted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!termsAccepted) {
    return <TermsAndConditionsScreen onAccept={handleAcceptTerms} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={OfficeGate} />
        ) : (
          <>
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
