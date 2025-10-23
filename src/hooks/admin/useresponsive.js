import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting mobile/responsive breakpoints
 * Returns boolean values for different screen sizes
 */
export const useResponsive = () => {
  const [breakpoints, setBreakpoints] = useState({
    xs: false, // < 576px
    sm: false, // >= 576px
    md: false, // >= 768px
    lg: false, // >= 992px
    xl: false, // >= 1200px
    xxl: false, // >= 1600px
    isMobile: false, // <= 768px
    isTablet: false, // > 768px && <= 992px
    isDesktop: false, // > 992px
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;

      setBreakpoints({
        xs: width < 576,
        sm: width >= 576,
        md: width >= 768,
        lg: width >= 992,
        xl: width >= 1200,
        xxl: width >= 1600,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 992,
        isDesktop: width > 992,
      });
    };

    // Initial check
    updateBreakpoints();

    // Add event listener
    window.addEventListener('resize', updateBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};

/**
 * Simple mobile detection hook
 * Returns true if screen width is <= 768px
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/**
 * Hook for detecting screen orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState({
    isLandscape: false,
    isPortrait: true,
  });

  useEffect(() => {
    const updateOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation({
        isLandscape,
        isPortrait: !isLandscape,
      });
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

export default useResponsive;
