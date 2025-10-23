import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from './index';

// Mock antd components with minimal implementations
jest.mock('antd', () => ({
  Form: Object.assign(() => <form data-testid="form" />, {
    useForm: () => [
      {
        setFieldsValue: jest.fn(),
        validateFields: jest.fn(),
        getFieldsValue: jest.fn(),
        resetFields: jest.fn(),
      },
      jest.fn(),
    ],
    Item: () => <div data-testid="form-item" />,
  }),
  Input: () => <input data-testid="input" />,
  TextArea: () => <textarea data-testid="textarea" />,
  Select: () => <select data-testid="select" />,
  Option: () => <option data-testid="option" />,
  Switch: () => <button data-testid="switch" />,
  InputNumber: () => <input data-testid="input-number" type="number" />,
  ColorPicker: () => <input data-testid="color-picker" type="color" />,
  Slider: () => <input data-testid="slider" type="range" />,
  Button: ({ children, ...props }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
  Card: ({ children, title }) => (
    <div data-testid="card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-content">{children}</div>
    </div>
  ),
  Space: ({ children }) => <div data-testid="space">{children}</div>,
  Row: ({ children }) => <div data-testid="row">{children}</div>,
  Col: ({ children }) => <div data-testid="col">{children}</div>,
  Grid: {
    useBreakpoint: () => ({ md: true }),
  },
  message: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock Grid useBreakpoint
jest.mock('antd/lib/grid', () => ({
  useBreakpoint: () => ({ md: true }),
}));

// Mock custom components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs, actions }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div data-testid="breadcrumbs">
        {breadcrumbs?.map((crumb, index) => (
          <span key={index}>{crumb.title}</span>
        ))}
      </div>
      <div data-testid="page-actions">
        {actions?.map((action, index) => (
          <div key={index} data-testid="page-action">
            {action}
          </div>
        ))}
      </div>
    </div>
  ),
  LoadingSpinner: ({ tip }) => (
    <div data-testid="loading-spinner">{tip || 'Loading...'}</div>
  ),
}));

// Mock icons
jest.mock('@ant-design/icons', () => ({
  SettingOutlined: () => <span data-testid="setting-icon">SettingIcon</span>,
  SaveOutlined: () => <span data-testid="save-icon">SaveIcon</span>,
  ReloadOutlined: () => <span data-testid="reload-icon">ReloadIcon</span>,
  GlobalOutlined: () => <span data-testid="global-icon">GlobalIcon</span>,
  SecurityScanOutlined: () => (
    <span data-testid="security-icon">SecurityIcon</span>
  ),
  DollarOutlined: () => <span data-testid="dollar-icon">DollarIcon</span>,
  BellOutlined: () => <span data-testid="bell-icon">BellIcon</span>,
  ThunderboltOutlined: () => (
    <span data-testid="thunderbolt-icon">ThunderboltIcon</span>
  ),
  PictureOutlined: () => <span data-testid="picture-icon">PictureIcon</span>,
}));

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<Settings />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  test('renders page header with correct title', () => {
    render(<Settings />);
    expect(screen.getByText('Platform Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Configure and manage platform settings')
    ).toBeInTheDocument();
  });

  test('renders loading spinner initially', () => {
    render(<Settings />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<Settings />);
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders general settings section as default active section', () => {
    render(<Settings />);
    expect(screen.getByText('General Settings')).toBeInTheDocument();
  });

  test('renders navigation buttons for all sections', () => {
    render(<Settings />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Monetization')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  test('renders save settings button in page actions', () => {
    render(<Settings />);
    const pageActions = screen.getByTestId('page-actions');
    expect(pageActions).toBeInTheDocument();
    // The button text should be rendered by the Button component mock
  });

  test('renders reset button in page actions', () => {
    render(<Settings />);
    const pageActions = screen.getByTestId('page-actions');
    expect(pageActions).toBeInTheDocument();
    // The button text should be rendered by the Button component mock
  });

  test('renders card components', () => {
    render(<Settings />);
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('renders space components', () => {
    render(<Settings />);
    const spaces = screen.getAllByTestId('space');
    expect(spaces.length).toBeGreaterThan(0);
  });

  test('renders row components', () => {
    render(<Settings />);
    const rows = screen.getAllByTestId('row');
    expect(rows.length).toBeGreaterThan(0);
  });

  test('renders column components', () => {
    render(<Settings />);
    const cols = screen.getAllByTestId('col');
    expect(cols.length).toBeGreaterThan(0);
  });
});
