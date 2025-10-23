// Admin Services Index
// This file exports all admin services for easy importing

// Core services
import api, { MockAPIClient } from './api';
import authService from './authservice';

// import yuanService from './yuanservice';
import analyticsService from './analyticsservice';
import dashboardService from './dashboardservice';
import categoryService from './categoryservice';
import novelService from './novelservice';
import chapterService from './chapterservice';

// User interaction services
import commentService from './commentservice';
import reviewService from './reviewservice';
import reportService from './reportservice';

// User management services
import userService from './userservice';
import libraryService from './libraryservice';

// Platform services
import rankingService from './rankingservice';
import settingsService from './settingsservice';

// Re-export for named imports
export { api, MockAPIClient };
export { authService };
export { dashboardService };
export { analyticsService };
export { categoryService };
export { novelService };
export { chapterService };
export { commentService };
export { reviewService };
export { reportService };
export { userService };
export { libraryService };
export { rankingService };
export { settingsService };
// yuan: true, // Already removed yuan reference

// Service availability check
export const checkServiceAvailability = async () => {
  const services = {
    api: true,
    auth: true,
    dashboard: true,
    category: true,
    novel: true,
    chapter: true,
    comment: true,
    review: true,
    report: true,
    user: true,
    library: true,
    ranking: true,
    settings: true,
    // yuan: true, // Removed yuan reference
  };

  // In a real application, you would check actual service health here
  // For now, we'll simulate all services being available
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    success: true,
    services,
    timestamp: new Date().toISOString(),
    totalServices: Object.keys(services).length,
    availableServices: Object.values(services).filter(Boolean).length,
  };
};

// Service configuration
export const serviceConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  // yuan: '/api/v1/yuan', // Removed yuan endpoint
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  mockMode: process.env.REACT_APP_MOCK_MODE === 'true' || true, // Default to mock mode
  apiVersion: 'v1',
  endpoints: {
    auth: '/api/v1/auth',
    dashboard: '/api/v1/dashboard',
    categories: '/api/v1/categories',
    novels: '/api/v1/novels',
    chapters: '/api/v1/chapters',
    comments: '/api/v1/comments',
    reviews: '/api/v1/reviews',
    reports: '/api/v1/reports',
    users: '/api/v1/users',
    library: '/api/v1/library',
    rankings: '/api/v1/rankings',
    settings: '/api/v1/settings',
    // yuan: '/api/v1/yuan', // Removed yuan endpoint
  },
};

// Service initialization
export const initializeServices = async () => {
  try {
    console.log('🚀 Initializing Yushan Admin Services...');

    // Check service availability
    const availability = await checkServiceAvailability();
    console.log('✅ Service availability check completed');

    // yuanService, // Removed yuanService reference
    if (serviceConfig.mockMode) {
      console.log('🔧 Running in mock mode - using generated data');
    } else {
      console.log('🌐 Running in production mode - connecting to real APIs');
    }

    console.log(
      `📊 ${availability.availableServices}/${availability.totalServices} services available`
    );
    console.log('🎉 Yushan Admin Services initialized successfully');

    return {
      success: true,
      config: serviceConfig,
      availability,
      initTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw new Error('Service initialization failed');
  }
};

// Helper function to get service stats
export const getServiceStats = () => {
  return {
    totalServices: 14,
    serviceCategories: {
      // yuan: yuanService, // Removed yuan reference
      content: ['dashboard', 'category', 'novel', 'chapter'],
      interaction: ['comment', 'review', 'report'],
      user: ['user', 'library'],
      platform: ['ranking', 'settings'], // Removed yuan from platform services
    },
    features: {
      authentication: 'Multi-role admin authentication system',
      contentManagement: 'Complete novel and chapter management',
      userInteraction: 'Comments, reviews, and reporting system',
      analytics: 'Comprehensive dashboard and statistics',
      moderation: 'Content and user moderation tools',
      financial: 'Yuan currency and payment management',
      settings: 'Platform configuration management',
    },
    mockDataVolume: {
      novels: '150 generated novels',
      chapters: '1500+ generated chapters',
      users: '500+ mock users',
      comments: '10000+ mock comments',
      reviews: '5000+ mock reviews',
      reports: '500+ mock reports',
      transactions: '5000+ yuan transactions',
      categories: '50+ hierarchical categories',
    },
  };
};

// Export service categories for organized imports
export const coreServices = {
  api,
  authService,
};

export const contentServices = {
  dashboardService,
  categoryService,
  novelService,
  chapterService,
};

export const interactionServices = {
  commentService,
  reviewService,
  reportService,
};

export const userServices = {
  userService,
  libraryService,
};

export const platformServices = {
  rankingService,
  settingsService,
  // yuanService, // Removed yuanService from platform services
  analyticsService,
};

// Default export for easy access to all services
export default {
  // Core
  api,
  auth: authService,

  // Content
  dashboard: dashboardService,
  analytics: analyticsService,
  categories: categoryService,
  novels: novelService,
  chapters: chapterService,

  // Interaction
  comments: commentService,
  reviews: reviewService,
  reports: reportService,

  // User
  users: userService,
  library: libraryService,

  // Platform
  rankings: rankingService,
  settings: settingsService,
  // yuan: yuanService, // Removed yuan from default export

  // Utilities
  config: serviceConfig,
  initialize: initializeServices,
  checkAvailability: checkServiceAvailability,
  getStats: getServiceStats,
};
