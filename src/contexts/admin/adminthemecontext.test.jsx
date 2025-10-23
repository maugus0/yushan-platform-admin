import { render, screen, fireEvent, act } from '@testing-library/react';
import { AdminThemeProvider, useAdminTheme } from './adminthemecontext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to consume context
const TestComponent = () => {
  const {
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
  } = useAdminTheme();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="primary-color">{primaryColor}</div>
      <div data-testid="compact-mode">{compactMode.toString()}</div>
      <div data-testid="is-dark">{isDark.toString()}</div>
      <div data-testid="is-light">{isLight.toString()}</div>
      <button data-testid="toggle-theme-btn" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light-btn" onClick={setLightTheme}>
        Set Light
      </button>
      <button data-testid="set-dark-btn" onClick={setDarkTheme}>
        Set Dark
      </button>
      <button
        data-testid="update-color-btn"
        onClick={() => updatePrimaryColor('#ff0000')}
      >
        Update Color
      </button>
      <button data-testid="toggle-compact-btn" onClick={toggleCompactMode}>
        Toggle Compact
      </button>
      <button data-testid="reset-btn" onClick={resetToDefaults}>
        Reset
      </button>
    </div>
  );
};

describe('AdminThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-compact');
    document.documentElement.style.removeProperty('--primary-color');
  });

  describe('Provider rendering', () => {
    test('renders children correctly', () => {
      render(
        <AdminThemeProvider>
          <div>Test Child</div>
        </AdminThemeProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('initializes with default values', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#1890ff');
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    });
  });

  describe('useAdminTheme hook', () => {
    test('throws error when used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAdminTheme must be used within an AdminThemeProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Theme initialization from localStorage', () => {
    test('loads saved theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'admin-theme') return 'dark';
        if (key === 'admin-primary-color') return '#00ff00';
        if (key === 'admin-compact-mode') return 'true';
        return null;
      });

      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('admin-theme');
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'admin-primary-color'
      );
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'admin-compact-mode'
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#00ff00');
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('true');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    });

    test('uses defaults when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#1890ff');
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');
    });
  });

  describe('Theme application to DOM', () => {
    test('applies theme to document element', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'admin-theme',
        'light'
      );
    });

    test('applies primary color to CSS custom property', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(
        document.documentElement.style.getPropertyValue('--primary-color')
      ).toBe('#1890ff');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'admin-primary-color',
        '#1890ff'
      );
    });

    test('applies compact mode to document element', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-compact')).toBe(
        'false'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'admin-compact-mode',
        'false'
      );
    });
  });

  describe('Theme switching', () => {
    test('toggleTheme switches between light and dark', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme-btn'));
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-light')).toHaveTextContent('false');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme-btn'));
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('setLightTheme sets theme to light', () => {
      // Start with dark theme
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'admin-theme') return 'dark';
        return null;
      });

      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');

      act(() => {
        fireEvent.click(screen.getByTestId('set-light-btn'));
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('setDarkTheme sets theme to dark', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      act(() => {
        fireEvent.click(screen.getByTestId('set-dark-btn'));
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Primary color management', () => {
    test('updatePrimaryColor changes primary color', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('primary-color')).toHaveTextContent('#1890ff');

      act(() => {
        fireEvent.click(screen.getByTestId('update-color-btn'));
      });

      expect(screen.getByTestId('primary-color')).toHaveTextContent('#ff0000');
      expect(
        document.documentElement.style.getPropertyValue('--primary-color')
      ).toBe('#ff0000');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'admin-primary-color',
        '#ff0000'
      );
    });
  });

  describe('Compact mode', () => {
    test('toggleCompactMode switches compact mode', () => {
      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-compact-btn'));
      });

      expect(screen.getByTestId('compact-mode')).toHaveTextContent('true');
      expect(document.documentElement.getAttribute('data-compact')).toBe(
        'true'
      );

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-compact-btn'));
      });

      expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');
      expect(document.documentElement.getAttribute('data-compact')).toBe(
        'false'
      );
    });
  });

  describe('Reset to defaults', () => {
    test('resetToDefaults restores all default values', () => {
      // Start with modified values
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'admin-theme') return 'dark';
        if (key === 'admin-primary-color') return '#00ff00';
        if (key === 'admin-compact-mode') return 'true';
        return null;
      });

      render(
        <AdminThemeProvider>
          <TestComponent />
        </AdminThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#00ff00');
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('true');

      act(() => {
        fireEvent.click(screen.getByTestId('reset-btn'));
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#1890ff');
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(
        document.documentElement.style.getPropertyValue('--primary-color')
      ).toBe('#1890ff');
      expect(document.documentElement.getAttribute('data-compact')).toBe(
        'false'
      );
    });
  });

  describe('Context value', () => {
    test('provides all required values and functions', () => {
      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminTheme();
        return null;
      };

      render(
        <AdminThemeProvider>
          <ContextConsumer />
        </AdminThemeProvider>
      );

      expect(contextValue).toHaveProperty('theme');
      expect(contextValue).toHaveProperty('primaryColor');
      expect(contextValue).toHaveProperty('compactMode');
      expect(contextValue).toHaveProperty('isDark');
      expect(contextValue).toHaveProperty('isLight');
      expect(contextValue).toHaveProperty('toggleTheme');
      expect(contextValue).toHaveProperty('setLightTheme');
      expect(contextValue).toHaveProperty('setDarkTheme');
      expect(contextValue).toHaveProperty('updatePrimaryColor');
      expect(contextValue).toHaveProperty('toggleCompactMode');
      expect(contextValue).toHaveProperty('resetToDefaults');

      // Check types
      expect(typeof contextValue.theme).toBe('string');
      expect(typeof contextValue.primaryColor).toBe('string');
      expect(typeof contextValue.compactMode).toBe('boolean');
      expect(typeof contextValue.isDark).toBe('boolean');
      expect(typeof contextValue.isLight).toBe('boolean');
      expect(typeof contextValue.toggleTheme).toBe('function');
      expect(typeof contextValue.setLightTheme).toBe('function');
      expect(typeof contextValue.setDarkTheme).toBe('function');
      expect(typeof contextValue.updatePrimaryColor).toBe('function');
      expect(typeof contextValue.toggleCompactMode).toBe('function');
      expect(typeof contextValue.resetToDefaults).toBe('function');
    });
  });

  describe('Computed properties', () => {
    test('isDark and isLight are correctly computed', () => {
      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminTheme();
        return null;
      };

      render(
        <AdminThemeProvider>
          <ContextConsumer />
        </AdminThemeProvider>
      );

      expect(contextValue.isLight).toBe(true);
      expect(contextValue.isDark).toBe(false);

      act(() => {
        contextValue.setDarkTheme();
      });

      expect(contextValue.isLight).toBe(false);
      expect(contextValue.isDark).toBe(true);
    });
  });
});
