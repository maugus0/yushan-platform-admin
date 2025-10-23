import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock antd: Button/Dropdown/Space/Typography/message
jest.mock('antd', () => {
  const React = require('react');
  const message = {
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  };

  const Button = ({
    children,
    onClick,
    disabled,
    loading,
    type,
    size,
    ...rest
  }) =>
    React.createElement(
      'button',
      {
        onClick,
        disabled,
        'data-loading': !!loading,
        'data-type': type,
        'data-size': size,
        ...rest,
      },
      children
    );

  // Render menu items always for easier testing
  const Dropdown = ({ menu, disabled, children }) => {
    const items = (menu && menu.items) || [];
    const onClick = menu && menu.onClick;
    return React.createElement(
      'div',
      { 'data-testid': 'mock-dropdown', 'data-disabled': !!disabled },
      // trigger
      React.createElement(
        'div',
        { 'data-testid': 'dropdown-trigger' },
        children
      ),
      // menu list
      React.createElement(
        'div',
        { 'data-testid': 'dropdown-menu' },
        items
          .filter((it) => it && it.type !== 'divider')
          .map((it) =>
            React.createElement(
              'button',
              {
                key: it.key,
                'data-testid': `menu-item-${it.key}`,
                onClick: () => onClick && onClick({ key: it.key }),
                disabled: it.disabled,
              },
              // label is a React node; render as-is
              it.label || it.key
            )
          )
      )
    );
  };

  const Space = ({ children }) => React.createElement('span', null, children);
  const Typography = {
    Text: ({ children, ...rest }) =>
      React.createElement('span', rest, children),
  };

  return { Button, Dropdown, Space, Typography, message };
});

import ExportButton from '../exportbutton';

describe('ExportButton', () => {
  const setFixedTime = (iso) => {
    jest.useFakeTimers().setSystemTime(new Date(iso));
  };

  let origCreateElement;
  let anchorRef;
  beforeEach(() => {
    jest.clearAllMocks?.();
    setFixedTime('2024-01-02T03:04:05.678Z');

    // Mock URL API
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = jest.fn(() => 'blob:url');
    } else {
      jest
        .spyOn(window.URL, 'createObjectURL')
        .mockImplementation(() => 'blob:url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = jest.fn();
    } else {
      jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    }

    // Spy document.createElement for 'a' tag to capture download name
    origCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = jest.fn();
        anchorRef = el;
      }
      return el;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    anchorRef = undefined;
  });

  test('single format CSV export (all data)', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob, Jr.' }, // contains comma to exercise CSV quoting
    ];

    render(
      React.createElement(ExportButton, {
        data,
        formats: ['csv'],
        filename: 'users',
      })
    );

    const btn = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(btn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    // Expected filename users_2024-01-02T03-04-05.csv
    expect(anchorRef?.download).toMatch(
      /^users_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/
    );

    const { message } = require('antd');
    expect(message.success).toHaveBeenCalledWith('Exported 2 items as CSV');
  });

  test('single format export shows warning when no data', () => {
    render(
      React.createElement(ExportButton, {
        data: [],
        formats: ['csv'],
        filename: 'empty',
      })
    );

    const btn = screen.getByRole('button', { name: /Export CSV/i });

    expect(btn).toBeDisabled();

    const { message } = require('antd');
    expect(message.warning).not.toHaveBeenCalled();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  test('multi-format dropdown: export all as EXCEL and selected as JSON', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Carol' },
    ];
    const selectedData = [{ id: 2, name: 'Bob' }];

    render(
      React.createElement(ExportButton, {
        data,
        selectedData,
        hasSelection: true,
        formats: ['csv', 'excel', 'json'],
        filename: 'report',
      })
    );

    // Export all as EXCEL
    const menuExcelAll = screen.getByTestId('menu-item-all_excel');
    fireEvent.click(menuExcelAll);

    // Should produce .xlsx file name (content is CSV but extension xlsx)
    expect(anchorRef?.download).toMatch(
      /^report_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.xlsx$/
    );

    const { message } = require('antd');
    expect(message.success).toHaveBeenCalledWith('Exported 3 items as EXCEL');

    // Export selected as JSON
    const menuJsonSelected = screen.getByTestId('menu-item-selected_json');
    fireEvent.click(menuJsonSelected);

    // Should include "_selected" suffix and .json extension
    expect(anchorRef?.download).toMatch(
      /^report_selected_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/
    );
    expect(message.success).toHaveBeenCalledWith('Exported 1 items as JSON');
  });

  test('uses custom onExport when provided and skips download', async () => {
    const data = [{ id: 1, name: 'Alice' }];
    const onExport = jest.fn().mockResolvedValue(undefined);

    render(
      React.createElement(ExportButton, {
        data,
        selectedData: data,
        hasSelection: true,
        formats: ['json'],
        filename: 'custom',
        onExport,
      })
    );

    // Single format button: Export JSON
    const btn = screen.getByRole('button', { name: /Export JSON/i });
    fireEvent.click(btn);

    // onExport called with (format, data, content)
    expect(onExport).toHaveBeenCalledTimes(1);
    const [format, dataArg, content] = onExport.mock.calls[0];
    expect(format).toBe('json');
    expect(dataArg).toEqual(data);
    expect(() => JSON.parse(content)).not.toThrow(); // valid JSON

    // No actual download
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();

    const { message } = require('antd');
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Exported 1 items as JSON');
    });
  });
});
