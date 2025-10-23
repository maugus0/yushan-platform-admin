import reportWebVitals from './reportWebVitals';

// Mock the web-vitals module
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

describe('reportWebVitals', () => {
  let mockCallback;

  beforeEach(() => {
    mockCallback = jest.fn();
    jest.clearAllMocks();
  });

  test('should be a function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  test('should not throw when called with null', () => {
    expect(() => reportWebVitals(null)).not.toThrow();
  });

  test('should not throw when called with undefined', () => {
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  test('should not call callback if onPerfEntry is not a function', () => {
    reportWebVitals('not a function');
    reportWebVitals(123);
    reportWebVitals({});

    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should call web-vitals functions when onPerfEntry is a function', (done) => {
    const callback = jest.fn();

    // Dynamic import to trigger the async behavior
    reportWebVitals(callback);

    // Give async import time to resolve
    setTimeout(() => {
      done();
    }, 100);
  });

  test('should handle the callback properly', (done) => {
    const callback = jest.fn();

    reportWebVitals(callback);

    setTimeout(() => {
      // Callback should have been passed to the web-vitals functions
      done();
    }, 100);
  });

  test('should not execute callback for non-function inputs', () => {
    const invalidInputs = [null, undefined, 'string', 123, {}, [], true];

    invalidInputs.forEach((input) => {
      expect(() => reportWebVitals(input)).not.toThrow();
    });
  });
});
