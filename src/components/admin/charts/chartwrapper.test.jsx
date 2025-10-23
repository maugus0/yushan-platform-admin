import { render, screen } from '@testing-library/react';
import ChartWrapper from './chartwrapper';

// Mock Ant Design components
jest.mock('antd', () => ({
  Card: ({ children, title, extra, loading, bodyStyle, ...props }) => (
    <div data-testid="card" data-loading={loading} {...props}>
      {title && <div data-testid="card-title">{title}</div>}
      {extra && <div data-testid="card-extra">{extra}</div>}
      <div data-testid="card-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  ),
  Typography: {
    Title: ({ children, level, ...props }) => (
      <h1 data-testid="typography-title" data-level={level} {...props}>
        {children}
      </h1>
    ),
    Text: ({ children, type, ...props }) => (
      <span data-testid="typography-text" data-type={type} {...props}>
        {children}
      </span>
    ),
  },
  Space: ({ children, direction, size, ...props }) => (
    <div
      data-testid="space"
      data-direction={direction}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  ),
  Button: ({ children, icon, ...props }) => (
    <button data-testid="button" {...props}>
      {icon}
      {children}
    </button>
  ),
  Dropdown: ({ children, _menu, ...props }) => (
    <div data-testid="dropdown" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@ant-design/icons', () => ({
  MoreOutlined: () => <span data-testid="more-icon">⋮</span>,
  DownloadOutlined: () => <span data-testid="download-icon">⬇</span>,
  FullscreenOutlined: () => <span data-testid="fullscreen-icon">⛶</span>,
}));

describe('ChartWrapper Component', () => {
  test('renders without crashing', () => {
    render(
      <ChartWrapper>
        <div>Test Content</div>
      </ChartWrapper>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  test('renders with title', () => {
    render(
      <ChartWrapper title="Test Chart">
        <div>Content</div>
      </ChartWrapper>
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  test('renders with subtitle', () => {
    render(
      <ChartWrapper title="Test Chart" subtitle="Test Subtitle">
        <div>Content</div>
      </ChartWrapper>
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <ChartWrapper>
        <div data-testid="test-content">Test Content</div>
      </ChartWrapper>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(
      <ChartWrapper loading={true}>
        <div>Content</div>
      </ChartWrapper>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-loading', 'true');
  });

  test('renders not loading by default', () => {
    render(
      <ChartWrapper>
        <div>Content</div>
      </ChartWrapper>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-loading', 'false');
  });

  test('hides dropdown menu when showMoreMenu is false or not provided', () => {
    render(
      <ChartWrapper>
        <div>Content</div>
      </ChartWrapper>
    );
    // Should not have dropdown if showMoreMenu is false
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  test('renders with more menu when showMoreMenu is true', () => {
    render(
      <ChartWrapper showMoreMenu={true}>
        <div>Content</div>
      </ChartWrapper>
    );
    // The dropdown should be rendered in the extra section
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders action buttons', () => {
    const actions = [{ label: 'Action 1' }, { label: 'Action 2' }];
    render(
      <ChartWrapper actions={actions}>
        <div>Content</div>
      </ChartWrapper>
    );
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders extra element', () => {
    render(
      <ChartWrapper extra={<div data-testid="extra-element">Extra</div>}>
        <div>Content</div>
      </ChartWrapper>
    );
    expect(screen.getByTestId('extra-element')).toBeInTheDocument();
  });

  test('renders custom height', () => {
    render(
      <ChartWrapper height={500}>
        <div>Content</div>
      </ChartWrapper>
    );
    const body = screen.getByTestId('card-body');
    expect(body).toHaveStyle('height: 500px');
  });

  test('renders download callback when provided', () => {
    const onDownload = jest.fn();
    render(
      <ChartWrapper onDownload={onDownload} showMoreMenu={true}>
        <div>Content</div>
      </ChartWrapper>
    );
    // Dropdown menu items would be passed to the Dropdown
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  test('renders fullscreen callback when provided', () => {
    const onFullscreen = jest.fn();
    render(
      <ChartWrapper onFullscreen={onFullscreen} showMoreMenu={true}>
        <div>Content</div>
      </ChartWrapper>
    );
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  test('handles custom style object prop', () => {
    const customStyle = { backgroundColor: 'red', padding: '20px' };
    render(
      <ChartWrapper style={customStyle}>
        <div>Content</div>
      </ChartWrapper>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  test('renders with Space layout', () => {
    render(
      <ChartWrapper>
        <div>Content</div>
      </ChartWrapper>
    );
    const space = screen.getAllByTestId('space');
    expect(space.length).toBeGreaterThan(0);
  });

  test('renders title with correct level', () => {
    render(
      <ChartWrapper title="Chart Title">
        <div>Content</div>
      </ChartWrapper>
    );
    const title = screen.getByTestId('typography-title');
    expect(title).toHaveAttribute('data-level', '4');
  });

  test('renders subtitle with secondary type', () => {
    render(
      <ChartWrapper title="Chart" subtitle="Subtitle">
        <div>Content</div>
      </ChartWrapper>
    );
    const subtitle = screen.getByTestId('typography-text');
    expect(subtitle).toHaveAttribute('data-type', 'secondary');
  });
});
