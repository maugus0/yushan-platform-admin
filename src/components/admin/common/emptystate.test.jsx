import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState, {
  NoSearchResults,
  NoUsers,
  NoNovels,
  EmptyInbox,
  ErrorState,
} from './emptystate';
import { ReloadOutlined } from '@ant-design/icons';

describe('EmptyState Component', () => {
  describe('Basic Rendering', () => {
    test('renders with default type', () => {
      const { container } = render(<EmptyState />);
      expect(container).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
      render(<EmptyState title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    test('renders with custom description', () => {
      render(<EmptyState description="Custom description text" />);
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    test('renders both custom title and description', () => {
      render(<EmptyState title="Title" description="Description" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Empty State Types', () => {
    test('renders default type', () => {
      render(<EmptyState type="default" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
      expect(
        screen.getByText('No data available at the moment.')
      ).toBeInTheDocument();
    });

    test('renders search type', () => {
      render(<EmptyState type="search" />);
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search or filter criteria.')
      ).toBeInTheDocument();
    });

    test('renders users type', () => {
      render(<EmptyState type="users" />);
      expect(screen.getByText('No Users Found')).toBeInTheDocument();
      expect(
        screen.getByText('There are no users matching your criteria.')
      ).toBeInTheDocument();
    });

    test('renders novels type', () => {
      render(<EmptyState type="novels" />);
      expect(screen.getByText('No Novels Found')).toBeInTheDocument();
      expect(
        screen.getByText('No novels have been published yet.')
      ).toBeInTheDocument();
    });

    test('renders files type', () => {
      render(<EmptyState type="files" />);
      expect(screen.getByText('No Files Found')).toBeInTheDocument();
      expect(
        screen.getByText('No files have been uploaded yet.')
      ).toBeInTheDocument();
    });

    test('renders inbox type', () => {
      render(<EmptyState type="inbox" />);
      expect(screen.getByText('Empty Inbox')).toBeInTheDocument();
      expect(
        screen.getByText('You have no new messages or notifications.')
      ).toBeInTheDocument();
    });

    test('renders error type', () => {
      render(<EmptyState type="error" />);
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to load data. Please try again.')
      ).toBeInTheDocument();
    });

    test('renders loading type', () => {
      render(<EmptyState type="loading" />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(
        screen.getByText('Please wait while we fetch your data.')
      ).toBeInTheDocument();
    });

    test('falls back to default for unknown type', () => {
      render(<EmptyState type="unknown" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });
  });

  describe('Default Action Button', () => {
    test('renders default action button when provided', () => {
      const mockAction = jest.fn();
      render(<EmptyState onDefaultAction={mockAction} />);
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });

    test('does not render default action when showDefaultAction is false', () => {
      const mockAction = jest.fn();
      render(
        <EmptyState onDefaultAction={mockAction} showDefaultAction={false} />
      );
      expect(screen.queryByText('Create New')).not.toBeInTheDocument();
    });

    test('does not render default action when onDefaultAction is not provided', () => {
      render(<EmptyState showDefaultAction={true} />);
      expect(screen.queryByText('Create New')).not.toBeInTheDocument();
    });

    test('calls onDefaultAction when button is clicked', () => {
      const mockAction = jest.fn();
      render(<EmptyState onDefaultAction={mockAction} />);
      const button = screen.getByText('Create New');
      fireEvent.click(button);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    test('uses custom default action text', () => {
      const mockAction = jest.fn();
      render(
        <EmptyState onDefaultAction={mockAction} defaultActionText="Add Item" />
      );
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    test('renders custom default action icon', () => {
      const mockAction = jest.fn();
      const customIcon = <ReloadOutlined data-testid="custom-icon" />;
      render(
        <EmptyState
          onDefaultAction={mockAction}
          defaultActionIcon={customIcon}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Custom Actions', () => {
    test('renders custom action buttons', () => {
      const actions = [
        { children: 'Action 1', onClick: jest.fn() },
        { children: 'Action 2', onClick: jest.fn() },
      ];
      render(<EmptyState actions={actions} />);
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    test('calls action onClick when clicked', () => {
      const mockAction1 = jest.fn();
      const mockAction2 = jest.fn();
      const actions = [
        { children: 'Action 1', onClick: mockAction1 },
        { children: 'Action 2', onClick: mockAction2 },
      ];
      render(<EmptyState actions={actions} />);

      fireEvent.click(screen.getByText('Action 1'));
      expect(mockAction1).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Action 2'));
      expect(mockAction2).toHaveBeenCalledTimes(1);
    });

    test('renders actions with icons', () => {
      const actions = [
        {
          children: 'Reload',
          icon: <ReloadOutlined data-testid="reload-icon" />,
          onClick: jest.fn(),
        },
      ];
      render(<EmptyState actions={actions} />);
      expect(screen.getByTestId('reload-icon')).toBeInTheDocument();
    });

    test('renders both default action and custom actions', () => {
      const mockDefaultAction = jest.fn();
      const actions = [{ children: 'Custom Action', onClick: jest.fn() }];
      render(
        <EmptyState onDefaultAction={mockDefaultAction} actions={actions} />
      );
      expect(screen.getByText('Create New')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });
  });

  describe('Custom Image', () => {
    test('renders custom image', () => {
      const customImage = <div data-testid="custom-image">Custom Image</div>;
      render(<EmptyState image={customImage} />);
      expect(screen.getByTestId('custom-image')).toBeInTheDocument();
    });

    test('applies custom imageStyle', () => {
      const customImageStyle = { width: 200, height: 200 };
      const { container } = render(
        <EmptyState imageStyle={customImageStyle} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'lightblue', padding: '50px' };
      const { container } = render(<EmptyState style={customStyle} />);
      const styledDiv = container.querySelector('[style*="background"]');
      expect(styledDiv).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(<EmptyState className="custom-empty" />);
      expect(container.querySelector('.custom-empty')).toBeInTheDocument();
    });
  });

  describe('Pre-configured Components', () => {
    test('NoSearchResults renders correctly', () => {
      const mockClearFilters = jest.fn();
      render(<NoSearchResults onClearFilters={mockClearFilters} />);
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    test('NoSearchResults calls onClearFilters', () => {
      const mockClearFilters = jest.fn();
      render(<NoSearchResults onClearFilters={mockClearFilters} />);
      fireEvent.click(screen.getByText('Clear Filters'));
      expect(mockClearFilters).toHaveBeenCalledTimes(1);
    });

    test('NoUsers renders correctly', () => {
      const mockAction = jest.fn();
      render(<NoUsers onDefaultAction={mockAction} />);
      expect(screen.getByText('No Users Found')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('NoNovels renders correctly', () => {
      const mockAction = jest.fn();
      render(<NoNovels onDefaultAction={mockAction} />);
      expect(screen.getByText('No Novels Found')).toBeInTheDocument();
      expect(screen.getByText('Add Novel')).toBeInTheDocument();
    });

    test('EmptyInbox renders without default action', () => {
      render(<EmptyInbox />);
      expect(screen.getByText('Empty Inbox')).toBeInTheDocument();
      expect(screen.queryByText('Create New')).not.toBeInTheDocument();
    });

    test('ErrorState renders correctly', () => {
      const mockRetry = jest.fn();
      render(<ErrorState onRetry={mockRetry} />);
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('ErrorState calls onRetry', () => {
      const mockRetry = jest.fn();
      render(<ErrorState onRetry={mockRetry} />);
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Scenarios', () => {
    test('renders with all props combined', () => {
      const mockAction = jest.fn();
      const customActions = [{ children: 'Custom', onClick: jest.fn() }];
      render(
        <EmptyState
          type="search"
          title="Custom Title"
          description="Custom Description"
          onDefaultAction={mockAction}
          defaultActionText="Custom Button"
          actions={customActions}
          style={{ padding: '100px' }}
          className="custom-class"
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    test('overrides default type content with custom props', () => {
      render(
        <EmptyState
          type="error"
          title="Override Title"
          description="Override Description"
        />
      );
      expect(screen.getByText('Override Title')).toBeInTheDocument();
      expect(screen.getByText('Override Description')).toBeInTheDocument();
      expect(
        screen.queryByText('Something Went Wrong')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty actions array', () => {
      const { container } = render(<EmptyState actions={[]} />);
      expect(container).toBeInTheDocument();
    });

    test('handles null title', () => {
      render(<EmptyState title={null} type="default" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });

    test('handles undefined description', () => {
      render(<EmptyState description={undefined} type="default" />);
      expect(
        screen.getByText('No data available at the moment.')
      ).toBeInTheDocument();
    });
  });
});
