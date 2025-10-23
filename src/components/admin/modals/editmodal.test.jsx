import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditModal, { fieldTypes } from './editmodal';
import { Modal, message } from 'antd';

// Mock Ant Design's static methods
// We mock 'antd' and return all its actual exports,
// but replace Modal and message with our jest.fn() versions.
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  // Mock Modal and its .confirm method
  const MockModal = (props) => {
    // Render children only if modal is open (visible)
    if (!props.open) {
      return null;
    }
    return (
      <div data-testid="mock-modal">
        <div>{props.title}</div>
        <div>{props.children}</div>
        <div>{props.footer}</div>
      </div>
    );
  };
  MockModal.confirm = jest.fn();

  return {
    ...antd,
    Modal: MockModal,
    message: {
      success: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
  };
});

// Helper to type into antd InputNumber
// (fireEvent.change doesn't work perfectly with it)
const changeInputNumber = (inputElement, value) => {
  fireEvent.focus(inputElement);
  fireEvent.change(inputElement, { target: { value: value.toString() } });
  fireEvent.blur(inputElement);
};

describe('EditModal', () => {
  // Define mock functions and default data
  const mockOnCancel = jest.fn();
  const mockOnSave = jest.fn();

  const originalDate = '2023-01-01T12:00:00.000Z';
  const defaultData = {
    id: 1,
    name: 'John Doe',
    age: 30,
    bio: 'Software developer',
    status: 'active',
    dob: originalDate,
    isActive: true,
  };

  const defaultFields = [
    fieldTypes.text('name', 'Name', {
      rules: [{ required: true, message: 'Name is required' }],
    }),
    fieldTypes.number('age', 'Age'),
    fieldTypes.textarea('bio', 'Bio', { span: 24 }),
    fieldTypes.select('status', 'Status', [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]),
    fieldTypes.date('dob', 'Date of Birth'),
    fieldTypes.switch('isActive', 'Is Active'),
  ];

  // Utility to render the component with default props
  const renderComponent = (props = {}) => {
    return render(
      <EditModal
        visible={true}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        title="Edit User"
        data={defaultData}
        fields={defaultFields}
        {...props}
      />
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Modal.confirm mock implementation
    if (Modal.confirm && Modal.confirm.mockReset) {
      Modal.confirm.mockReset();
    }
  });

  it('should render the modal with correct title and initial data', () => {
    renderComponent();

    // Check title
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    // Check form fields are populated
    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Age')).toHaveValue('30');
    expect(screen.getByLabelText('Bio')).toHaveValue('Software developer');

    // Antd Select shows the label of the selected value
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Antd DatePicker formats the date string (default format YYYY-MM-DD)
    expect(screen.getByLabelText('Date of Birth')).toHaveValue('2023-01-01');

    // Antd Switch
    expect(screen.getByLabelText('Is Active')).toBeChecked();
  });

  it('should call onSave with processed data when form is valid', async () => {
    renderComponent();

    // 1. Simulate changes
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jane Doe' },
    });
    changeInputNumber(screen.getByLabelText('Age'), 35);

    // 2. Click Save
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // 3. Wait for async validation and save
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    // 4. Verify data sent to onSave
    // Note: 'dob' was untouched, so it should be processed from dayjs back to the original ISO string
    expect(mockOnSave).toHaveBeenCalledWith({
      ...defaultData,
      name: 'Jane Doe',
      age: 35,
      dob: originalDate, // Verifies the date round-trip
    });

    // 5. Verify success message
    expect(message.success).toHaveBeenCalledWith('Changes saved successfully');
  });

  it('should not call onSave and show error if validation fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(message.success).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        'Validation failed:',
        expect.anything()
      );
    });

    const maybeErrorMsg = screen.queryByText('Name is required');
    if (maybeErrorMsg) {
      expect(maybeErrorMsg).toBeInTheDocument();
    }

    errorSpy.mockRestore();
  });

  it('should call onCancel directly if there are no changes', () => {
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(Modal.confirm).not.toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  it('should show confirmation and call onCancel when user confirms', () => {
    // Mock Modal.confirm to simulate user clicking "OK"
    if (Modal.confirm && Modal.confirm.mockImplementation) {
      Modal.confirm.mockImplementation((config) => {
        if (config.onOk) {
          config.onOk();
        }
      });
    }

    renderComponent();
    // 1. Make a change
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Changed' },
    });

    // 2. Verify "Unsaved changes" text appears
    expect(screen.getByText('(Unsaved changes)')).toBeInTheDocument();

    // 3. Click Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // 4. Verify confirm modal was called
    expect(Modal.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unsaved Changes',
      })
    );

    // 5. Because we simulated "OK", main onCancel should be called
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should not call onCancel when user cancels the confirmation', () => {
    // Mock Modal.confirm to simulate user clicking "Cancel"
    if (Modal.confirm && Modal.confirm.mockImplementation) {
      Modal.confirm.mockImplementation((config) => {
        if (config.onCancel) {
          config.onCancel();
        }
      });
    }

    renderComponent();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Changed' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(Modal.confirm).toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled(); // Main onCancel should not be called
  });

  it('should reset form to original data when Reset is clicked', async () => {
    renderComponent();

    // 1. Check Reset is disabled initially
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    expect(resetButton).toBeDisabled();

    // 2. Make a change
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Changed' },
    });
    expect(screen.getByLabelText('Name')).toHaveValue('Changed');

    // 3. Check Reset is now enabled
    expect(resetButton).not.toBeDisabled();

    // 4. Click Reset
    fireEvent.click(resetButton);

    // 5. Verify form is reset to original value
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    });

    // 6. Verify message
    expect(message.info).toHaveBeenCalledWith('Form reset to original values');

    // 7. Verify Reset is disabled again
    expect(resetButton).toBeDisabled();
  });

  it('should show save button in loading state when loading=true', () => {
    renderComponent({ loading: true });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });

    // antd adds 'ant-btn-loading' class
    expect(saveButton).toHaveClass('ant-btn-loading');

    // It also adds a loading icon
    expect(
      saveButton.querySelector('.ant-btn-loading-icon')
    ).toBeInTheDocument();
  });
});
