import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

// Mock antd minimal components used by ReportActionModal
jest.mock('antd', () => {
  const React = require('react');

  const message = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const Modal = ({ title, open, onOk, onCancel, children, width }) =>
    React.createElement(
      'div',
      { 'data-testid': 'modal', 'data-open': !!open, 'data-width': width },
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

  // Form context + simple useForm
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

  const Form = ({ form, children, initialValues, onValuesChange }) => {
    const storeRef = React.useRef({});
    storeRef.current = { ...(initialValues || {}) };
    if (form) form.__storeRef = storeRef;

    return React.createElement(
      FormCtx.Provider,
      { value: { storeRef, onValuesChange } },
      children
    );
  };
  Form.displayName = 'MockAntdForm';
  Form.useForm = () => [createForm()];

  function MockFormItem({ name, children }) {
    const ctx = React.useContext(FormCtx);
    if (!children) return null;
    const child = React.Children.only(children);
    const handleChange = (e) => {
      let val = e;
      if (e && e.target !== undefined) val = e.target.value;

      ctx.storeRef.current = { ...ctx.storeRef.current, [name]: val };

      ctx.onValuesChange &&
        ctx.onValuesChange({ [name]: val }, ctx.storeRef.current);
    };
    return React.createElement(
      'div',
      { 'data-testid': `form-item-${name}` },
      React.cloneElement(child, { onChange: handleChange })
    );
  }
  MockFormItem.displayName = 'MockAntdFormItem';
  Form.Item = MockFormItem;

  const Input = (props) =>
    React.createElement('input', { type: 'text', ...props });
  Input.displayName = 'MockAntdInput';
  Input.TextArea = (props) => React.createElement('textarea', props);
  Input.TextArea.displayName = 'MockAntdTextArea';

  const Select = ({ children, onChange, placeholder }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'select',
        onChange: (e) => onChange && onChange(e.target.value),
        'aria-label': placeholder || 'select',
      },
      children
    );
  Select.displayName = 'MockAntdSelect';
  const Option = ({ value, children }) =>
    React.createElement('option', { value }, children);
  Option.displayName = 'MockAntdOption';
  Select.Option = Option;

  const Space = ({ children }) =>
    React.createElement('div', { 'data-testid': 'space' }, children);
  Space.displayName = 'MockAntdSpace';

  const Typography = {
    Text: ({ children }) =>
      React.createElement('span', { 'data-testid': 'text' }, children),
    Paragraph: ({ children }) =>
      React.createElement('p', { 'data-testid': 'paragraph' }, children),
  };
  Typography.Text.displayName = 'MockAntdTypographyText';
  Typography.Paragraph.displayName = 'MockAntdTypographyParagraph';

  const Card = ({ children }) =>
    React.createElement('div', { 'data-testid': 'card' }, children);
  Card.displayName = 'MockAntdCard';

  const Tag = ({ children }) =>
    React.createElement('span', { 'data-testid': 'tag' }, children);
  Tag.displayName = 'MockAntdTag';

  const Divider = ({ children }) =>
    React.createElement('div', { 'data-testid': 'divider' }, children);
  Divider.displayName = 'MockAntdDivider';

  return {
    Modal,
    Form,
    Input,
    Select,
    Space,
    Typography,
    Card,
    Tag,
    Divider,
    message,
  };
});

// Mock icons without JSX
jest.mock('@ant-design/icons', () => {
  const React = require('react');
  const mk = (id) => {
    function Icon() {
      return React.createElement('span', { 'data-testid': id });
    }
    Icon.displayName = `MockIcon(${id})`;
    return Icon;
  };
  return {
    FlagOutlined: mk('flag-icon'),
    UserOutlined: mk('user-icon'),
    CloseOutlined: mk('close-icon'),
    ExclamationCircleOutlined: mk('exclamation-icon'),
    EyeOutlined: mk('eye-icon'),
  };
});

import ReportActionModal from './reportactionmodal';

describe('ReportActionModal', () => {
  const baseReport = {
    id: 101,
    type: 'spam',
    priority: 'high',
    reportedBy: 'alice',
    reportedUser: 'bob',
    reason: 'Spam content',
    evidence: 'link-to-evidence',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and cancel works', () => {
    const onCancel = jest.fn();

    render(
      React.createElement(ReportActionModal, {
        visible: true,
        onCancel,
        onResolve: jest.fn(),
        report: baseReport,
      })
    );

    expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText(/Resolve Report #101/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('selecting action=dismiss hides contentAction and userAction fields', () => {
    render(
      React.createElement(ReportActionModal, {
        visible: true,
        onCancel: jest.fn(),
        onResolve: jest.fn(),
        report: baseReport,
      })
    );

    // Set action to dismiss
    const actionSelect = within(
      screen.getByTestId('form-item-action')
    ).getByTestId('select');
    fireEvent.change(actionSelect, { target: { value: 'dismiss' } });

    // Dependent fields should not exist
    expect(screen.queryByTestId('form-item-contentAction')).toBeNull();
    expect(screen.queryByTestId('form-item-userAction')).toBeNull();
  });
});
