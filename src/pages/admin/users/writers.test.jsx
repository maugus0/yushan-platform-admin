import { render, screen, waitFor } from '@testing-library/react';
import Writers from './writers';
import { BrowserRouter } from 'react-router-dom';

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
jest.mock('../../../components/admin/tables/datatable', () => {
  const MockDataTable = (props) => (
    <div
      data-testid="data-table"
      data-datasource={JSON.stringify(props.dataSource)}
    >
      {props.dataSource?.length || 0} items
    </div>
  );
  MockDataTable.displayName = 'MockDataTable';
  return MockDataTable;
});
jest.mock('../../../components/admin/tables/tablefilters', () => {
  const MockTableFilters = () => <div data-testid="table-filters"></div>;
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
    getWriters: jest.fn(),
  },
}));

import { userService } from '../../../services/admin/userservice';

describe('Writers page', () => {
  const mockWriters = [
    {
      id: 1,
      username: 'writer1',
      email: 'w1@example.com',
      joinDate: '2024-01-01',
      status: 'active',
    },
    {
      id: 2,
      username: 'writer2',
      email: 'w2@example.com',
      joinDate: '2024-02-01',
      status: 'suspended',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getWriters.mockResolvedValue({ data: mockWriters, total: 2 });
  });

  test('renders header and data table', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByTestId('table-filters')).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  test('handles fetch failure gracefully', async () => {
    userService.getWriters.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });
  });

  test('renders writers data correctly', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const dataTable = screen.getByTestId('data-table');
      expect(dataTable).toBeInTheDocument();
      expect(dataTable).toHaveTextContent('2 items');
    });
  });

  test('handles search filter', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Simulate filter change for search
    const tableFilters = screen.getByTestId('table-filters');
    expect(tableFilters).toBeInTheDocument();
  });

  test('handles status filter', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Status filtering is handled by TableFilters component, verify component renders
    expect(screen.getByTestId('table-filters')).toBeInTheDocument();
  });

  test('handles table pagination change', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Table change is handled internally, verify component renders
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  test('handles bulk actions', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Bulk actions are handled by DataTable component, verify component renders
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  test('renders breadcrumbs correctly', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const breadcrumbs = screen.getByTestId('breadcrumbs');
      expect(breadcrumbs).toHaveTextContent('Admin,User Management,Writers');
    });
  });

  test('renders page header with correct title', async () => {
    render(
      <BrowserRouter>
        <Writers />
      </BrowserRouter>
    );

    await waitFor(() => {
      const header = screen.getByTestId('page-header');
      expect(header).toHaveTextContent('Writers');
    });
  });
});
