import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  AdminAuthProvider,
  useAdminAuth,
} from '../../contexts/admin/adminauthcontext';
import AdminLogin from './login';

// Mock the auth context
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to, replace }) => {
    mockNavigate(to, { replace });
    return null;
  },
}));

jest.mock('../../contexts/admin/adminauthcontext', () => ({
  ...jest.requireActual('../../contexts/admin/adminauthcontext'),
  useAdminAuth: jest.fn(),
}));

const renderLogin = (authState = {}) => {
  const defaultAuthState = {
    login: mockLogin,
    loading: false,
    isAuthenticated: false,
    ...authState,
  };

  useAdminAuth.mockReturnValue(defaultAuthState);

  return render(
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminLogin />
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

describe('AdminLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders login form with all elements', () => {
      renderLogin();

      expect(screen.getByText('Yushan Admin')).toBeInTheDocument();
      expect(
        screen.getByText('Web Novel Platform Administration')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /login/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText('~ Yushan Platform Administrators only ~')
      ).toBeInTheDocument();
    });

    test('renders with correct styling and layout', () => {
      renderLogin();

      const card = screen.getByText('Yushan Admin').closest('.ant-card');
      expect(card).toBeInTheDocument();

      const form = screen.getByPlaceholderText('Email').closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Authentication Redirect', () => {
    test('redirects to dashboard when already authenticated', () => {
      renderLogin({ isAuthenticated: true });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', {
        replace: true,
      });
    });

    test('does not redirect when not authenticated', () => {
      renderLogin({ isAuthenticated: false });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for empty email', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter your email')).toBeInTheDocument();
      });
    });

    test('shows validation error for invalid email format', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });
    });

    test('shows validation error for empty password', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your password')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Login Functionality', () => {
    test('calls login with correct credentials on form submit', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'admin@example.com',
          password: 'password123',
        });
      });
    });

    test('navigates to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', {
          replace: true,
        });
      });
    });

    test('shows error message on failed login', async () => {
      mockLogin.mockResolvedValue({ success: false });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // The error is set on the password field via form.setFields
        expect(passwordInput.closest('.ant-form-item')).toHaveClass(
          'ant-form-item-has-error'
        );
      });
    });

    test('handles login error gracefully', async () => {
      mockLogin.mockResolvedValue({ success: false });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // The error is set on the password field via form.setFields
        expect(
          screen.getByText('Invalid username or password')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner on login button when loading', () => {
      renderLogin({ loading: true });

      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toHaveClass('ant-btn-loading');
    });

    test('does not disable form inputs when loading', () => {
      renderLogin({ loading: true });

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      // Ant Design doesn't disable inputs by default during loading
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and autocomplete attributes', () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    test('form has proper structure for screen readers', () => {
      renderLogin();

      const form = screen.getByPlaceholderText('Email').closest('form');
      expect(form).toBeInTheDocument();

      // Check that inputs are associated with labels through Form.Item
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
    });
  });

  describe('User Experience', () => {
    test('clears previous errors when starting new login attempt', async () => {
      mockLogin
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      // First failed attempt
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid username or password')
        ).toBeInTheDocument();
      });

      // Second successful attempt
      fireEvent.change(passwordInput, { target: { value: 'correct' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Invalid username or password')
        ).not.toBeInTheDocument();
      });
    });

    test('maintains form values after failed login', async () => {
      mockLogin.mockResolvedValue({ success: false });
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('admin@example.com');
        expect(passwordInput.value).toBe('password123');
      });
    });
  });
});
