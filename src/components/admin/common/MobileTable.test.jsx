import { render, screen, fireEvent } from '@testing-library/react';
import MobileTable from './MobileTable';
import { useIsMobile } from '../../../hooks/admin/useresponsive';

// Mock the useIsMobile hook
jest.mock('../../../hooks/admin/useresponsive', () => ({
  useIsMobile: jest.fn(),
}));

describe('MobileTable Component', () => {
  const mockColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  const mockDataSource = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      useIsMobile.mockReturnValue(false);
    });

    test('renders regular table on desktop', () => {
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={mockDataSource} />
      );
      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });

    test('displays all table data', () => {
      render(<MobileTable columns={mockColumns} dataSource={mockDataSource} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('renders table headers', () => {
      render(<MobileTable columns={mockColumns} dataSource={mockDataSource} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      useIsMobile.mockReturnValue(true);
    });

    test('renders card view on mobile', () => {
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={mockDataSource} />
      );
      expect(
        container.querySelector('.mobile-table-container')
      ).toBeInTheDocument();
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    test('displays data in cards', () => {
      render(<MobileTable columns={mockColumns} dataSource={mockDataSource} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('shows field labels in cards', () => {
      render(<MobileTable columns={mockColumns} dataSource={mockDataSource} />);
      const nameLabels = screen.getAllByText('Name');
      expect(nameLabels.length).toBeGreaterThan(0);
    });

    test('renders each data row as a card', () => {
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={mockDataSource} />
      );
      const cards = container.querySelectorAll('.ant-card');
      expect(cards.length).toBe(2);
    });

    test('applies custom card renderer when provided', () => {
      const customRenderer = (record) => (
        <div key={record.id} data-testid="custom-card">
          {record.name}
        </div>
      );

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          cardRenderer={customRenderer}
        />
      );

      const customCards = screen.getAllByTestId('custom-card');
      expect(customCards.length).toBe(2);
    });
  });

  describe('Loading State', () => {
    test('shows loading on desktop when loading is true', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          loading={true}
        />
      );
      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    });

    test('shows loading text on mobile when loading is true', () => {
      useIsMobile.mockReturnValue(true);
      render(
        <MobileTable columns={mockColumns} dataSource={[]} loading={true} />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('shows empty message on mobile when no data', () => {
      useIsMobile.mockReturnValue(true);
      render(<MobileTable columns={mockColumns} dataSource={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    test('shows empty state on desktop when no data', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={[]} />
      );
      expect(container.querySelector('.ant-empty')).toBeInTheDocument();
    });
  });

  describe('Pagination - Mobile', () => {
    beforeEach(() => {
      useIsMobile.mockReturnValue(true);
    });

    test('shows mobile pagination when pagination prop provided', () => {
      const pagination = {
        current: 1,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
        />
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });

    test('disables Previous button on first page', () => {
      const pagination = {
        current: 1,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
        />
      );

      const prevButton = screen.getByText('Previous').closest('button');
      expect(prevButton).toBeDisabled();
    });

    test('disables Next button on last page', () => {
      const pagination = {
        current: 2,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
        />
      );

      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).toBeDisabled();
    });

    test('calls onChange when Previous is clicked', () => {
      const mockOnChange = jest.fn();
      const pagination = {
        current: 2,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
          onChange={mockOnChange}
        />
      );

      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        current: 1,
        pageSize: 10,
        total: 20,
      });
    });

    test('calls onChange when Next is clicked', () => {
      const mockOnChange = jest.fn();
      const pagination = {
        current: 1,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
          onChange={mockOnChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        current: 2,
        pageSize: 10,
        total: 20,
      });
    });

    test('does not render pagination when total is 0', () => {
      const pagination = {
        current: 1,
        pageSize: 10,
        total: 0,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={[]}
          pagination={pagination}
        />
      );

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    test('does not render pagination when pagination is false', () => {
      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={false}
        />
      );

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Column Rendering', () => {
    test('renders custom cell renderer', () => {
      useIsMobile.mockReturnValue(true);
      const columnsWithRender = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text) => <strong>{text.toUpperCase()}</strong>,
        },
      ];

      render(
        <MobileTable
          columns={columnsWithRender}
          dataSource={[{ id: 1, name: 'test' }]}
        />
      );

      expect(screen.getByText('TEST')).toBeInTheDocument();
    });

    test('filters out columns without dataIndex or key', () => {
      useIsMobile.mockReturnValue(true);
      const columnsWithInvalid = [
        {
          title: 'Name',
          dataIndex: 'name',
        },
        {
          title: 'Invalid',
        },
      ];

      const { container } = render(
        <MobileTable
          columns={columnsWithInvalid}
          dataSource={[{ id: 1, name: 'test' }]}
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('handles non-string column titles', () => {
      useIsMobile.mockReturnValue(true);
      const columnsWithNonStringTitle = [
        {
          title: <div>Custom Title</div>,
          dataIndex: 'name',
          key: 'name',
        },
      ];

      render(
        <MobileTable
          columns={columnsWithNonStringTitle}
          dataSource={[{ id: 1, name: 'test' }]}
        />
      );

      expect(screen.getByText('Field')).toBeInTheDocument();
    });
  });

  describe('Row Key', () => {
    test('uses custom rowKey prop', () => {
      useIsMobile.mockReturnValue(true);
      const dataWithCustomKey = [{ customId: 'abc', name: 'Test' }];

      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={dataWithCustomKey}
          rowKey="customId"
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('uses default id as rowKey', () => {
      useIsMobile.mockReturnValue(true);
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={mockDataSource} />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Additional Props', () => {
    test('passes scroll prop to desktop table', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          scroll={{ x: 1000 }}
        />
      );

      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });

    test('passes size prop to desktop table', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          size="small"
        />
      );

      expect(container.querySelector('.ant-table-small')).toBeInTheDocument();
    });

    test('passes additional table props', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          bordered
          showHeader={false}
        />
      );

      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty columns array', () => {
      useIsMobile.mockReturnValue(true);
      const { container } = render(
        <MobileTable columns={[]} dataSource={mockDataSource} />
      );

      expect(container).toBeInTheDocument();
    });

    test('handles undefined dataSource', () => {
      useIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileTable columns={mockColumns} dataSource={undefined} />
      );

      expect(container).toBeInTheDocument();
    });

    test('handles missing pagination properties', () => {
      useIsMobile.mockReturnValue(true);
      const { container } = render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={{}}
        />
      );

      // Component should render without crashing even with empty pagination object
      expect(
        container.querySelector('.mobile-table-container')
      ).toBeInTheDocument();
    });

    test('handles undefined onChange in pagination', () => {
      useIsMobile.mockReturnValue(true);
      const pagination = {
        current: 1,
        pageSize: 10,
        total: 20,
      };

      render(
        <MobileTable
          columns={mockColumns}
          dataSource={mockDataSource}
          pagination={pagination}
        />
      );

      const nextButton = screen.getByText('Next');

      expect(() => {
        fireEvent.click(nextButton);
      }).not.toThrow();
    });
  });
});
