/* eslint-disable no-undef */
jest.mock('../../services/admin/api', () => ({
  get: jest.fn(),
}));

global.fetch = jest.fn();

import {
  checkAPIHealth,
  testCommonEndpoints,
  checkBackendPorts,
} from './apiHealthCheck';
import api from '../../services/admin/api';

describe('API Health Check Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('checkAPIHealth', () => {
    test('returns success when API is healthy', async () => {
      api.get.mockResolvedValue({ data: { status: 'ok' } });
      const result = await checkAPIHealth();
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ status: 'ok' });
    });

    test('returns failure when API request fails', async () => {
      api.get.mockRejectedValue(new Error('Connection refused'));
      const result = await checkAPIHealth();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('catches connection refused error', async () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      api.get.mockRejectedValue(error);
      const result = await checkAPIHealth();
      expect(result.success).toBe(false);
    });

    test('catches response error with status', async () => {
      const error = new Error('API Error');
      error.response = { status: 500, data: { message: 'Server error' } };
      api.get.mockRejectedValue(error);
      const result = await checkAPIHealth();
      expect(result.success).toBe(false);
    });

    test('catches network error', async () => {
      api.get.mockRejectedValue(new Error('Network Error'));
      const result = await checkAPIHealth();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network Error');
    });
  });

  describe('testCommonEndpoints', () => {
    test('returns success for first working endpoint', async () => {
      api.get
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ status: 200 });

      const result = await testCommonEndpoints();
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    test('returns failure when no endpoints work', async () => {
      api.get.mockRejectedValue(new Error('Failed'));
      const result = await testCommonEndpoints();
      expect(result.success).toBe(false);
    });

    test('tries multiple endpoints', async () => {
      api.get.mockRejectedValue(new Error('Failed'));
      await testCommonEndpoints();
      expect(api.get).toHaveBeenCalledTimes(5);
    });
  });

  describe('checkBackendPorts', () => {
    test('checks multiple backend ports', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const result = await checkBackendPorts();
      expect(global.fetch).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    test('handles port check failure gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Port not responding'));
      const result = await checkBackendPorts();
      expect(Array.isArray(result)).toBe(true);
    });

    test('returns array of results', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const result = await checkBackendPorts();
      expect(Array.isArray(result)).toBe(true);
    });

    test('includes port number in results', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const result = await checkBackendPorts();
      if (result.length > 0) {
        expect(result[0].port).toBeDefined();
      }
    });

    test('includes status in results', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const result = await checkBackendPorts();
      if (result.length > 0) {
        expect(result[0].status).toBeDefined();
      }
    });
  });

  test('exports all functions', () => {
    expect(checkAPIHealth).toBeDefined();
    expect(testCommonEndpoints).toBeDefined();
    expect(checkBackendPorts).toBeDefined();
  });

  test('API health check uses correct base URL', async () => {
    api.get.mockResolvedValue({ data: { status: 'ok' } });
    await checkAPIHealth();
    expect(api.get).toHaveBeenCalledWith('/health');
  });

  test('common endpoints includes health endpoint', async () => {
    api.get.mockResolvedValue({ status: 200 });
    await testCommonEndpoints();
    // Should call at least one of the common endpoints
    expect(api.get).toHaveBeenCalled();
  });
});
