import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';

// Mock antd minimal components + message
jest.mock('antd', () => {
  const React = require('react');

  const message = {
    success: jest.fn(),
    error: jest.fn(),
  };

  // Modal: expose ok/cancel triggers
  const Modal = ({ title, open, onOk, onCancel, children }) =>
    React.createElement(
      'div',
      { 'data-testid': 'modal', 'data-open': !!open },
      React.createElement('div', { 'data-testid': 'modal-title' }, title),
      React.createElement(
        'button',
        { 'data-testid': 'ok-btn', onClick: () => onOk && onOk() },
        'OK'
      ),
      React.createElement(
        'button',
        { 'data-testid': 'cancel-btn', onClick: () => onCancel && onCancel() },
        'Cancel'
      ),
      React.createElement('div', { 'data-testid': 'modal-body' }, children)
    );
  Modal.displayName = 'MockAntdModal';

  // Form context + useForm
  const FormCtx = React.createContext(null);

  const createForm = () => {
    const api = {};
    api.__storeRef = null;
    api._getValues = () => (api.__storeRef ? api.__storeRef.current : {});
    api.setFieldsValue = (vals) => {
      const v = api._getValues();
      Object.assign(v, vals);
    };
    api.resetFields = () => {
      if (api.__storeRef) api.__storeRef.current = {};
    };
    api.validateFields = () => Promise.resolve(api._getValues());
    return api;
  };

  const Form = ({ form, children, initialValues }) => {
    const storeRef = React.useRef({});

    storeRef.current = { ...(initialValues || {}) };
    if (form) form.__storeRef = storeRef;
    return React.createElement(
      FormCtx.Provider,
      { value: { storeRef } },
      children
    );
  };
  Form.displayName = 'MockAntdForm';
  Form.useForm = () => [createForm()];

  // Replace inline Form.Item with named component to satisfy hooks rule
  function MockFormItem({ name, children }) {
    const ctx = React.useContext(FormCtx);
    if (!children) return null;
    const child = React.Children.only(children);
    const handleChange = (e) => {
      let val = e;
      if (e && e.target !== undefined) {
        val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      }
      ctx.storeRef.current = { ...ctx.storeRef.current, [name]: val };
    };
    return React.createElement(
      'div',
      { 'data-testid': `form-item-${name}` },
      React.cloneElement(child, { onChange: handleChange })
    );
  }
  MockFormItem.displayName = 'MockAntdFormItem';
  Form.Item = MockFormItem;

  // Input + TextArea
  const Input = (props) =>
    React.createElement('input', { type: 'text', ...props });
  Input.displayName = 'MockAntdInput';
  Input.TextArea = (props) => React.createElement('textarea', props);
  Input.TextArea.displayName = 'MockAntdTextArea';

  // Select (supports mode="multiple")
  const Select = ({ children, onChange, mode }) => {
    const isMultiple = mode === 'multiple';
    const handleChange = (e) => {
      if (isMultiple) {
        const selected = Array.from(e.target.selectedOptions).map(
          (o) => o.value
        );
        onChange && onChange(selected);
      } else {
        onChange && onChange(e.target.value);
      }
    };
    return React.createElement(
      'select',
      {
        'data-testid': isMultiple ? 'select-multiple' : 'select',
        multiple: isMultiple,
        onChange: handleChange,
      },
      children
    );
  };
  Select.displayName = 'MockAntdSelect';
  const Option = ({ value, children }) =>
    React.createElement('option', { value }, children);
  Option.displayName = 'MockAntdOption';

  Select.Option = Option;

  // DatePicker -> click to set fixed date
  const DatePicker = (props) =>
    React.createElement(
      'button',
      {
        'data-testid': 'date-picker',
        onClick: () =>
          props.onChange &&
          props.onChange(new Date('2025-01-01T00:00:00.000Z')),
      },
      'pick-date'
    );
  DatePicker.displayName = 'MockAntdDatePicker';

  // Checkbox
  const Checkbox = (props) =>
    React.createElement('input', {
      type: 'checkbox',
      checked: !!props.checked,
      onChange: (e) => props.onChange && props.onChange(e),
    });
  Checkbox.displayName = 'MockAntdCheckbox';

  const Space = ({ children }) => React.createElement('div', null, children);
  Space.displayName = 'MockAntdSpace';

  const Typography = {
    Text: ({ children }) => React.createElement('span', null, children),
  };
  Typography.Text.displayName = 'MockAntdTypographyText';

  return {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Checkbox,
    Space,
    Typography,
    message,
    Option,
  };
});

