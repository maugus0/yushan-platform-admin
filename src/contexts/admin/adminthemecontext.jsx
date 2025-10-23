import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const AdminThemeContext = createContext();

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [compactMode, setCompactMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    const savedPrimaryColor = localStorage.getItem('admin-primary-color');
    const savedCompactMode = localStorage.getItem('admin-compact-mode');

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }
    if (savedCompactMode) {
      setCompactMode(JSON.parse(savedCompactMode));
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  // Apply primary color
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    localStorage.setItem('admin-primary-color', primaryColor);
  }, [primaryColor]);

  // Apply compact mode
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-compact',
      compactMode.toString()
    );
    localStorage.setItem('admin-compact-mode', JSON.stringify(compactMode));
  }, [compactMode]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, []);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, []);

  const updatePrimaryColor = useCallback((color) => {
    setPrimaryColor(color);
  }, []);

  const toggleCompactMode = useCallback(() => {
    setCompactMode((prev) => !prev);
  }, []);

  const resetToDefaults = useCallback(() => {
    setTheme('light');
    setPrimaryColor('#1890ff');
    setCompactMode(false);
  }, []);

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const value = {
    theme,
    primaryColor,
    compactMode,
    isDark,
    isLight,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    updatePrimaryColor,
    toggleCompactMode,
    resetToDefaults,
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};
