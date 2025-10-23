import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmDialog, {
  useConfirmDialog,
  confirmDialogs,
} from './confirmdialog';
import { Modal } from 'antd';

// --- Mocks ---

// Mock Ant Design's Modal component
jest.mock('antd', () => {
  // 1. Get all the actual exports from 'antd'
  const antd = jest.requireActual('antd');

  // 2. Create a mock Modal component
  // This renders the children and footer buttons so we can interact with them
  const MockModal = (props) => {
    if (!props.open) {
      return null;
    }
    return (
      <div data-testid="mock-modal">
        <div>{props.title}</div>
        <div>{props.children}</div>
        {/* Render mock buttons to test clicks and props */}
        <button onClick={props.onCancel}>{props.cancelText || 'Cancel'}</button>
        <button
          onClick={props.onOk}
          // Pass props for testing button state
          data-danger={props.okButtonProps?.danger}
          data-type={props.okButtonProps?.type}
          className={props.confirmLoading ? 'ant-btn-loading' : ''}
        >
          {props.okText || 'OK'}
        </button>
      </div>
    );
  };

  // 3. Mock the static Modal.confirm method
  MockModal.confirm = jest.fn();

  // 4. Return all original antd exports, but with our mocked Modal
  return {
    ...antd,
    Modal: MockModal,
  };
});

// Mock Ant Design Icons
// We just render a test-id for each icon to verify it's been selected
jest.mock('@ant-design/icons', () => ({
  ExclamationCircleOutlined: () => <span data-testid="icon-exclamation" />,
  InfoCircleOutlined: () => <span data-testid="icon-info" />,
  CheckCircleOutlined: () => <span data-testid="icon-check" />,
  CloseCircleOutlined: () => <span data-testid="icon-close" />,
  QuestionCircleOutlined: () => <span data-testid="icon-question" />,
}));

// --- Test Suite ---

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    visible: true,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    title: 'Test Title',
    content: 'Test content message.',
    confirmText: 'Go',
    cancelText: 'Stop',
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to render the component with default props
  const renderComponent = (props = {}) => {
    return render(<ConfirmDialog {...defaultProps} {...props} />);
  };

  it('should render title, content, and custom button text', () => {
    renderComponent();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content message.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when the cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should show loading state on the confirm button', () => {
    renderComponent({ loading: true });
    const confirmButton = screen.getByRole('button', { name: 'Go' });
    // Our mock adds this class when confirmLoading is true
    expect(confirmButton).toHaveClass('ant-btn-loading');
  });

  it('should render details text when provided', () => {
    renderComponent({ details: 'This is extra detail.' });
    expect(screen.getByText('This is extra detail.')).toBeInTheDocument();
  });

  it('should render a custom icon if provided', () => {
    const customIcon = <span data-testid="custom-icon" />;
    renderComponent({ icon: customIcon });

    // Verify the custom icon is present
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();

    // Verify default icons are NOT present
    expect(screen.queryByTestId('icon-exclamation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-info')).not.toBeInTheDocument();
  });

  // Test the 'type' prop and its effect on the default icon
  describe('icon based on type', () => {
    it('should render warning icon by default', () => {
      renderComponent(); // type='warning' is default
      expect(screen.getByTestId('icon-exclamation')).toBeInTheDocument();
    });

    it('should render info icon for type="info"', () => {
      renderComponent({ type: 'info' });
      expect(screen.getByTestId('icon-info')).toBeInTheDocument();
    });

    it('should render success icon for type="success"', () => {
      renderComponent({ type: 'success' });
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });

    it('should render error icon for type="error"', () => {
      renderComponent({ type: 'error' });
      expect(screen.getByTestId('icon-close')).toBeInTheDocument();
    });

    it('should render question icon for type="question"', () => {
      renderComponent({ type: 'question' });
      expect(screen.getByTestId('icon-question')).toBeInTheDocument();
    });
  });

  // Test the logic for okButtonProps
  describe('confirm button styling', () => {
    it('should have danger=true if danger prop is set', () => {
      renderComponent({ danger: true });
      const confirmButton = screen.getByRole('button', { name: 'Go' });
      // Our mock sets this data attribute
      expect(confirmButton).toHaveAttribute('data-danger', 'true');
    });

    it('should have danger=true if type is "error"', () => {
      renderComponent({ type: 'error' });
      const confirmButton = screen.getByRole('button', { name: 'Go' });
      expect(confirmButton).toHaveAttribute('data-danger', 'true');
    });

    it('should have type="primary" if type is "success"', () => {
      renderComponent({ type: 'success' });
      const confirmButton = screen.getByRole('button', { name: 'Go' });
      expect(confirmButton).toHaveAttribute('data-type', 'primary');
    });

    it('should have no special type or danger by default', () => {
      renderComponent(); // type='warning'
      const confirmButton = screen.getByRole('button', { name: 'Go' });
      expect(confirmButton).not.toHaveAttribute('data-danger', 'true');
      expect(confirmButton).not.toHaveAttribute('data-type', 'primary');
    });
  });
});