// Mock icons
jest.mock('@ant-design/icons', () => {
  const React = require('react');
  const Mk = (id) => {
    function Icon() {
      return React.createElement('span', { 'data-testid': id });
    }
    Icon.displayName = `MockIcon(${id})`;
    return Icon;
  };
  return {
    ExclamationCircleOutlined: Mk('exclamation-icon'),
    ClockCircleOutlined: Mk('clock-icon'),
  };
});

import SuspendUserModal from './suspendusermodal';

describe('SuspendUserModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null when user is not provided', () => {
    const { container } = render(
      React.createElement(SuspendUserModal, {
        visible: true,
        onCancel: jest.fn(),
        onConfirm: jest.fn(),
        user: null,
      })
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders with title containing username and cancel works', () => {
    const onCancel = jest.fn();
    const user = { id: 'u1', username: 'alice' };

    render(
      React.createElement(SuspendUserModal, {
        visible: true,
        onCancel,
        onConfirm: jest.fn(),
        user,
      })
    );

    expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText(/Suspend User: alice/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('submits temporary suspension with picked expiresAt and shows success', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const user = { id: 'u2', username: 'bob' };

    render(
      React.createElement(SuspendUserModal, {
        visible: true,
        onCancel: jest.fn(),
        onConfirm,
        user,
      })
    );

    // Set reason (required) and publicReason/adminNotes
    const reasonSelect = within(
      screen.getByTestId('form-item-reason')
    ).getByTestId('select');
    fireEvent.change(reasonSelect, { target: { value: 'other' } });

    const publicReason = screen
      .getByTestId('form-item-publicReason')
      .querySelector('textarea');
    fireEvent.change(publicReason, { target: { value: 'Public message' } });

    const adminNotes = screen
      .getByTestId('form-item-adminNotes')
      .querySelector('textarea');
    fireEvent.change(adminNotes, { target: { value: 'Internal note' } });

    // Pick date for expiresAt
    fireEvent.click(screen.getByTestId('date-picker'));

    // Submit
    fireEvent.click(screen.getByTestId('ok-btn'));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u2',
          username: 'bob',
          suspensionType: 'temporary',
          expiresAt: '2025-01-01T00:00:00.000Z',
          publicReason: 'Public message',
          adminNotes: 'Internal note',
        })
      )
    );

    const { message } = require('antd');
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith(
        'User bob has been suspended successfully'
      );
    });
  });

  test('switching to indefinite removes expiresAt and submits with null', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const user = { id: 'u3', username: 'carol' };

    render(
      React.createElement(SuspendUserModal, {
        visible: true,
        onCancel: jest.fn(),
        onConfirm,
        user,
      })
    );

    // Change suspensionType to 'indefinite'
    const typeSelect = within(
      screen.getByTestId('form-item-suspensionType')
    ).getByTestId('select');
    fireEvent.change(typeSelect, { target: { value: 'indefinite' } });

    // No date picking needed now; submit
    fireEvent.click(screen.getByTestId('ok-btn'));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u3',
          username: 'carol',
          suspensionType: 'indefinite',
          expiresAt: null,
        })
      )
    );

    const { message } = require('antd');
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith(
        'User carol has been suspended successfully'
      );
    });
  });
});
