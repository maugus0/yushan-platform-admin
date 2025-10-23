import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Readers from './readers';
import { BrowserRouter } from 'react-router-dom';

// Spy antd.message to assert info calls from bulk actions
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('../../../components/admin/common/pageheader', () => {
  const MockPageHeader = (props) => (
    <div data-testid="page-header">{props.title}</div>
  );
  MockPageHeader.displayName = 'MockPageHeader';
  return MockPageHeader;
});
jest.mock('../../../components/admin/common/breadcrumbs', () => {
  const MockBreadcrumbs = (props) => (
    <div data-testid="breadcrumbs">
      {props.items?.map((i) => i.title).join(',')}
    </div>
  );
  MockBreadcrumbs.displayName = 'MockBreadcrumbs';
  return MockBreadcrumbs;
});
// Interactive DataTable mock: shows items count, exposes pagination current,
// and provides triggers to call onChange and onBulkAction
jest.mock('../../../components/admin/tables/datatable', () => {
  const MockDataTable = (props) => {
    // Expose columns for advanced assertions in tests
    globalThis.__ReadersColumns = props.columns;
    return (
      <div
        data-testid="data-table"
        data-datasource={JSON.stringify(props.dataSource)}
        data-current={props.pagination?.current ?? ''}
      >
        {props.dataSource?.length || 0} items
        <div data-testid="col-keys">
          {(props.columns || []).map((c) => c.key || c.dataIndex).join(',')}
        </div>
        <button
          data-testid="trigger-table-change"
          onClick={() =>
            props.onChange &&
            props.onChange({ current: 2, pageSize: 10 }, {}, {})
          }
        >
          change
        </button>
        <button
          data-testid="trigger-bulk-export"
          onClick={() =>
            props.onBulkAction && props.onBulkAction('export', [], [])
          }
        >
          bulk-export
        </button>
      </div>
    );
  };
  MockDataTable.displayName = 'MockDataTable';
  return MockDataTable;
});
// Interactive TableFilters mock: provides buttons to apply and clear filters
jest.mock('../../../components/admin/tables/tablefilters', () => {
  const MockTableFilters = ({ onFiltersChange, onReset }) => (
    <div data-testid="table-filters">
      <button
        data-testid="apply-search-reader1"
        onClick={() =>
          onFiltersChange && onFiltersChange({ search: 'reader1' })
        }
      >
        search-r1
      </button>
      <button
        data-testid="apply-status-suspended"
        onClick={() =>
          onFiltersChange && onFiltersChange({ status: 'suspended' })
        }
      >
        status-suspended
      </button>
      <button
        data-testid="clear-filters"
        onClick={() => {
          onReset && onReset();
          onFiltersChange && onFiltersChange({});
        }}
      >
        clear
      </button>
    </div>
  );
  MockTableFilters.displayName = 'MockTableFilters';
  return MockTableFilters;
});
jest.mock('../../../components/admin/common/statusbadge', () => {
  const MockStatusBadge = (props) => (
    <span data-testid="status-badge">{props.status}</span>
  );
  MockStatusBadge.displayName = 'MockStatusBadge';
  return MockStatusBadge;
});

jest.mock('../../../services/admin/userservice', () => ({
  userService: {
    getReaders: jest.fn(),
  },
}));

import { userService } from '../../../services/admin/userservice';
import { message } from 'antd';

describe('Readers page', () => {
  const mockReaders = [
    {
      id: 1,
      username: 'reader1',
      email: 'r1@example.com',
      joinDate: '2024-01-01',
      status: 'active',
    },
    {
      id: 2,
      username: 'reader2',
      email: 'r2@example.com',
      joinDate: '2024-02-01',
      status: 'suspended',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getReaders.mockResolvedValue({ data: mockReaders, total: 2 });
  });

  test('renders header and data table', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByTestId('table-filters')).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  test('handles fetch failure gracefully', async () => {
    userService.getReaders.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });
  });

  test('renders readers data correctly', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const dataTable = screen.getByTestId('data-table');
      expect(dataTable).toBeInTheDocument();
      expect(dataTable).toHaveTextContent('2 items');
    });
  });

  test('applies search filter and updates items count', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );
    await waitFor(() => screen.getByTestId('table-filters'));
    fireEvent.click(screen.getByTestId('apply-search-reader1'));
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toHaveTextContent('1 items');
    });
  });

  test('applies status filter and updates items count', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );
    await waitFor(() => screen.getByTestId('table-filters'));
    fireEvent.click(screen.getByTestId('apply-status-suspended'));
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toHaveTextContent('1 items');
    });
  });

  test('clears filters and restores items count', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );
    await waitFor(() => screen.getByTestId('table-filters'));
    fireEvent.click(screen.getByTestId('apply-status-suspended'));
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toHaveTextContent('1 items');
    });
    fireEvent.click(screen.getByTestId('clear-filters'));
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toHaveTextContent('2 items');
    });
  });

  test('handles table pagination change (updates current page)', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByTestId('data-table'));
    fireEvent.click(screen.getByTestId('trigger-table-change'));

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toHaveAttribute(
        'data-current',
        '2'
      );
    });
  });

  test('bulk export action triggers info message', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByTestId('data-table'));
    fireEvent.click(screen.getByTestId('trigger-bulk-export'));

    await waitFor(() => {
      expect(message.info).toHaveBeenCalledWith(
        'Export functionality will be implemented'
      );
    });
  });

  test('renders breadcrumbs correctly', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const breadcrumbs = screen.getByTestId('breadcrumbs');
      expect(breadcrumbs).toHaveTextContent('Admin,User Management,Readers');
    });
  });

  test('renders page header with correct title', async () => {
    render(
      <BrowserRouter>
        <Readers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const header = screen.getByTestId('page-header');
      expect(header).toHaveTextContent('Readers');
    });
  });
});