// Test the exported hook 'useConfirmDialog'
describe('useConfirmDialog', () => {
  // A simple component to test the hook
  const TestHookComponent = () => {
    const { confirm } = useConfirmDialog();
    const [result, setResult] = useState(null);

    const showConfirm = async () => {
      const confirmed = await confirm({
        title: 'Hook Test',
        content: 'Did it work?',
        danger: true,
      });
      setResult(confirmed);
    };

    return (
      <div>
        <button onClick={showConfirm}>Show Confirm</button>
        {result !== null && <span data-testid="result">{String(result)}</span>}
      </div>
    );
  };

  beforeEach(() => {
    // Reset the mock implementation before each test
    Modal.confirm.mockReset();
  });

  it('should call Modal.confirm with correct config and resolve true onOk', async () => {
    // Mock Modal.confirm to automatically call 'onOk'
    Modal.confirm.mockImplementation((config) => {
      config.onOk(); // Simulate user clicking OK
    });

    render(<TestHookComponent />);

    fireEvent.click(screen.getByRole('button', { name: 'Show Confirm' }));

    // Wait for the promise to resolve and update state
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('true');
    });

    // Verify Modal.confirm was called with the correct parameters
    expect(Modal.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Hook Test',
        content: 'Did it work?',
        okButtonProps: { danger: true },
      })
    );
  });

  it('should resolve false onCancel', async () => {
    // Plain JavaScript
    Modal.confirm.mockImplementation((config) => {
      config.onCancel();
    });

    render(<TestHookComponent />);

    fireEvent.click(screen.getByRole('button', { name: 'Show Confirm' }));

    // Wait for the promise to resolve and update state
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('false');
    });

    expect(Modal.confirm).toHaveBeenCalled();
  });
});

// Test the exported 'confirmDialogs' config object
describe('confirmDialogs', () => {
  it('delete() should return correct config', () => {
    const config = confirmDialogs.delete('MyItem');
    expect(config.title).toBe('Delete Confirmation');
    expect(config.content).toContain('"MyItem"');
    expect(config.type).toBe('error');
    expect(config.danger).toBe(true);
    expect(config.confirmText).toBe('Delete');
  });

  it('approve() should return correct config', () => {
    const config = confirmDialogs.approve('MyDoc');
    expect(config.title).toBe('Approve Content');
    expect(config.content).toContain('"MyDoc"');
    expect(config.type).toBe('success');
    expect(config.confirmText).toBe('Approve');
  });

  it('reject() should return correct config', () => {
    const config = confirmDialogs.reject('MyDoc');
    expect(config.title).toBe('Reject Content');
    expect(config.content).toContain('"MyDoc"');
    expect(config.type).toBe('warning');
    expect(config.confirmText).toBe('Reject');
  });

  it('publish() should return correct config', () => {
    const config = confirmDialogs.publish('MyArticle');
    expect(config.title).toBe('Publish Content');
    expect(config.content).toContain('"MyArticle"');
    expect(config.type).toBe('info');
    expect(config.confirmText).toBe('Publish');
  });

  it('suspend() should return correct config', () => {
    const config = confirmDialogs.suspend('BadUser');
    expect(config.title).toBe('Suspend User');
    expect(config.content).toContain('"BadUser"');
    expect(config.type).toBe('warning');
    expect(config.confirmText).toBe('Suspend');
  });
});
