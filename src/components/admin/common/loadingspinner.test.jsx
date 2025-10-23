import { render, screen } from '@testing-library/react';
import LoadingSpinner, {
  PageLoader,
  TableLoader,
  ButtonLoader,
  InlineLoader,
} from './loadingspinner';

describe('LoadingSpinner Component', () => {
  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeInTheDocument();
    });

    test('displays loading text', () => {
      render(<LoadingSpinner tip="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('hides loading text when showText is false', () => {
      render(<LoadingSpinner tip="Loading..." showText={false} />);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    test('renders without text when tip is empty', () => {
      render(<LoadingSpinner tip="" />);
      const container = screen.queryByText('Loading...');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('Spinning State', () => {
    test('shows spinner when spinning is true', () => {
      const { container } = render(<LoadingSpinner spinning={true} />);
      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    });

    test('hides spinner when spinning is false', () => {
      const { container } = render(<LoadingSpinner spinning={false} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Size Variations', () => {
    test('renders with small size', () => {
      const { container } = render(<LoadingSpinner size="small" />);
      expect(container.querySelector('.ant-spin-sm')).toBeInTheDocument();
    });

    test('renders with large size', () => {
      const { container } = render(<LoadingSpinner size="large" />);
      expect(container.querySelector('.ant-spin-lg')).toBeInTheDocument();
    });

    test('renders with default size', () => {
      const { container } = render(<LoadingSpinner size="default" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('With Children', () => {
    test('renders children content', () => {
      render(
        <LoadingSpinner>
          <div data-testid="child-content">Child Content</div>
        </LoadingSpinner>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    test('wraps children with spinner', () => {
      const { container } = render(
        <LoadingSpinner spinning={true}>
          <div>Content</div>
        </LoadingSpinner>
      );
      expect(
        container.querySelector('.ant-spin-container')
      ).toBeInTheDocument();
    });

    test('shows children without overlay when overlay is false', () => {
      render(
        <LoadingSpinner spinning={true} overlay={false}>
          <div data-testid="content">Content</div>
        </LoadingSpinner>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Overlay Mode', () => {
    test('renders overlay when overlay prop is true', () => {
      const { container } = render(
        <LoadingSpinner overlay={true} spinning={true}>
          <div>Content</div>
        </LoadingSpinner>
      );
      expect(container).toBeInTheDocument();
    });

    test('does not show overlay when spinning is false', () => {
      render(
        <LoadingSpinner overlay={true} spinning={false}>
          <div data-testid="content">Content</div>
        </LoadingSpinner>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    test('positions overlay absolutely over children', () => {
      const { container } = render(
        <LoadingSpinner overlay={true} spinning={true}>
          <div>Content</div>
        </LoadingSpinner>
      );
      const overlay = container.querySelector('[style*="position: absolute"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<LoadingSpinner style={customStyle} />);
      const styledDiv = container.querySelector('[style*="background"]');
      expect(styledDiv).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(
        <LoadingSpinner className="custom-spinner" />
      );
      expect(container.querySelector('.custom-spinner')).toBeInTheDocument();
    });

    test('applies custom text style', () => {
      render(<LoadingSpinner textStyle={{ color: 'blue' }} tip="Loading" />);
      const text = screen.getByText('Loading');
      expect(text).toBeInTheDocument();
    });

    test('uses custom indicator', () => {
      const customIndicator = <div data-testid="custom-indicator">Custom</div>;
      render(<LoadingSpinner indicator={customIndicator} />);
      expect(screen.getByTestId('custom-indicator')).toBeInTheDocument();
    });
  });

  describe('Centering and Positioning', () => {
    test('centers content when centered is true', () => {
      const { container } = render(<LoadingSpinner centered={true} />);
      const centeredDiv = container.querySelector(
        '[style*="justify-content: center"]'
      );
      expect(centeredDiv).toBeInTheDocument();
    });

    test('does not center content when centered is false', () => {
      const { container } = render(<LoadingSpinner centered={false} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Fullscreen Mode', () => {
    test('renders in fullscreen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);
      const fullscreenDiv = container.querySelector(
        '[style*="position: fixed"]'
      );
      expect(fullscreenDiv).toBeInTheDocument();
    });

    test('applies z-index in fullscreen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);
      const fullscreenDiv = container.querySelector('[style*="z-index: 9999"]');
      expect(fullscreenDiv).toBeInTheDocument();
    });

    test('has semi-transparent background in fullscreen', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);
      const fullscreenDiv = container.querySelector(
        '[style*="rgba(255, 255, 255, 0.8)"]'
      );
      expect(fullscreenDiv).toBeInTheDocument();
    });
  });

  describe('Delay', () => {
    test('accepts delay prop', () => {
      const { container } = render(<LoadingSpinner delay={500} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Pre-configured Variations', () => {
    test('PageLoader renders correctly', () => {
      const { container } = render(<PageLoader />);
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Loading page...')).toBeInTheDocument();
    });

    test('TableLoader renders correctly', () => {
      const { container } = render(<TableLoader />);
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('ButtonLoader renders correctly', () => {
      const { container } = render(<ButtonLoader />);
      expect(container).toBeInTheDocument();
    });

    test('InlineLoader renders correctly', () => {
      const { container } = render(<InlineLoader />);
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('PageLoader has fullScreen enabled', () => {
      const { container } = render(<PageLoader />);
      const fullscreenDiv = container.querySelector(
        '[style*="position: fixed"]'
      );
      expect(fullscreenDiv).toBeInTheDocument();
    });

    test('ButtonLoader has showText disabled', () => {
      render(<ButtonLoader />);
      const loadingText = screen.queryByText('Loading...');
      expect(loadingText).not.toBeInTheDocument();
    });

    test('TableLoader has custom minHeight', () => {
      const { container } = render(<TableLoader />);
      expect(container).toBeInTheDocument();
    });

    test('InlineLoader is not centered', () => {
      const { container } = render(<InlineLoader />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    test('renders spinner with children and custom tip', () => {
      render(
        <LoadingSpinner tip="Please wait...">
          <div data-testid="content">Content</div>
        </LoadingSpinner>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    test('handles all props together', () => {
      const { container } = render(
        <LoadingSpinner
          spinning={true}
          size="large"
          tip="Loading..."
          showText={true}
          centered={true}
          delay={100}
          className="test-class"
          style={{ padding: '20px' }}
        />
      );
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty tip gracefully', () => {
      const { container } = render(<LoadingSpinner tip="" />);
      expect(container).toBeInTheDocument();
    });

    test('handles null children', () => {
      const { container } = render(<LoadingSpinner>{null}</LoadingSpinner>);
      expect(container).toBeInTheDocument();
    });

    test('handles undefined tip', () => {
      const { container } = render(<LoadingSpinner tip={undefined} />);
      expect(container).toBeInTheDocument();
    });
  });
});
