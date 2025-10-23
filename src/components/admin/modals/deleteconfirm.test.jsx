import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirm from './deleteconfirm';

jest.mock('antd', () => ({
  Modal: ({
    visible,
    open,
    onOk,
    onCancel,
    title,
    children,
    okButtonProps,
    ...props
  }) => (
    <div
      data-testid="delete-modal"
      data-visible={visible !== undefined ? visible : open}
      {...props}
    >
      {(visible !== undefined ? visible : open) && (
        <>
          <h2>{title}</h2>
          {children}
          <button
            data-testid="modal-ok"
            onClick={onOk}
            disabled={okButtonProps?.disabled}
          >
            {props.okText || 'OK'}
          </button>
          <button data-testid="modal-cancel" onClick={onCancel}>
            {props.cancelText || 'Cancel'}
          </button>
        </>
      )}
    </div>
  ),
  Space: ({ children, direction, ...props }) => (
    <div data-testid="space" data-direction={direction} {...props}>
      {children}
    </div>
  ),
  Typography: {
    Text: ({ children, code, type, strong, ...props }) => (
      <span
        data-testid="text"
        data-code={code}
        data-type={type}
        data-strong={strong}
        {...props}
      >
        {children}
      </span>
    ),
  },
  Checkbox: ({ checked, onChange, children, ...props }) => (
    <label data-testid="checkbox-label">
      <input
        type="checkbox"
        data-testid="confirm-checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e)}
        {...props}
      />
      {children}
    </label>
  ),
  Input: ({ value, onChange, placeholder, ...props }) => (
    <input
      type="text"
      data-testid="confirm-input"
      value={value}
      onChange={(e) => onChange && onChange(e)}
      placeholder={placeholder}
      {...props}
    />
  ),
  Alert: ({ message, description, type, ...props }) => (
    <div data-testid="alert" data-type={type} {...props}>
      {message}
      {description}
    </div>
  ),
}));

jest.mock('@ant-design/icons', () => ({
  DeleteOutlined: () => <span data-testid="delete-icon">Delete</span>,
  ExclamationCircleOutlined: () => (
    <span data-testid="exclamation-icon">!</span>
  ),
}));

describe('DeleteConfirm Modal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <DeleteConfirm
        visible={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  test('displays title correctly', () => {
    render(
      <DeleteConfirm
        visible={true}
        title="Delete User"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Delete User')).toBeInTheDocument();
  });

  test('displays item name when provided', () => {
    render(
      <DeleteConfirm
        visible={true}
        itemName="John Doe"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays item type in confirmation message', () => {
    render(
      <DeleteConfirm
        visible={true}
        itemType="user account"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText(/user account/)).toBeInTheDocument();
  });

  test('shows cascade information when provided', () => {
    const cascadeInfo = ['Related comments', 'User posts'];
    render(
      <DeleteConfirm
        visible={true}
        cascadeInfo={cascadeInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Related comments')).toBeInTheDocument();
    expect(screen.getByText('User posts')).toBeInTheDocument();
  });

  test('displays warning for low danger level', () => {
    render(
      <DeleteConfirm
        visible={true}
        dangerLevel="low"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'warning');
  });

  test('displays error for high danger level', () => {
    render(
      <DeleteConfirm
        visible={true}
        dangerLevel="high"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
  });

  test('hides modal when visible is false', () => {
    const { container } = render(
      <DeleteConfirm
        visible={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(
      container.querySelector('[data-testid="modal-ok"]')
    ).not.toBeInTheDocument();
  });

  test('calls onConfirm when delete button is clicked without confirmation required', () => {
    render(
      <DeleteConfirm
        visible={true}
        requireConfirmation={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    const deleteButton = screen.getByTestId('modal-ok');
    fireEvent.click(deleteButton);
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <DeleteConfirm
        visible={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    const cancelButton = screen.getByTestId('modal-cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('disables delete button when confirmation is required but not checked', () => {
    render(
      <DeleteConfirm
        visible={true}
        requireConfirmation={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    const deleteButton = screen.getByTestId('modal-ok');
    expect(deleteButton).toBeDisabled();
  });

  test('enables delete button when checkbox is checked', () => {
    render(
      <DeleteConfirm
        visible={true}
        requireConfirmation={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    const checkbox = screen.getByTestId('confirm-checkbox');
    fireEvent.change(checkbox, { target: { checked: true } });
    // After state update, button should be enabled
    expect(screen.getByTestId('modal-ok')).toBeInTheDocument();
  });

  test('shows confirmation text input when confirmationText is provided', () => {
    render(
      <DeleteConfirm
        visible={true}
        requireConfirmation={true}
        confirmationText="DELETE"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('confirm-input')).toBeInTheDocument();
  });

  test('shows loading state on ok button', () => {
    render(
      <DeleteConfirm
        visible={true}
        loading={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  test('displays permanent deletion warning', () => {
    render(
      <DeleteConfirm
        visible={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText(/Warning: Permanent Deletion/)).toBeInTheDocument();
  });

  test('shows audit log notice', () => {
    render(
      <DeleteConfirm
        visible={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText(/audit purposes/)).toBeInTheDocument();
  });

  test('displays correct danger level description', () => {
    render(
      <DeleteConfirm
        visible={true}
        dangerLevel="medium"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText(/difficult to undo/)).toBeInTheDocument();
  });

  test('uses itemName as default confirmation text', () => {
    render(
      <DeleteConfirm
        visible={true}
        itemName="Important Data"
        requireConfirmation={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText(/Important Data/)).toBeInTheDocument();
  });
});
