import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

// Mock antd minimal components to drive TableFilters logic
jest.mock('antd', () => {
  const React = require('react');

  const Card = ({ children, ...rest }) =>
    React.createElement('div', { 'data-testid': 'card', ...rest }, children);
  Card.displayName = 'MockAntdCard';

  // Form context to propagate onValuesChange and store
  const FormCtx = React.createContext(null);

  const Form = ({ children, onValuesChange, form }) => {
    const storeRef = React.useRef({});
    const ctx = { onValuesChange, storeRef, form };
    return React.createElement(FormCtx.Provider, { value: ctx }, children);
  };
  Form.displayName = 'MockAntdForm';
  Form.useForm = () => [
    {
      setFieldsValue: jest.fn(),
      resetFields: jest.fn(),
    },
  ];

  // REPLACE the previous inline Form.Item with a named component to satisfy hooks rule
  function MockFormItem({ name, label, children }) {
    const ctx = React.useContext(FormCtx);
    if (!children) return null;

    const child = React.Children.only(children);
    const handleChange = (e) => {
      const val = e && e.target !== undefined ? e.target.value : e;
      if (ctx) {
        ctx.storeRef.current = { ...ctx.storeRef.current, [name]: val };
        ctx.onValuesChange &&
          ctx.onValuesChange({ [name]: val }, ctx.storeRef.current);
      }
    };
    const injected = React.cloneElement(child, {
      ...child.props,
      onChange: handleChange,
    });

    return React.createElement(
      'div',
      { 'data-testid': `form-item-${name}` },
      label ? React.createElement('label', null, label) : null,
      injected
    );
  }
  MockFormItem.displayName = 'MockAntdFormItem';
  Form.Item = MockFormItem;

  // REPLACE Input with one that also exposes Group
  const Input = (props) =>
    React.createElement('input', {
      type: 'text',
      ...props,
      onChange: (e) => props.onChange && props.onChange(e),
    });
  Input.displayName = 'MockAntdInput';
  const MockInputGroup = ({ children, compact }) =>
    React.createElement(
      'div',
      { 'data-testid': 'input-group', 'data-compact': !!compact },
      children
    );
  MockInputGroup.displayName = 'MockAntdInputGroup';
  Input.Group = MockInputGroup;

  // ADD: Select with Option to support `const { Option } = Select`
  const Select = ({ children, onChange, ...rest }) =>
    React.createElement(
      'select',
      { ...rest, onChange: (e) => onChange && onChange(e.target.value) },
      children
    );
  Select.displayName = 'MockAntdSelect';
  const MockSelectOption = ({ children, value }) =>
    React.createElement('option', { value }, children);
  MockSelectOption.displayName = 'MockAntdSelectOption';
  Select.Option = MockSelectOption;

  // REPLACE DatePicker to also expose RangePicker via property
  const DatePicker = (props) =>
    React.createElement('input', {
      type: 'date',
      ...props,
      onChange: (e) => props.onChange && props.onChange(e),
    });
  DatePicker.displayName = 'MockAntdDatePicker';
  const RangePicker = (props) =>
    React.createElement('input', {
      type: 'text',
      placeholder: 'range',
      ...props,
      onChange: (e) => props.onChange && props.onChange(e),
    });
  RangePicker.displayName = 'MockAntdRangePicker';
  DatePicker.RangePicker = RangePicker;

  const InputNumber = (props) =>
    React.createElement('input', {
      type: 'number',
      ...props,
      onChange: (e) => props.onChange && props.onChange(Number(e.target.value)),
    });
  InputNumber.displayName = 'MockAntdInputNumber';

  const Switch = ({ checked, onChange, ...rest }) =>
    React.createElement('input', {
      type: 'checkbox',
      checked,
      ...rest,
      onChange: (e) => onChange && onChange(e.target.checked),
    });
  Switch.displayName = 'MockAntdSwitch';

  const Checkbox = (props) =>
    React.createElement('input', {
      type: 'checkbox',
      ...props,
      onChange: (e) => props.onChange && props.onChange(e),
    });
  Checkbox.displayName = 'MockAntdCheckbox';
  Checkbox.Group = ({ options = [], onChange }) =>
    React.createElement(
      'div',
      { 'data-testid': 'checkbox-group' },
      options.map((opt) =>
        React.createElement(
          'label',
          { key: opt.value },
          React.createElement('input', {
            type: 'checkbox',
            value: opt.value,
            onChange: () => onChange && onChange([opt.value]),
          }),
          opt.label
        )
      )
    );
  Checkbox.Group.displayName = 'MockAntdCheckboxGroup';

  const Button = ({ children, onClick, disabled, type }) =>
    React.createElement(
      'button',
      { onClick, disabled, 'data-type': type || 'default' },
      children
    );
  Button.displayName = 'MockAntdButton';

  const Space = ({ children }) =>
    React.createElement('div', { 'data-testid': 'space' }, children);
  Space.displayName = 'MockAntdSpace';

  const Row = ({ children }) =>
    React.createElement('div', { 'data-testid': 'row' }, children);
  Row.displayName = 'MockAntdRow';

  const Col = ({ children }) =>
    React.createElement('div', { 'data-testid': 'col' }, children);
  Col.displayName = 'MockAntdCol';

  const Divider = (props) => React.createElement('hr', props);
  Divider.displayName = 'MockAntdDivider';

  const Tag = ({ children, closable, onClose }) =>
    React.createElement(
      'div',
      { 'data-testid': 'tag' },
      children,
      closable
        ? React.createElement(
            'button',
            {
              'aria-label': 'close',
              onClick: (e) => {
                e.stopPropagation();
                onClose && onClose(e),
                  // prevent React warning in tests
                  typeof e.preventDefault === 'function' && e.preventDefault();
              },
            },
            'close'
          )
        : null
    );
  Tag.displayName = 'MockAntdTag';

  const Collapse = ({ children, activeKey, onChange }) =>
    React.createElement(
      'div',
      { 'data-testid': 'collapse' },
      React.createElement(
        'button',
        {
          'data-testid': 'toggle-advanced',
          onClick: () => {
            const opened = activeKey && activeKey.length > 0;
            onChange && onChange(opened ? [] : ['advanced']);
          },
        },
        'toggle'
      ),
      children
    );
  Collapse.displayName = 'MockAntdCollapse';
  Collapse.Panel = ({ header, children }) =>
    React.createElement('div', { 'data-testid': 'panel' }, header, children);
  Collapse.Panel.displayName = 'MockAntdCollapsePanel';

  return {
    Card,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Space,
    Row,
    Col,
    Collapse,
    Tag,
    Divider,
    InputNumber,
    Switch,
    Checkbox,
  };
});

