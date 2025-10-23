import { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import authService from '../../services/admin/authservice';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state on component mount
    const initAuth = async () => {
      try {
        const isAuthenticated = await authService.initializeAuth();
        if (isAuthenticated) {
          const currentUser = authService.getCurrentUser();
          // All user data including avatar is already in stored user data
          setAdmin(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        // User data including avatar is already included in the login response
        setAdmin(result.data.user);
        message.success('Login successful!');
        return { success: true, user: result.data.user };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      message.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
  };

  const refreshUserProfile = async () => {
    if (!admin) return;

    try {
      // Import dynamically to avoid issues
      const { getCurrentUserProfile } = await import(
        '../../services/admin/userservice'
      );
      const profileResponse = await getCurrentUserProfile();
      if (profileResponse.success) {
        const updatedAdmin = {
          ...admin,
          avatar: profileResponse.data.avatar || profileResponse.data.avatarUrl,
          avatarUrl:
            profileResponse.data.avatar || profileResponse.data.avatarUrl,
          username: profileResponse.data.username,
          email: profileResponse.data.email,
          isAdmin: profileResponse.data.profile?.isAdmin,
          isAuthor: profileResponse.data.profile?.isAuthor,
          level: profileResponse.data.profile?.level,
          status: profileResponse.data.status,
        };
        setAdmin(updatedAdmin);
        // Also update localStorage
        localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
      }
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    refreshUserProfile,
    isAuthenticated: !!admin, // Add isAuthenticated property
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
