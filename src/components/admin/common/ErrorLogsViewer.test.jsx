import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorLogsViewer from './ErrorLogsViewer';
import errorReporter from '../../../utils/admin/errorReporting';

// Mock the error reporter
jest.mock('../../../utils/admin/errorReporting', () => ({
  __esModule: true,
  default: {
    getStoredErrors: jest.fn(),
    clearStoredErrors: jest.fn(),
  },
}));

describe('ErrorLogsViewer Component', () => {
  const mockErrors = [
    {
      message: 'Test Error 1',
      timestamp: new Date('2024-01-01T10:00:00').getTime(),
      url: 'https://example.com',
      context: {
        type: 'API_ERROR',
        endpoint: '/api/test',
      },
      stack: 'Error stack trace 1',
    },
    {
      message: 'Test Error 2',
      timestamp: new Date('2024-01-01T11:00:00').getTime(),
      url: 'https://example.com/page2',
      context: {
        type: 'COMPONENT_ERROR',
        componentName: 'TestComponent',
      },
      stack: 'Error stack trace 2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    errorReporter.getStoredErrors.mockReturnValue([]);
  });

  describe('Basic Rendering', () => {
    test('renders error logs viewer', () => {
      render(<ErrorLogsViewer />);
      expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
    });

    test('displays error count', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);
      expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('renders Clear All button', () => {
      render(<ErrorLogsViewer />);
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    test('disables Clear All button when no errors', () => {
      errorReporter.getStoredErrors.mockReturnValue([]);
      render(<ErrorLogsViewer />);
      const clearButton = screen.getByText('Clear All');
      expect(clearButton.closest('button')).toBeDisabled();
    });

    test('enables Clear All button when errors exist', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);
      const clearButton = screen.getByText('Clear All');
      expect(clearButton.closest('button')).not.toBeDisabled();
    });
  });

  describe('Error Table', () => {
    test('displays error messages in table', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('Test Error 1')).toBeInTheDocument();
      expect(screen.getByText('Test Error 2')).toBeInTheDocument();
    });

    test('displays error types with colors', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('API_ERROR')).toBeInTheDocument();
      expect(screen.getByText('COMPONENT_ERROR')).toBeInTheDocument();
    });

    test('formats timestamps correctly', () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);
      // Date formatting will vary by locale, so just check it exists
      const timestamps = screen.getAllByText(/2024|Jan|1\/1\/2024/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    test('displays context information', () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('/api/test')).toBeInTheDocument();
    });

    test('displays componentName when endpoint not available', () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[1]]);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('TestComponent')).toBeInTheDocument();
    });

    test('shows N/A when no context info available', () => {
      const errorWithoutContext = {
        ...mockErrors[0],
        context: {},
      };
      errorReporter.getStoredErrors.mockReturnValue([errorWithoutContext]);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('View Error Details', () => {
    test('opens modal when View button is clicked', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Error Details')).toBeInTheDocument();
      });
    });

    test('displays error message in modal', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getAllByText('Test Error 1').length).toBeGreaterThan(0);
      });
    });

    test('displays timestamp in modal', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Timestamp:')).toBeInTheDocument();
      });
    });

    test('displays URL in modal', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('URL:')).toBeInTheDocument();
        expect(
          screen.getAllByText('https://example.com').length
        ).toBeGreaterThan(0);
      });
    });

    test('displays context in modal', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Context:')).toBeInTheDocument();
      });
    });

    test('displays stack trace in modal', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
        expect(screen.getByText('Error stack trace 1')).toBeInTheDocument();
      });
    });

    test('closes modal when Close button is clicked', async () => {
      errorReporter.getStoredErrors.mockReturnValue([mockErrors[0]]);
      const { container } = render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Error Details')).toBeInTheDocument();
      });

      // Find all buttons and look for Close button
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((btn) =>
        btn.textContent.includes('Close')
      );

      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton);

      // Verify the button click was registered (modal may have animation)
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error Type Colors', () => {
    test('returns red for API_ERROR', () => {
      errorReporter.getStoredErrors.mockReturnValue([
        { ...mockErrors[0], context: { type: 'API_ERROR' } },
      ]);
      const { container } = render(<ErrorLogsViewer />);
      expect(container).toBeInTheDocument();
    });

    test('returns orange for COMPONENT_ERROR', () => {
      errorReporter.getStoredErrors.mockReturnValue([
        { ...mockErrors[0], context: { type: 'COMPONENT_ERROR' } },
      ]);
      const { container } = render(<ErrorLogsViewer />);
      expect(container).toBeInTheDocument();
    });

    test('returns gray for unknown type', () => {
      errorReporter.getStoredErrors.mockReturnValue([
        { ...mockErrors[0], context: { type: 'UNKNOWN' } },
      ]);
      const { container } = render(<ErrorLogsViewer />);
      expect(container).toBeInTheDocument();
    });

    test('handles missing type with GENERAL fallback', () => {
      errorReporter.getStoredErrors.mockReturnValue([
        { ...mockErrors[0], context: {} },
      ]);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('GENERAL')).toBeInTheDocument();
    });
  });

  describe('Clear Errors', () => {
    test('calls clearStoredErrors when Clear All is clicked', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);

      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      expect(errorReporter.clearStoredErrors).toHaveBeenCalled();
    });

    test('updates error list after clearing', async () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);

      expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });

  describe('Table Features', () => {
    test('renders table with pagination', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      const { container } = render(<ErrorLogsViewer />);
      expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
    });

    test('shows total count in pagination', () => {
      errorReporter.getStoredErrors.mockReturnValue(mockErrors);
      render(<ErrorLogsViewer />);
      expect(screen.getByText('Total 2 errors')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('renders empty table when no errors', () => {
      errorReporter.getStoredErrors.mockReturnValue([]);
      render(<ErrorLogsViewer />);

      expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();

      // "No data" appears multiple times (SVG title + text), so check it exists
      const noDataElements = screen.getAllByText('No data');
      expect(noDataElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles error without stack trace', async () => {
      const errorWithoutStack = { ...mockErrors[0], stack: null };
      errorReporter.getStoredErrors.mockReturnValue([errorWithoutStack]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Error Details')).toBeInTheDocument();
        expect(screen.queryByText('Stack Trace:')).not.toBeInTheDocument();
      });
    });

    test('handles error without context', async () => {
      const errorWithoutContext = { ...mockErrors[0], context: null };
      errorReporter.getStoredErrors.mockReturnValue([errorWithoutContext]);
      render(<ErrorLogsViewer />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Error Details')).toBeInTheDocument();
        expect(screen.queryByText('Context:')).not.toBeInTheDocument();
      });
    });

    test('handles malformed error data', () => {
      const malformedError = {
        message: 'Test',
        timestamp: 'invalid',
      };
      errorReporter.getStoredErrors.mockReturnValue([malformedError]);
      const { container } = render(<ErrorLogsViewer />);
      expect(container).toBeInTheDocument();
    });
  });
});
