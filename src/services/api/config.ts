import { Platform } from 'react-native';

export const getBaseURL = () => {
  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api/v1'
      : 'http://localhost:3000/api/v1';
  }
  return 'http://192.168.0.128:3000/api/v1';
};
