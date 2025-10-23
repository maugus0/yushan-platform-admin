import api from '../../services/admin/api';

// Simple API health check utility
export const checkAPIHealth = async () => {
  console.log('🔍 Checking API Health...');

  const baseURL =
    process.env.REACT_APP_API_BASE_URL ||
    'https://yushan-backend-staging.up.railway.app/api';
  console.log('📡 API Base URL:', baseURL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔧 Mock Mode:', process.env.REACT_APP_MOCK_MODE);

  try {
    // Try to ping the API
    const response = await api.get('/health');
    console.log('✅ API Health Check Success:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ API Health Check Failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('🚫 Connection refused - Backend server is not running');
      console.log('💡 Make sure your backend server is running on port 8080');
    } else if (error.response) {
      console.log('📄 Response Status:', error.response.status);
      console.log('📝 Response Data:', error.response.data);
    } else {
      console.log('🔗 Network Error:', error.message);
    }

    return { success: false, error: error.message };
  }
};

// Test different common endpoints
export const testCommonEndpoints = async () => {
  const endpoints = [
    '/health',
    '/api/health',
    '/api/v1/health',
    '/admin/health',
    '/status',
  ];

  console.log('🧪 Testing common health endpoints...');

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      console.log(`✅ ${endpoint} - Success:`, response.status);
      return { endpoint, success: true, status: response.status };
    } catch (error) {
      console.log(
        `❌ ${endpoint} - Failed:`,
        error.response?.status || error.message
      );
    }
  }

  return { success: false, message: 'No working endpoints found' };
};

// Check if backend is running on different ports
export const checkBackendPorts = async () => {
  const ports = [8080, 8000, 3001, 9000, 5000];
  const results = [];

  console.log('🔍 Checking backend on different ports...');

  for (const port of ports) {
    try {
      const testURL = `http://localhost:${port}/api/health`;
      const response = await fetch(testURL, {
        method: 'GET',
        timeout: 3000,
      });

      if (response.ok) {
        console.log(`✅ Backend found on port ${port}`);
        results.push({ port, status: 'running', url: testURL });
      }
    } catch (error) {
      console.log(`❌ Port ${port} - ${error.message}`);
      results.push({ port, status: 'not responding', error: error.message });
    }
  }

  return results;
};

export default { checkAPIHealth, testCommonEndpoints, checkBackendPorts };
