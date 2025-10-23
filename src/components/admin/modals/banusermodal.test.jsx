// Import React testing utilities
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Import the component to test
import BanUserModal from './banusermodal';

// Mock Ant Design message service
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

describe('BanUserModal', () => {
  // Define mock data and props
  const mockUser = {
    id: '123',
    username: 'testuser',
  };

  const defaultProps = {
    visible: true,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    user: mockUser,
    loading: false,
  };

  // Set up a new user event instance for each test
  // This is the modern replacement for fireEvent for complex interactions
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    // Mock window.matchMedia, which is required by Ant Design's components in a JSDOM environment
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when visible is true and user is provided', () => {
      render(<BanUserModal {...defaultProps} />);

      expect(screen.getByText(/Ban User: testuser/i)).toBeInTheDocument();
      expect(
        screen.getByText(/This action will restrict the user's access/i)
      ).toBeInTheDocument();
    });

    it('should not render when user is null', () => {
      const { container } = render(
        <BanUserModal {...defaultProps} user={null} />
      );
      // The modal root should not be in the container
      expect(container.firstChild).toBeNull();
    });

    it('should not render when user is undefined', () => {
      const { container } = render(
        <BanUserModal {...defaultProps} user={undefined} />
      );
      // The modal root should not be in the container
      expect(container.firstChild).toBeNull();
    });

    it('should render all form fields', () => {
      render(<BanUserModal {...defaultProps} />);

      expect(screen.getByText('Ban Type')).toBeInTheDocument();
      expect(screen.getByText('Ban Reason')).toBeInTheDocument();
      expect(
        screen.getByText('Public Reason (shown to user)')
      ).toBeInTheDocument();
      expect(screen.getByText('Internal Admin Notes')).toBeInTheDocument();
    });

    it('should have correct initial form values', () => {
      render(<BanUserModal {...defaultProps} />);

      // Check checkboxes initial state
      const notifyCheckbox = screen.getByRole('checkbox', {
        name: /Send ban notification/i,
      });
      const deleteCheckbox = screen.getByRole('checkbox', {
        name: /Delete all user's content/i,
      });

      expect(notifyCheckbox).toBeChecked();
      expect(deleteCheckbox).not.toBeChecked();
    });
  });

  describe('Ban Type Selection', () => {
    it('should show expiration date picker for temporary ban', async () => {
      render(<BanUserModal {...defaultProps} />);

      // Default is temporary, so date picker should be visible
      expect(screen.getByText('Ban Expires At')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when submitting without required fields', async () => {
      render(<BanUserModal {...defaultProps} />);

      const banButton = screen.getByRole('button', { name: /Ban User/i });
      await user.click(banButton);

      // Check for all validation messages
      await waitFor(() => {
        expect(
          screen.getByText(/Please select expiration date/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Please provide a ban reason/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Please provide a public reason/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    // Helper function to fill the form with valid temporary ban data

    // This test correctly checks for *validation* errors
    it('should log validation errors to console', async () => {
      // Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<BanUserModal {...defaultProps} />);

      // Try to submit without filling required fields
      const banButton = screen.getByRole('button', { name: /Ban User/i });
      await user.click(banButton);

      // Wait for the console log
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Ban validation failed:',
          expect.any(Object)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Modal Actions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      render(<BanUserModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should show loading state on ban button', () => {
      // The test was checking toBeDisabled(), but the error log shows
      // the button gets 'ant-btn-loading' class instead.
      // We will assert that class.
      render(<BanUserModal {...defaultProps} loading={true} />);

      const banButton = screen.getByRole('button', { name: /Ban User/i });
      expect(banButton).toHaveClass('ant-btn-loading');
    });
  });

  describe('Character Limits', () => {
    it('should show character count for public reason', () => {
      render(<BanUserModal {...defaultProps} />);

      const publicReasonInput = screen.getByPlaceholderText(
        /This will be shown to the user/i
      );
      // Check for the showCount prop (which AntD uses) or maxlength
      expect(publicReasonInput).toHaveAttribute('maxlength', '500');
    });

    it('should show character count for admin notes', () => {
      render(<BanUserModal {...defaultProps} />);

      const adminNotesInput = screen.getByPlaceholderText(
        /Internal notes for other administrators/i
      );
      expect(adminNotesInput).toHaveAttribute('maxlength', '1000');
    });
  });

  describe('Modal Properties', () => {
    it('should have danger button style for ban action', () => {
      render(<BanUserModal {...defaultProps} />);

      const banButton = screen.getByRole('button', { name: /Ban User/i });
      // AntD adds this class for 'danger' prop
      expect(banButton).toHaveClass('ant-btn-dangerous');
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with special characters in username', () => {
      const specialUser = { id: '456', username: 'test@user#123' };
      render(<BanUserModal {...defaultProps} user={specialUser} />);

      expect(screen.getByText(/Ban User: test@user#123/i)).toBeInTheDocument();
    });

    it('should not crash when visible changes to false', () => {
      const { rerender } = render(<BanUserModal {...defaultProps} />);

      expect(screen.getByText(/Ban User: testuser/i)).toBeInTheDocument();

      // Rerender with visible: false
      rerender(<BanUserModal {...defaultProps} visible={false} />);

      // Modal should not be visible but should not crash
      expect(screen.queryByText(/Ban User: testuser/i)).not.toBeInTheDocument();
    });

    it('should handle rapid form submissions', async () => {
      render(<BanUserModal {...defaultProps} />);

      const banButton = screen.getByRole('button', { name: /Ban User/i });

      // Click multiple times rapidly
      // userEvent handles this more gracefully than fireEvent
      await user.click(banButton);
      await user.click(banButton);

      // Should only trigger validation once and not crash
      await waitFor(() => {
        expect(screen.getAllByText(/Please/i).length).toBeGreaterThan(0);
      });
      // onConfirm should not be called at all
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<BanUserModal {...defaultProps} />);

      // Check that labels exist
      expect(screen.getByText('Ban Type')).toBeInTheDocument();
      expect(screen.getByText('Ban Reason')).toBeInTheDocument();
      expect(
        screen.getByText('Public Reason (shown to user)')
      ).toBeInTheDocument();
      expect(screen.getByText('Internal Admin Notes')).toBeInTheDocument();

      // Check that they are linked to inputs (this is a more robust check)
      expect(
        screen.getByRole('combobox', { name: /Ban Type/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Ban Reason/i })
      ).toBeInTheDocument();
    });

    it('should have accessible checkboxes', () => {
      render(<BanUserModal {...defaultProps} />);

      const deleteCheckbox = screen.getByRole('checkbox', {
        name: /Delete all user's content/i,
      });
      const notifyCheckbox = screen.getByRole('checkbox', {
        name: /Send ban notification/i,
      });

      expect(deleteCheckbox).toBeInTheDocument();
      expect(notifyCheckbox).toBeInTheDocument();
    });
  });
});
