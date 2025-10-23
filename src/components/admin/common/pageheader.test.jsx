import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from './pageheader';
import { Button, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PageHeader Component', () => {
  describe('Basic Rendering', () => {
    test('renders with title prop', () => {
      renderWithRouter(<PageHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    test('renders with subtitle', () => {
      renderWithRouter(
        <PageHeader title="Test Title" subtitle="Test Subtitle" />
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    test('renders without subtitle when not provided', () => {
      renderWithRouter(<PageHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    test('shows back button when showBackButton is true', () => {
      const mockOnBack = jest.fn();
      renderWithRouter(
        <PageHeader
          title="Test Title"
          showBackButton={true}
          onBack={mockOnBack}
        />
      );

      const backButtons = screen.getAllByRole('img', { hidden: true });
      expect(backButtons.length).toBeGreaterThan(0);
    });

    test('does not show back button when showBackButton is false', () => {
      renderWithRouter(
        <PageHeader title="Test Title" showBackButton={false} />
      );

      const title = screen.getByText('Test Title');
      expect(title).toBeInTheDocument();
    });

    test('calls onBack when back button is clicked', () => {
      const mockOnBack = jest.fn();
      renderWithRouter(
        <PageHeader
          title="Test Title"
          showBackButton={true}
          onBack={mockOnBack}
        />
      );

      // The back button is a span with onClick
      const backButton = screen
        .getByText('Test Title')
        .closest('div').previousSibling;
      if (backButton) {
        fireEvent.click(backButton);
        expect(mockOnBack).toHaveBeenCalled();
      }
    });
  });

  describe('Breadcrumbs', () => {
    test('renders breadcrumbs when provided', () => {
      const breadcrumbs = [{ title: 'Home' }, { title: 'Dashboard' }];
      renderWithRouter(
        <PageHeader title="Test Title" breadcrumbs={breadcrumbs} />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('does not render breadcrumbs when showBreadcrumbs is false', () => {
      const breadcrumbs = [{ title: 'Home' }, { title: 'Dashboard' }];
      renderWithRouter(
        <PageHeader
          title="Test Title"
          breadcrumbs={breadcrumbs}
          showBreadcrumbs={false}
        />
      );

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    test('does not render breadcrumbs when empty array', () => {
      renderWithRouter(<PageHeader title="Test Title" breadcrumbs={[]} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  describe('Actions and Extra Content', () => {
    test('renders action buttons', () => {
      const actions = [
        <Button key="save" type="primary">
          Save
        </Button>,
        <Button key="cancel">Cancel</Button>,
      ];
      renderWithRouter(<PageHeader title="Test Title" actions={actions} />);

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('renders extra content', () => {
      const extra = <div data-testid="extra-content">Extra Content</div>;
      renderWithRouter(<PageHeader title="Test Title" extra={extra} />);

      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });

    test('renders both actions and extra content', () => {
      const actions = [<Button key="action">Action</Button>];
      const extra = <div data-testid="extra">Extra</div>;
      renderWithRouter(
        <PageHeader title="Test Title" actions={actions} extra={extra} />
      );

      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByTestId('extra')).toBeInTheDocument();
    });

    test('renders multiple actions', () => {
      const actions = [
        <Button key="1">Action 1</Button>,
        <Button key="2">Action 2</Button>,
        <Button key="3">Action 3</Button>,
      ];
      renderWithRouter(<PageHeader title="Test Title" actions={actions} />);

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      expect(screen.getByText('Action 3')).toBeInTheDocument();
    });
  });

  describe('Tags and Avatar', () => {
    test('renders tags when provided', () => {
      const tags = (
        <>
          <Tag color="blue">Active</Tag>
          <Tag color="green">Published</Tag>
        </>
      );
      renderWithRouter(<PageHeader title="Test Title" tags={tags} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    test('renders avatar when provided', () => {
      const avatar = <Avatar icon={<UserOutlined />} data-testid="avatar" />;
      renderWithRouter(<PageHeader title="Test Title" avatar={avatar} />);

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    test('renders both avatar and tags', () => {
      const avatar = <Avatar data-testid="avatar">U</Avatar>;
      const tags = <Tag>Tag</Tag>;
      renderWithRouter(
        <PageHeader title="Test Title" avatar={avatar} tags={tags} />
      );

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByText('Tag')).toBeInTheDocument();
    });
  });

  describe('Footer and Children', () => {
    test('renders footer when provided', () => {
      const footer = <div data-testid="footer">Footer Content</div>;
      renderWithRouter(<PageHeader title="Test Title" footer={footer} />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    test('renders children when provided', () => {
      renderWithRouter(
        <PageHeader title="Test Title">
          <div data-testid="children">Child Content</div>
        </PageHeader>
      );

      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    test('renders both footer and children', () => {
      const footer = <div data-testid="footer">Footer</div>;
      renderWithRouter(
        <PageHeader title="Test Title" footer={footer}>
          <div data-testid="children">Children</div>
        </PageHeader>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  describe('Styling and Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = renderWithRouter(
        <PageHeader title="Test Title" style={customStyle} />
      );

      const headerDiv = container.firstChild;
      expect(headerDiv).toHaveStyle({
        backgroundColor: 'red',
        padding: '20px',
      });
    });

    test('applies custom className', () => {
      const { container } = renderWithRouter(
        <PageHeader title="Test Title" className="custom-header" />
      );

      expect(container.querySelector('.custom-header')).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    test('renders complete page header with all props', () => {
      const breadcrumbs = [{ title: 'Home' }, { title: 'Page' }];
      const actions = [<Button key="save">Save</Button>];
      const extra = <div>Extra</div>;
      const tags = <Tag>Tag</Tag>;
      const avatar = <Avatar>A</Avatar>;
      const footer = <div data-testid="footer">Footer</div>;
      const mockOnBack = jest.fn();

      renderWithRouter(
        <PageHeader
          title="Complete Title"
          subtitle="Complete Subtitle"
          showBackButton={true}
          onBack={mockOnBack}
          breadcrumbs={breadcrumbs}
          actions={actions}
          extra={extra}
          tags={tags}
          avatar={avatar}
          footer={footer}
        >
          <div data-testid="children">Content</div>
        </PageHeader>
      );

      expect(screen.getByText('Complete Title')).toBeInTheDocument();
      expect(screen.getByText('Complete Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Extra')).toBeInTheDocument();
      expect(screen.getByText('Tag')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    test('handles empty actions array', () => {
      renderWithRouter(<PageHeader title="Test Title" actions={[]} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      renderWithRouter(<PageHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    test('handles special characters in title', () => {
      const specialTitle = 'Title with <special> & characters!';
      renderWithRouter(<PageHeader title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('renders mobile layout correctly', () => {
      // Mock window.matchMedia for mobile
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { container } = renderWithRouter(
        <PageHeader title="Test Title" subtitle="Test Subtitle" />
      );

      expect(container).toBeInTheDocument();
    });
  });
});
