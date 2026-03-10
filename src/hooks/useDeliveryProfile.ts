import { useAuth } from '../app/AuthContext';

export const useCourierProfile = () => {
  const { user, isLoading } = useAuth();

  return {
    profile: user ? {
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
    } : null,
    isLoading,
    error: null,
  };
};
