// Error reporting utility for better production error handling
class ErrorReporter {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Log error with context
  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    // In development, still use console for immediate feedback
    if (this.isDevelopment) {
      console.error('Error occurred:', errorData);
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring(errorData);
    }

    // Always log to local storage for debugging (with size limit)
    this.logToLocalStorage(errorData);
  }

  // Send error to external monitoring service
  async sendToMonitoring(errorData) {
    try {
      // TODO: Replace with your actual monitoring service
      // Examples: Sentry, LogRocket, Bugsnag, DataDog, etc.

      // For now, we'll use a simple POST to your backend
      await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (monitoringError) {
      // Fallback if monitoring service fails
      console.warn(
        'Failed to send error to monitoring service:',
        monitoringError
      );
    }
  }

  // Store errors in localStorage for offline debugging
  logToLocalStorage(errorData) {
    try {
      const storageKey = 'yushan_admin_errors';
      const maxErrors = 50; // Limit storage size

      let errors = JSON.parse(localStorage.getItem(storageKey) || '[]');
      errors.unshift(errorData);

      // Keep only recent errors
      if (errors.length > maxErrors) {
        errors = errors.slice(0, maxErrors);
      }

      localStorage.setItem(storageKey, JSON.stringify(errors));
    } catch (storageError) {
      // Storage might be full or unavailable
      console.warn('Failed to log error to localStorage:', storageError);
    }
  }

  // Specialized method for API errors
  logApiError(error, endpoint, requestData = {}) {
    this.logError(error, {
      type: 'API_ERROR',
      endpoint,
      requestData,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
  }

  // Specialized method for component errors
  logComponentError(error, componentName, props = {}) {
    this.logError(error, {
      type: 'COMPONENT_ERROR',
      componentName,
      props,
    });
  }

  // Method to retrieve logged errors (for admin debugging)
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('yushan_admin_errors') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    localStorage.removeItem('yushan_admin_errors');
  }
}

// Create singleton instance
const errorReporter = new ErrorReporter();

export default errorReporter;

// Export ErrorReporter class
export { ErrorReporter };

// Export convenience methods
export const logError = (error, context) =>
  errorReporter.logError(error, context);
export const logApiError = (error, endpoint, requestData) =>
  errorReporter.logApiError(error, endpoint, requestData);
export const logComponentError = (error, componentName, props) =>
  errorReporter.logComponentError(error, componentName, props);
export const clearErrors = () => errorReporter.clearStoredErrors();
