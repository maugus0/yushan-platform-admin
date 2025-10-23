jest.mock('./api', () => ({
  __esModule: true,
  default: { create: jest.fn(), get: jest.fn(), post: jest.fn() },
  MockAPIClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('./authservice', () => ({
  __esModule: true,
  default: { login: jest.fn() },
}));
jest.mock('./analyticsservice', () => ({
  __esModule: true,
  default: { getAnalyticsSummary: jest.fn() },
}));
jest.mock('./dashboardservice', () => ({
  __esModule: true,
  default: { getStats: jest.fn() },
}));
jest.mock('./categoryservice', () => ({
  __esModule: true,
  default: { getAll: jest.fn() },
}));
jest.mock('./novelservice', () => ({
  __esModule: true,
  default: { getAllNovels: jest.fn() },
}));
jest.mock('./chapterservice', () => ({
  __esModule: true,
  default: { getChapters: jest.fn() },
}));
jest.mock('./commentservice', () => ({
  __esModule: true,
  default: { getAllComments: jest.fn() },
}));
jest.mock('./reviewservice', () => ({
  __esModule: true,
  default: { getAllReviews: jest.fn() },
}));
jest.mock('./reportservice', () => ({
  __esModule: true,
  default: { getAllReports: jest.fn() },
}));
jest.mock('./userservice', () => ({
  __esModule: true,
  default: { getAllUsers: jest.fn() },
}));
jest.mock('./libraryservice', () => ({
  __esModule: true,
  default: { getAllLibraries: jest.fn() },
}));
jest.mock('./rankingservice', () => ({
  __esModule: true,
  default: { getAllRankings: jest.fn() },
}));
jest.mock('./settingsservice', () => ({
  __esModule: true,
  default: { getAllSettings: jest.fn() },
}));

import servicesDefault, {
  api,
  MockAPIClient,
  authService,
  analyticsService,
  dashboardService,
  categoryService,
  novelService,
  chapterService,
  commentService,
  reviewService,
  reportService,
  userService,
  libraryService,
  rankingService,
  settingsService,
  checkServiceAvailability,
  serviceConfig,
  initializeServices,
  getServiceStats,
  coreServices,
  contentServices,
  interactionServices,
  userServices,
  platformServices,
} from './index';

describe('Admin Services Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('named exports should be defined', () => {
    expect(api).toBeDefined();
    expect(MockAPIClient).toBeDefined();

    expect(authService).toBeDefined();
    expect(analyticsService).toBeDefined();
    expect(dashboardService).toBeDefined();
    expect(categoryService).toBeDefined();
    expect(novelService).toBeDefined();
    expect(chapterService).toBeDefined();

    expect(commentService).toBeDefined();
    expect(reviewService).toBeDefined();
    expect(reportService).toBeDefined();

    expect(userService).toBeDefined();
    expect(libraryService).toBeDefined();

    expect(rankingService).toBeDefined();
    expect(settingsService).toBeDefined();
  });

  test('default export should expose grouped services and utilities', () => {
    expect(servicesDefault).toBeDefined();
    expect(servicesDefault.users).toBe(userService);
    expect(servicesDefault.library).toBe(libraryService);
    expect(servicesDefault.reports).toBe(reportService);
    expect(servicesDefault.reviews).toBe(reviewService);
    expect(servicesDefault.rankings).toBe(rankingService);
    expect(servicesDefault.settings).toBe(settingsService);
    expect(servicesDefault.initialize).toBe(initializeServices);
    expect(servicesDefault.checkAvailability).toBe(checkServiceAvailability);
    expect(servicesDefault.getStats).toBe(getServiceStats);
    expect(servicesDefault.config).toBe(serviceConfig);
  });

  test('serviceConfig should have expected shape', () => {
    expect(serviceConfig).toBeDefined();
    expect(typeof serviceConfig.baseURL).toBe('string');
    expect(serviceConfig.retryAttempts).toBeGreaterThanOrEqual(0);
    expect(serviceConfig.endpoints).toEqual(
      expect.objectContaining({
        auth: expect.any(String),
        users: expect.any(String),
        reviews: expect.any(String),
        reports: expect.any(String),
        rankings: expect.any(String),
        settings: expect.any(String),
      })
    );
    expect(typeof serviceConfig.mockMode).toBe('boolean');
    expect(serviceConfig.apiVersion).toBe('v1');
  });

  test('checkServiceAvailability returns availability summary', async () => {
    const res = await checkServiceAvailability();
    expect(res.success).toBe(true);
    expect(res.services).toEqual(expect.any(Object));
    expect(res.totalServices).toBeGreaterThan(0);
    expect(res.availableServices).toBeGreaterThan(0);
    expect(typeof res.timestamp).toBe('string');
  });

  test('initializeServices should complete and include config + availability', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const res = await initializeServices();
    expect(res.success).toBe(true);
    expect(res.config).toBe(serviceConfig);
    expect(res.availability).toEqual(
      expect.objectContaining({
        success: true,
        totalServices: expect.any(Number),
      })
    );
    spy.mockRestore();
  });

  test('getServiceStats returns expected structure', () => {
    const stats = getServiceStats();
    expect(stats.totalServices).toBeGreaterThan(0);
    expect(stats.serviceCategories).toEqual(
      expect.objectContaining({
        content: expect.any(Array),
        interaction: expect.any(Array),
        user: expect.any(Array),
        platform: expect.any(Array),
      })
    );
    expect(stats.features).toEqual(expect.any(Object));
    expect(stats.mockDataVolume).toEqual(expect.any(Object));
  });

  test('service groups should expose grouped modules', () => {
    expect(coreServices).toEqual(
      expect.objectContaining({ api: api, authService })
    );
    expect(contentServices).toEqual(
      expect.objectContaining({
        dashboardService,
        categoryService,
        novelService,
        chapterService,
      })
    );
    expect(interactionServices).toEqual(
      expect.objectContaining({ commentService, reviewService, reportService })
    );
    expect(userServices).toEqual(
      expect.objectContaining({ userService, libraryService })
    );
    expect(platformServices).toEqual(
      expect.objectContaining({
        rankingService,
        settingsService,
        analyticsService,
      })
    );
  });
});
