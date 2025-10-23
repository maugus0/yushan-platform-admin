/* eslint-disable no-undef */
import { ErrorReporter } from './errorReporting';

global.fetch = jest.fn();

// Mock localStorage properly
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ErrorReporter Utility', () => {
  let errorReporter;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.getItem.mockReturnValue('[]');
    errorReporter = new ErrorReporter();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('logError', () => {
    test('creates error object with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123' };

      errorReporter.logError(error, context);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const callArgs = localStorageMock.setItem.mock.calls[0];
      expect(callArgs[0]).toBe('yushan_admin_errors');
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0]).toHaveProperty('message', 'Test error');
      expect(storedErrors[0]).toHaveProperty('context', context);
    });

    test('includes timestamp in error log', () => {
      const error = new Error('Test error');

      errorReporter.logError(error);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0]).toHaveProperty('timestamp');
    });

    test('includes stack trace', () => {
      const error = new Error('Test error');

      errorReporter.logError(error);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0]).toHaveProperty('stack');
    });

    test('includes URL information', () => {
      const error = new Error('Test error');

      errorReporter.logError(error);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0]).toHaveProperty('url');
    });

    test('includes user agent', () => {
      const error = new Error('Test error');

      errorReporter.logError(error);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0]).toHaveProperty('userAgent');
    });
  });

  describe('logToLocalStorage', () => {
    test('stores error in localStorage', () => {
      const error = new Error('Test error');

      errorReporter.logError(error);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(localStorageMock.setItem.mock.calls[0][0]).toBe(
        'yushan_admin_errors'
      );
    });

    test('maintains max error limit', () => {
      const errors = Array.from({ length: 50 }, (_, i) => ({
        message: `Error ${i}`,
        timestamp: new Date().toISOString(),
      }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(errors));

      const newError = new Error('New error');
      errorReporter.logError(newError);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors.length).toBeLessThanOrEqual(50);
    });

    test('handles localStorage failure gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const error = new Error('Test error');
      expect(() => errorReporter.logError(error)).not.toThrow();
    });

    test('handles JSON parse failure', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const error = new Error('Test error');
      expect(() => errorReporter.logError(error)).not.toThrow();
    });
  });

  describe('logApiError', () => {
    test('logs API error with context', () => {
      const error = new Error('API Error');
      error.response = { status: 404, data: { message: 'Not found' } };

      errorReporter.logApiError(error, '/api/users', { id: '1' });

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0].context).toHaveProperty('type', 'API_ERROR');
      expect(storedErrors[0].context).toHaveProperty('endpoint', '/api/users');
    });

    test('includes response status in API error', () => {
      const error = new Error('API Error');
      error.response = { status: 500 };

      errorReporter.logApiError(error, '/api/data');

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0].context).toHaveProperty('responseStatus', 500);
    });

    test('includes response data in API error', () => {
      const error = new Error('API Error');
      error.response = { status: 400, data: { error: 'Bad request' } };

      errorReporter.logApiError(error, '/api/test');

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0].context).toHaveProperty('responseData');
    });
  });

  describe('logComponentError', () => {
    test('logs component error with context', () => {
      const error = new Error('Component Error');

      errorReporter.logComponentError(error, 'UserList', { userId: '123' });

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0].context).toHaveProperty('type', 'COMPONENT_ERROR');
      expect(storedErrors[0].context).toHaveProperty(
        'componentName',
        'UserList'
      );
    });

    test('includes component props in error', () => {
      const error = new Error('Component Error');
      const props = { visible: true, title: 'Test' };

      errorReporter.logComponentError(error, 'Modal', props);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const storedErrors = JSON.parse(callArgs[1]);
      expect(storedErrors[0].context).toHaveProperty('props', props);
    });
  });

  describe('getStoredErrors', () => {
    test('retrieves stored errors from localStorage', () => {
      const mockErrors = [{ message: 'Error 1' }, { message: 'Error 2' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors));

      const errors = errorReporter.getStoredErrors();

      expect(errors).toEqual(mockErrors);
    });

    test('returns empty array when no errors stored', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const errors = errorReporter.getStoredErrors();

      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBe(0);
    });

    test('handles JSON parse failure in getStoredErrors', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const errors = errorReporter.getStoredErrors();

      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('clearStoredErrors', () => {
    test('removes errors from localStorage', () => {
      errorReporter.clearStoredErrors();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'yushan_admin_errors'
      );
    });
  });

  describe('ErrorReporter class', () => {
    test('creates new instance', () => {
      const reporter = new ErrorReporter();
      expect(reporter).toBeInstanceOf(ErrorReporter);
    });

    test('has all required methods', () => {
      const reporter = new ErrorReporter();
      expect(reporter.logError).toBeDefined();
      expect(reporter.logApiError).toBeDefined();
      expect(reporter.logComponentError).toBeDefined();
      expect(reporter.getStoredErrors).toBeDefined();
      expect(reporter.clearStoredErrors).toBeDefined();
    });

    test('tracks development vs production environment', () => {
      const devReporter = new ErrorReporter();
      expect(devReporter.isDevelopment || !devReporter.isProduction).toBe(true);
    });
  });
});
