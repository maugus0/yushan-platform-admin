import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import ColumnSelector from '../columnselector';

describe('ColumnSelector', () => {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    { key: 'email', title: 'Email', defaultVisible: false },
    { key: 'role', title: 'Role', required: true },
  ];
  const initialVisible = ['name', 'age'];
  const storageKey = 'test-table-columns';

  const openDropdown = () => {
    const trigger = screen.getByRole('button', { name: /Columns \(\d+\)/i });
    fireEvent.click(trigger);
    return trigger;
  };

  const getRowCheckboxByTitle = async (title) => {
    const titleNode = await screen.findByText(title);
    const row = titleNode.closest('div');
    expect(row).toBeTruthy();
    return within(row).getByRole('checkbox');
  };

  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks?.();
    // Ensure no persisted value interferes
    window.localStorage.removeItem(storageKey);
  });

  test('renders trigger and opens dropdown with correct stats', () => {
    const onChange = jest.fn();
    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: initialVisible,
        onChange,
        storageKey,
      })
    );

    // Trigger shows count
    expect(
      screen.getByRole('button', { name: /Columns \(2\)/ })
    ).toBeInTheDocument();

    // Open dropdown
    openDropdown();

    // Stats text in overlay
    expect(screen.getByText('2 / 4 columns visible')).toBeInTheDocument();
    // Search input present
    expect(
      screen.getByPlaceholderText('Search columns...')
    ).toBeInTheDocument();
  });

  test('toggles a single column checkbox and persists to localStorage', async () => {
    const onChange = jest.fn();
    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: initialVisible,
        onChange,
        storageKey,
      })
    );

    openDropdown();

    // Toggle "Email" on
    const emailCheckbox = await getRowCheckboxByTitle('Email');
    fireEvent.click(emailCheckbox);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual(['name', 'age', 'email']); // appended order

    // Persisted
    const saved = JSON.parse(window.localStorage.getItem(storageKey));
    expect(saved).toEqual(['name', 'age', 'email']);
  });

  test('filters columns by search input', async () => {
    const onChange = jest.fn();
    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: initialVisible,
        onChange,
        storageKey,
      })
    );

    openDropdown();

    const input = screen.getByPlaceholderText('Search columns...');
    fireEvent.change(input, { target: { value: 'em' } }); // should match "Email"

    // Only "Email" remains visible in list
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Age')).not.toBeInTheDocument();
    expect(screen.queryByText('Role')).not.toBeInTheDocument();
  });

  test('select all and unselect all affect visible columns', async () => {
    const onChange = jest.fn();
    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: initialVisible,
        onChange,
        storageKey,
      })
    );

    openDropdown();

    // Select all
    const selectAll = screen.getByRole('checkbox', {
      name: /Show All|Hide All/i,
    });
    // When partial selection, label will be "Show All"
    fireEvent.click(selectAll);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const allKeys = columns.map((c) => c.key || c.dataIndex);
    expect(onChange.mock.calls.at(-1)[0]).toEqual(allKeys);

    // Unselect all
    const selectAllAfter = screen.getByRole('checkbox', {
      name: /Show All|Hide All/i,
    });
    fireEvent.click(selectAllAfter);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    expect(onChange.mock.calls.at(-1)[0]).toEqual([]);
  });

  test('reset to default restores defaultVisible and clears search', async () => {
    const onChange = jest.fn();
    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: ['name'], // start with a different set
        onChange,
        storageKey,
      })
    );

    openDropdown();

    const input = screen.getByPlaceholderText('Search columns...');
    fireEvent.change(input, { target: { value: 'na' } });
    expect(input).toHaveValue('na');

    // Click reset
    const resetBtn = screen.getByRole('button', { name: /Reset to Default/i });
    fireEvent.click(resetBtn);

    // Default columns: all except those with defaultVisible === false
    const defaultKeys = columns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.key || c.dataIndex);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(defaultKeys);
    });

    // Search cleared
    expect(screen.getByPlaceholderText('Search columns...')).toHaveValue('');

    // Stats updated
    expect(
      screen.getByText(
        `${defaultKeys.length} / ${columns.length} columns visible`
      )
    ).toBeInTheDocument();
  });

  test('loads saved columns from window.localStorage on mount and updates trigger count', async () => {
    const onChange = jest.fn();
    const saved = ['email'];
    window.localStorage.setItem(storageKey, JSON.stringify(saved));

    render(
      React.createElement(ColumnSelector, {
        columns,
        visibleColumns: initialVisible,
        onChange,
        storageKey,
      })
    );

    // onChange should be called with saved columns
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(saved);
    });

    // Trigger button count should reflect saved (1)
    expect(
      screen.getByRole('button', { name: /Columns \(1\)/i })
    ).toBeInTheDocument();
  });
});
