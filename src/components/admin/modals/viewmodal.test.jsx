import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock antd with lightweight components and capture props
jest.mock('antd', () => {
  const React = require('react');

  const Modal = ({
    title,
    open,
    onCancel,
    width,
    className,
    styles,
    children,
  }) => {
    // expose last modal props
    globalThis.__lastModalProps = { open, width, className, styles };
    return React.createElement(
      'div',
      {
        'data-testid': 'modal',
        className,
        'data-open': !!open,
        'data-width': width,
      },
      React.createElement('div', { 'data-testid': 'modal-title' }, title),
      React.createElement(
        'button',
        { 'data-testid': 'modal-close', onClick: () => onCancel && onCancel() },
        'close'
      ),
      React.createElement('div', { 'data-testid': 'modal-body' }, children)
    );
  };
  Modal.displayName = 'MockAntdModal';

  // Descriptions supports both items prop and children items
  const Descriptions = (props) => {
    globalThis.__lastDescriptionsProps = props;
    const items = props.items || [];
    return React.createElement(
      'div',
      { 'data-testid': 'descriptions', 'data-column': props.column },
      items.length
        ? items.map((it) =>
            React.createElement(
              'div',
              {
                key: it.key,
                'data-testid': 'desc-item',
                'data-label': it.label,
              },
              it.children
            )
          )
        : props.children
    );
  };
  Descriptions.displayName = 'MockAntdDescriptions';

  function MockDescriptionsItem({ label, children }) {
    return React.createElement(
      'div',
      { 'data-testid': 'desc-item', 'data-label': label },
      children
    );
  }
  MockDescriptionsItem.displayName = 'MockAntdDescriptionsItem';
  Descriptions.Item = MockDescriptionsItem;

  const Space = ({ children }) =>
    React.createElement('div', { 'data-testid': 'space' }, children);

  const Typography = {
    Text: ({ children }) =>
      React.createElement('span', { 'data-testid': 'text' }, children),
    Paragraph: ({ children }) =>
      React.createElement('p', { 'data-testid': 'paragraph' }, children),
    Title: ({ level = 5, children }) =>
      React.createElement('h' + level, { 'data-testid': 'title' }, children),
  };

  const Tag = ({ children }) =>
    React.createElement('div', { 'data-testid': 'tag' }, children);
  const Avatar = () => React.createElement('div', { 'data-testid': 'avatar' });
  const Image = (props) =>
    React.createElement('img', { 'data-testid': 'image', ...props });
  // Replace hr with a container that accepts children
  const Divider = ({ children, ...props }) =>
    React.createElement(
      'div',
      { 'data-testid': 'divider', ...props },
      children
    );
  Divider.displayName = 'MockAntdDivider';

  // use globalThis.__useMobile to simulate breakpoint
  const Grid = {
    useBreakpoint: () =>
      globalThis.__useMobile ? { md: false } : { md: true },
  };

  return {
    Modal,
    Descriptions,
    Space,
    Typography,
    Tag,
    Avatar,
    Image,
    Divider,
    Grid,
  };
});

// Mock icons without JSX
jest.mock('@ant-design/icons', () => {
  const React = require('react');
  const mkIcon = (tid, name) => {
    function Icon() {
      return React.createElement('span', { 'data-testid': tid });
    }
    Icon.displayName = name;
    return Icon;
  };
  return {
    EyeOutlined: mkIcon('eye-icon', 'MockEyeOutlined'),
    UserOutlined: mkIcon('user-icon', 'MockUserOutlined'),
    CalendarOutlined: mkIcon('calendar-icon', 'MockCalendarOutlined'),
    InfoCircleOutlined: mkIcon('info-icon', 'MockInfoCircleOutlined'),
  };
});

// Mock dayjs to stable format
jest.mock('dayjs', () => {
  const fn = () => ({
    format: () => '2023-01-01 12:00:00',
    isValid: () => true,
  });
  fn.default = fn;
  return fn;
});

// Update import to also test helpers
import ViewModal, { viewFieldTypes } from './viewmodal';

