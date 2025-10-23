// Mock axios instance with all HTTP methods and interceptors
const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  patch: jest.fn().mockResolvedValue({ data: {} }),
  head: jest.fn().mockResolvedValue({ data: {} }),
  options: jest.fn().mockResolvedValue({ data: {} }),
  request: jest.fn().mockResolvedValue({ data: {} }),
  defaults: {
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

// Main axios mock - create() should always return the same instance
const axios = jest.fn(() => mockAxiosInstance);
axios.create = jest.fn(() => mockAxiosInstance);
axios.get = jest.fn().mockResolvedValue({ data: {} });
axios.post = jest.fn().mockResolvedValue({ data: {} });
axios.put = jest.fn().mockResolvedValue({ data: {} });
axios.delete = jest.fn().mockResolvedValue({ data: {} });
axios.patch = jest.fn().mockResolvedValue({ data: {} });
axios.head = jest.fn().mockResolvedValue({ data: {} });
axios.options = jest.fn().mockResolvedValue({ data: {} });
axios.request = jest.fn().mockResolvedValue({ data: {} });
axios.defaults = {
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
};
axios.interceptors = {
  request: {
    use: jest.fn(),
    eject: jest.fn(),
  },
  response: {
    use: jest.fn(),
    eject: jest.fn(),
  },
};

// Export the mock axios
export default axios;