// Under test
import TableFilters from '../tablefilters';

describe('TableFilters', () => {
  const filters = [
    {
      key: 'search',
      label: 'Search',
      type: 'search',
      placeholder: 'Search...',
      quickFilter: true,
      span: 8,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      span: 6,
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      span: 6,
    },
  ];

  test('renders quick/advanced sections and typing in quick filter calls onFiltersChange', () => {
    const onFiltersChange = jest.fn();

    render(
      React.createElement(TableFilters, {
        filters,
        onFiltersChange,
        showAdvanced: true,
        showQuickFilters: true,
      })
    );

    // Advanced header visible
    expect(screen.getByText(/Advanced Filters/i)).toBeInTheDocument();

    // Type in quick search input
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Alice' } });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Alice' })
    );
  });

  test('initialValues render active tags and closing one updates filters', async () => {
    const onFiltersChange = jest.fn();
    const initialValues = { status: 'active', date: '2024-05-01' };

    render(
      React.createElement(TableFilters, {
        filters,
        onFiltersChange,
        initialValues,
      })
    );

    // Tags are set after a timeout in effect
    await waitFor(() => {
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    // Close the "Status: Active" tag
    const tagNode = screen
      .getByText('Status: Active')
      .closest('[data-testid="tag"]');
    expect(tagNode).toBeTruthy();
    const closeBtn = within(tagNode).getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    // onFiltersChange called with status removed
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.not.objectContaining({ status: expect.anything() })
    );
  });

  test('Reset button clears all active filters and invokes callbacks', async () => {
    const onFiltersChange = jest.fn();
    const onReset = jest.fn();

    render(
      React.createElement(TableFilters, {
        filters,
        onFiltersChange,
        onReset,
        initialValues: { status: 'active' },
      })
    );

    // Wait active tag present so buttons become enabled
    await waitFor(() => {
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    expect(resetBtn).not.toBeDisabled();

    fireEvent.click(resetBtn);

    expect(onReset).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenLastCalledWith({});
    // Tag removed
    await waitFor(() => {
      expect(screen.queryByText('Status: Active')).not.toBeInTheDocument();
    });
  });

  test('Advanced header shows active count tag when filters active', async () => {
    render(
      React.createElement(TableFilters, {
        filters,
        initialValues: { status: 'active', search: 'x' },
      })
    );

    // Wait for effect to set active filters
    await waitFor(() => {
      // Expect "2 active" string shown in header area
      expect(screen.getByText(/2 active/i)).toBeInTheDocument();
    });
  });
});