describe('ViewModal', () => {
  beforeEach(() => {
    globalThis.__useMobile = false;
    globalThis.__lastModalProps = undefined;
    globalThis.__lastDescriptionsProps = undefined;
  });

  test('renders title and invokes onCancel when close button clicked', () => {
    const onCancel = jest.fn();

    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel,
        title: 'My Details',
        data: {},
        fields: [],
      })
    );

    // Title content appears through mocked Modal
    expect(screen.getByText('My Details')).toBeInTheDocument();
    expect(globalThis.__lastModalProps.open).toBe(true);

    // Trigger cancel
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('renders various field types and metadata', () => {
    const fields = [
      { name: 'plain', label: 'Plain', type: 'text' },
      { name: 'num', label: 'Number', type: 'number', suffix: 'kg' },
      {
        name: 'created',
        label: 'Created At',
        type: 'date',
        format: 'YYYY-MM-DD HH:mm:ss',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'status',
        colorMap: { active: 'green' },
        labelMap: { active: 'Active' },
      },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'user', label: 'User', type: 'user' },
      { name: 'img', label: 'Image', type: 'image', width: 50, height: 50 },
      { name: 'site', label: 'Link', type: 'link', linkText: 'Website' },
      {
        name: 'flag',
        label: 'Boolean',
        type: 'boolean',
        trueText: 'Yes',
        falseText: 'No',
      },
    ];

    const data = {
      plain: 'Hello world',
      num: 1234,
      created: '2024-01-01T00:00:00Z',
      status: 'active',
      tags: ['dev', 'ops'],
      user: { name: 'Alice', avatar: 'avatar.png' },
      img: 'https://example.com/pic.png',
      site: 'https://example.com',
      flag: true,
      id: 'abc-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'View Details',
        data,
        fields,
      })
    );

    // Basic fields
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument(); // number formatted
    expect(screen.getAllByText('2023-01-01 12:00:00').length).toBeGreaterThan(
      0
    ); // dayjs formatted
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Tags and user name visible
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('ops')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Image and link
    const img = screen.getByTestId('image');
    expect(img.getAttribute('src')).toBe('https://example.com/pic.png');
    const link = screen.getByRole('link', { name: 'Website' });
    expect(link.getAttribute('href')).toBe('https://example.com');

    // Boolean tag
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // Metadata section (ID label/value present)
    const idItem = screen
      .getAllByTestId('desc-item')
      .find((el) => el.getAttribute('data-label') === 'ID');
    expect(idItem).toBeTruthy();
    expect(idItem).toHaveTextContent('abc-123');
    expect(screen.getByText('Metadata')).toBeInTheDocument();
  });

  test('uses desktop columns=2 and mobile columns=1, sets mobile class', () => {
    // Desktop first (md: true)
    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'Title',
        data: {},
        fields: [{ name: 'x', label: 'X', type: 'text' }],
        layout: 'horizontal',
      })
    );
    expect(globalThis.__lastDescriptionsProps.column).toBe(2);

    // Mobile
    globalThis.__useMobile = true;
    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'Title',
        data: {},
        fields: [{ name: 'x', label: 'X', type: 'text' }],
      })
    );

    expect(globalThis.__lastDescriptionsProps.column).toBe(1);
    expect(screen.getAllByTestId('modal')[1].className).toContain(
      'mobile-view-modal'
    );
  });

  test('renders extra sections (description and content) and handles link default text', () => {
    const fields = [
      { name: 'empty', label: 'Empty', type: 'text' }, // empty value path -> "-"
      { name: 'link2', label: 'Link2', type: 'link' }, // no linkText -> use value
    ];
    const data = {
      empty: '',
      link2: 'https://docs.example.com',
      additionalSections: [
        {
          title: 'System Info',
          icon: React.createElement('span', { 'data-testid': 'custom-icon' }),
          type: 'description',
          items: [
            { key: 'env', label: 'Environment', value: 'Prod' },
            { key: 'region', label: 'Region', value: 'US' },
          ],
        },
        {
          title: 'Notes',
          type: 'content',
          content: React.createElement('span', null, 'Extra Content'),
        },
      ],
      id: 'id-1',
    };

    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'More',
        data,
        fields,
      })
    );

    // Empty renders "-"
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    // Link without linkText uses URL string
    const link2 = screen.getByRole('link', {
      name: 'https://docs.example.com',
    });
    expect(link2.getAttribute('href')).toBe('https://docs.example.com');

    // Additional sections
    expect(screen.getByText('System Info')).toBeInTheDocument();
    const envItem = screen
      .getAllByTestId('desc-item')
      .find((el) => el.getAttribute('data-label') === 'Environment');
    expect(envItem).toBeTruthy();
    expect(envItem).toHaveTextContent('Prod');

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Extra Content')).toBeInTheDocument();
  });

  test('renders extended field types: textarea, progress, json, rating, currency, list, default type, boolean false', () => {
    const fields = [
      {
        name: 'ta',
        label: 'Textarea',
        type: 'textarea',
        ellipsis: true,
        copyable: true,
      },
      {
        name: 'numStrong',
        label: 'NumberStrong',
        type: 'number',
        strong: true,
        suffix: 'pt',
      },
      {
        name: 'progress',
        label: 'Progress',
        type: 'progress',
        color: '#123456',
      },
      { name: 'json', label: 'JSON', type: 'json' },
      { name: 'rating', label: 'Rating', type: 'rating' },
      { name: 'currency', label: 'Currency', type: 'currency', symbol: '€' },
      { name: 'list', label: 'List', type: 'list' },
      { name: 'unknown', label: 'Unknown', type: 'unknown' }, // default fallback
      {
        name: 'flag2',
        label: 'Boolean2',
        type: 'boolean',
        trueText: 'Y',
        falseText: 'N',
      },
    ];
    const data = {
      ta: 'Long text here',
      numStrong: 77,
      progress: 42,
      json: { k: 1, s: 'x' },
      rating: 3.5,
      currency: 19.99,
      list: ['a', 'b', 'c'],
      unknown: 'fallback',
      flag2: false,
      id: 'id-2',
    };

    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'Extended',
        data,
        fields,
      })
    );

    // Textarea value rendered
    expect(screen.getByText('Long text here')).toBeInTheDocument();

    // Strong number with suffix
    const strongNum = screen.getByText('77');
    expect(strongNum).toBeInTheDocument();
    expect(screen.getByText('pt')).toBeInTheDocument();

    // Progress shows percentage text and inner bar width
    expect(screen.getByText('42%')).toBeInTheDocument();
    const bars = Array.from(document.querySelectorAll('div')).filter(
      (el) => el.style && el.style.width === '42%'
    );
    expect(bars.length).toBeGreaterThan(0);

    // JSON pretty printed content
    expect(screen.getByText(/"k":\s*1/)).toBeInTheDocument();
    expect(screen.getByText(/"s":\s*"x"/)).toBeInTheDocument();

    // Rating stars and label
    expect(screen.getByText('(3.5/5)')).toBeInTheDocument();

    // Currency with symbol and 2 decimals
    expect(screen.getByText('€19.99')).toBeInTheDocument();

    // List items
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();

    // Default type fallback
    expect(screen.getByText('fallback')).toBeInTheDocument();

    // Boolean false text
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  test('mobile width and descriptions size change appropriately', () => {
    globalThis.__useMobile = true;

    render(
      React.createElement(ViewModal, {
        visible: true,
        onCancel: jest.fn(),
        title: 'Mobile',
        data: { id: 'm1' },
        fields: [{ name: 'x', label: 'X', type: 'text' }],
      })
    );

    // Modal width becomes 95vw
    expect(globalThis.__lastModalProps.styles?.body?.padding).toBe('12px');
    // First Descriptions after render should be small size in props captured last
    expect(globalThis.__lastDescriptionsProps.size).toBe('small');
  });

  test('viewFieldTypes helpers generate expected configs', () => {
    expect(viewFieldTypes.text('n', 'Name')).toEqual(
      expect.objectContaining({ name: 'n', label: 'Name', type: 'text' })
    );
    expect(
      viewFieldTypes.status('s', 'Status', { a: 'g' }, { a: 'A' })
    ).toEqual(
      expect.objectContaining({
        name: 's',
        type: 'status',
        colorMap: { a: 'g' },
        labelMap: { a: 'A' },
      })
    );
    expect(viewFieldTypes.date('d', 'Date')).toEqual(
      expect.objectContaining({ name: 'd', type: 'date' })
    );
    expect(viewFieldTypes.user('u', 'User')).toEqual(
      expect.objectContaining({ name: 'u', type: 'user' })
    );
    expect(viewFieldTypes.tags('t', 'Tags', 'red')).toEqual(
      expect.objectContaining({ name: 't', type: 'tags', tagColor: 'red' })
    );
    expect(viewFieldTypes.number('x', 'X', { strong: true })).toEqual(
      expect.objectContaining({ name: 'x', type: 'number', strong: true })
    );
    expect(viewFieldTypes.boolean('b', 'Bool', 'Y', 'N')).toEqual(
      expect.objectContaining({
        name: 'b',
        type: 'boolean',
        trueText: 'Y',
        falseText: 'N',
      })
    );
  });
});
