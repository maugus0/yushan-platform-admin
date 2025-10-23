import { renderHook, act } from '@testing-library/react';
import { useResponsive, useIsMobile, useOrientation } from './useresponsive';

// Mock window.innerWidth and window.innerHeight
const mockWindowSize = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener,
});

describe('useResponsive Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowSize(1024, 768);
  });

  describe('Breakpoint Detection', () => {
    test('detects xs breakpoint correctly', () => {
      mockWindowSize(500, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(true);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
      expect(result.current.xxl).toBe(false);
    });

    test('detects sm breakpoint correctly', () => {
      mockWindowSize(600, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
      expect(result.current.xxl).toBe(false);
    });

    test('detects md breakpoint correctly', () => {
      mockWindowSize(800, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
      expect(result.current.xxl).toBe(false);
    });

    test('detects lg breakpoint correctly', () => {
      mockWindowSize(1000, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(false);
      expect(result.current.xxl).toBe(false);
    });

    test('detects xl breakpoint correctly', () => {
      mockWindowSize(1300, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(true);
      expect(result.current.xxl).toBe(false);
    });

    test('detects xxl breakpoint correctly', () => {
      mockWindowSize(1700, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(true);
      expect(result.current.xxl).toBe(true);
    });
  });

  describe('Device Type Detection', () => {
    test('detects mobile device correctly', () => {
      mockWindowSize(600, 800);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    test('detects tablet device correctly', () => {
      mockWindowSize(900, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    test('detects desktop device correctly', () => {
      mockWindowSize(1200, 800);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    test('handles exact breakpoint boundaries', () => {
      // Test exact mobile boundary
      mockWindowSize(768, 600);
      const { result: mobileResult } = renderHook(() => useResponsive());
      expect(mobileResult.current.isMobile).toBe(true);

      // Test exact tablet boundary (768 < width <= 992)
      mockWindowSize(900, 600);
      const { result: tabletResult } = renderHook(() => useResponsive());
      expect(tabletResult.current.isTablet).toBe(true);
      expect(tabletResult.current.isDesktop).toBe(false);
    });
  });

  describe('Event Listeners', () => {
    test('adds resize event listener on mount', () => {
      renderHook(() => useResponsive());
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    test('removes resize event listener on unmount', () => {
      const { unmount } = renderHook(() => useResponsive());
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    test('updates breakpoints on window resize', () => {
      mockWindowSize(500, 600);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.xs).toBe(true);

      // Simulate window resize
      act(() => {
        mockWindowSize(1000, 600);
        const resizeHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'resize'
        )[1];
        resizeHandler();
      });

      expect(result.current.xs).toBe(false);
      expect(result.current.lg).toBe(true);
    });
  });
});

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowSize(1024, 768);
  });

  test('returns false for desktop screen', () => {
    mockWindowSize(1200, 800);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test('returns true for mobile screen', () => {
    mockWindowSize(600, 800);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('returns true for exact mobile boundary', () => {
    mockWindowSize(768, 600);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('adds resize event listener on mount', () => {
    renderHook(() => useIsMobile());
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  test('removes resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  test('updates isMobile on window resize', () => {
    mockWindowSize(1200, 800);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate window resize to mobile
    act(() => {
      mockWindowSize(600, 800);
      const resizeHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'resize'
      )[1];
      resizeHandler();
    });

    expect(result.current).toBe(true);
  });
});

describe('useOrientation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowSize(1024, 768);
  });

  test('detects landscape orientation correctly', () => {
    mockWindowSize(1200, 600);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  test('detects portrait orientation correctly', () => {
    mockWindowSize(600, 1200);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  test('handles square screen correctly', () => {
    mockWindowSize(800, 800);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  test('adds resize and orientationchange event listeners on mount', () => {
    renderHook(() => useOrientation());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
  });

  test('removes event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOrientation());
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
  });

  test('updates orientation on window resize', () => {
    mockWindowSize(1200, 600);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(true);

    // Simulate window resize to portrait
    act(() => {
      mockWindowSize(600, 1200);
      const resizeHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'resize'
      )[1];
      resizeHandler();
    });

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  test('updates orientation on orientation change', () => {
    mockWindowSize(1200, 600);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.isLandscape).toBe(true);

    // Simulate orientation change
    act(() => {
      mockWindowSize(600, 1200);
      const orientationHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'orientationchange'
      )[1];
      orientationHandler();
    });

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });
});

describe('Edge Cases', () => {
  test('handles very small screen sizes', () => {
    mockWindowSize(100, 200);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.xs).toBe(true);
    expect(result.current.isMobile).toBe(true);
  });

  test('handles very large screen sizes', () => {
    mockWindowSize(3000, 2000);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.xxl).toBe(true);
    expect(result.current.isDesktop).toBe(true);
  });

  test('handles zero dimensions', () => {
    mockWindowSize(0, 0);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.xs).toBe(true);
    expect(result.current.isMobile).toBe(true);
  });
});
