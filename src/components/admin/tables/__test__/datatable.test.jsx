import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock helpers
const mockUseBulkActions = jest.fn();
const mockUseColumnSelector = jest.fn();

jest.mock('antd', () => {
  const React = require('react');
  const Table = (props) => {
    // capture last props for assertions
    globalThis.__lastTableProps = props;
    return React.createElement(
      'div',
      { 'data-testid': 'mock-table' },
      React.createElement(
        'button',
        {
          'data-testid': 'trigger-onchange',
          onClick: () =>
            props.onChange &&
            props.onChange(
              { current: 2, pageSize: 20 },
              { status: ['active'] },
              { field: 'name', order: 'ascend' }
            ),
        },
        'trigger-onchange'
      )
    );
  };
  Table.displayName = 'MockAntdTable';

  const Space = ({ children }) =>
    React.createElement('div', { 'data-testid': 'mock-space' }, children);
  Space.displayName = 'MockAntdSpace';

  const Card = ({ children }) =>
    React.createElement('div', { 'data-testid': 'mock-card' }, children);
  Card.displayName = 'MockAntdCard';

  const Divider = (props) => React.createElement('hr', props);
  Divider.displayName = 'MockAntdDivider';

  const Typography = {
    Text: ({ children, ...rest }) =>
      React.createElement('span', rest, children),
  };
  Typography.Text.displayName = 'MockAntdTypographyText';

  return { Table, Space, Card, Divider, Typography };
});

jest.mock('../bulkactions', () => {
  const React = require('react');
  function MockBulkActions(props) {
    return React.createElement(
      'button',
      {
        'data-testid': 'bulk-actions-btn',
        onClick: () =>
          props.onAction &&
          props.onAction('approve', props.selectedRowKeys, props.selectedRows),
      },
      'BulkActions'
    );
  }
  MockBulkActions.displayName = 'MockBulkActions';

  return {
    __esModule: true,
    default: MockBulkActions,
    useBulkActions: (...args) => mockUseBulkActions(...args),
  };
});

jest.mock('../columnselector', () => {
  const React = require('react');
  function MockColumnSelector() {
    return React.createElement(
      'div',
      { 'data-testid': 'column-selector-default' },
      'CS'
    );
  }
  MockColumnSelector.displayName = 'MockColumnSelector';

  return {
    __esModule: true,
    useColumnSelector: (...args) => mockUseColumnSelector(...args),
    default: MockColumnSelector,
  };
});

jest.mock('../exportbutton', () => {
  const React = require('react');
  function MockExportButton() {
    return React.createElement(
      'button',
      { 'data-testid': 'export-btn' },
      'Export'
    );
  }
  MockExportButton.displayName = 'MockExportButton';

  return { __esModule: true, default: MockExportButton };
});

jest.mock('../tablefilters', () => {
  const React = require('react');
  function MockTableFilters(props) {
    return React.createElement(
      'button',
      {
        'data-testid': 'filters',
        onClick: () => props.onChange && props.onChange({ status: 'active' }),
      },
      'Filters'
    );
  }
  MockTableFilters.displayName = 'MockTableFilters';

  return { __esModule: true, default: MockTableFilters };
});

import DataTable, { CardDataTable, tablePresets } from '../datatable';

describe('DataTable', () => {
  const baseColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
  ];
  const dataSource = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  beforeEach(() => {
    globalThis.__lastTableProps = undefined;
    jest.clearAllMocks?.();

    mockUseBulkActions.mockReturnValue({
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {},
      clearSelection: jest.fn(),
    });

    mockUseColumnSelector.mockImplementation((cols) => ({
      getVisibleColumns: () => cols,
      ColumnSelector: () =>
        React.createElement('div', { 'data-testid': 'column-selector' }, 'CS'),
    }));
  });

  test('uses getVisibleColumns when enableColumnSelector = true and renders ColumnSelector', () => {
    const visible = [baseColumns[0]]; // only ID
    mockUseColumnSelector.mockImplementation(() => ({
      getVisibleColumns: () => visible,
      ColumnSelector: () =>
        React.createElement('div', { 'data-testid': 'column-selector' }, 'CS'),
    }));

    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableColumnSelector: true,
      })
    );

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    expect(globalThis.__lastTableProps.columns).toEqual(visible);
    expect(screen.getByTestId('column-selector')).toBeInTheDocument();
  });

  test('uses raw columns when enableColumnSelector = false and hides ColumnSelector', () => {
    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableColumnSelector: false,
      })
    );

    expect(globalThis.__lastTableProps.columns).toEqual(baseColumns);
    expect(screen.queryByTestId('column-selector')).not.toBeInTheDocument();
  });

  test('forwards Table onChange to props.onChange', () => {
    const onChange = jest.fn();

    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        onChange,
      })
    );

    fireEvent.click(screen.getByTestId('trigger-onchange'));
    expect(onChange).toHaveBeenCalledWith(
      { current: 2, pageSize: 20 },
      { status: ['active'] },
      { field: 'name', order: 'ascend' }
    );
  });

  test('renders ExportButton when enableExport = true and hides when false', () => {
    const { rerender } = render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableExport: true,
      })
    );
    expect(screen.getByTestId('export-btn')).toBeInTheDocument();

    rerender(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableExport: false,
      })
    );
    expect(screen.queryByTestId('export-btn')).not.toBeInTheDocument();
  });

  test('renders filters when enableFilters = true and calls onFilterChange', () => {
    const onFilterChange = jest.fn();

    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableFilters: true,
        filters: [{ key: 'status', label: 'Status' }],
        onFilterChange,
      })
    );

    const filtersBtn = screen.getByTestId('filters');
    fireEvent.click(filtersBtn);
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'active' });
  });

  test('applies enhanced pagination to Table props', () => {
    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        pagination: { pageSize: 5 },
      })
    );

    const p = globalThis.__lastTableProps.pagination;
    expect(p.showSizeChanger).toBe(true);
    expect(p.showQuickJumper).toBe(true);
    expect(typeof p.showTotal).toBe('function');
    expect(p.pageSize).toBe(5);
  });

  test('adds rowSelection when enableSelection = true', () => {
    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableSelection: true,
      })
    );

    const rs = globalThis.__lastTableProps.rowSelection;
    expect(rs).toBeTruthy();
    expect(typeof rs.getCheckboxProps).toBe('function');

    const props = rs.getCheckboxProps({ disabled: true, name: 'x' });
    expect(props).toEqual({ disabled: true, name: 'x' });
  });

  test('CardDataTable composes Card and DataTable', () => {
    render(
      React.createElement(CardDataTable, {
        dataSource,
        columns: baseColumns,
        cardProps: { 'data-testid': 'card-props' },
      })
    );

    expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  test('hides header when nothing to show', () => {
    // No title/extra, no selection, no column selector, no export
    render(
      React.createElement(DataTable, {
        dataSource,
        columns: baseColumns,
        enableSelection: true,
        enableColumnSelector: false,
        enableExport: false,
      })
    );

    // Ensure only table is visible, no extra header controls
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    expect(screen.queryByTestId('export-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('column-selector')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-actions-btn')).not.toBeInTheDocument();
  });

  test('tablePresets exposes expected presets', () => {
    expect(tablePresets.default).toBeTruthy();
    expect(tablePresets.compact).toBeTruthy();
    expect(tablePresets.dashboard).toBeTruthy();
    expect(tablePresets.admin).toBeTruthy();
  });
});
