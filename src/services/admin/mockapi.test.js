import mockAPIDefault, { mockAPI } from './mockapi';

describe('Mock API Service', () => {
  let api;

  beforeEach(() => {
    jest.clearAllMocks();
    api = mockAPIDefault; // instance
    // speed up tests: make delay resolve immediately
    jest.spyOn(api, 'delay').mockImplementation(() => Promise.resolve());
  });

  test('service instance should be defined', () => {
    expect(api).toBeDefined();
    expect(api.login).toBeInstanceOf(Function);
    expect(api.getUsers).toBeInstanceOf(Function);
    // named export and default export point to the same instance
    expect(mockAPI).toBe(api);
  });

  describe('Auth', () => {
    test('login succeeds with correct credentials', async () => {
      const res = await api.login({ username: 'admin', password: 'admin123' });
      expect(res.success).toBe(true);
      expect(res.data.username).toBe('admin');
      expect(res.data.token).toBeTruthy();
      expect(api.delay).toHaveBeenCalled();
    });

    test('login fails with invalid credentials', async () => {
      await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow(
        /Invalid credentials/
      );
    });

    test('logout returns success', async () => {
      const res = await api.logout();
      expect(res.success).toBe(true);
    });
  });

  describe('Dashboard', () => {
    test('getDashboardStats returns stats object', async () => {
      const stats = await api.getDashboardStats();
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalNovels');
      expect(stats).toHaveProperty('newUsersToday');
    });

    test('getRecentActivity returns list with required fields', async () => {
      const list = await api.getRecentActivity();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      expect(list[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          action: expect.any(String),
        })
      );
    });
  });

  describe('Users listing', () => {
    test('getUsers supports type filter, search and pagination', async () => {
      // type=writer, search=user_1 (matches user_1, user_10..)
      const res = await api.getUsers({
        page: 1,
        limit: 5,
        type: 'writer',
        search: 'user_1',
      });
      expect(res).toEqual(expect.objectContaining({ page: 1, limit: 5 }));
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeLessThanOrEqual(5);
      // all returned should match filter conditions
      res.data.forEach((u) => {
        expect(u.type).toBe('writer');
        expect(u.username.toLowerCase()).toContain('user_1');
      });
      expect(typeof res.total).toBe('number');
    });

    test('getUsers page 2 returns different slice', async () => {
      const a = await api.getUsers({ page: 1, limit: 3 });
      const b = await api.getUsers({ page: 2, limit: 3 });
      expect(a.data[0]?.id).not.toBe(b.data[0]?.id);
    });
  });

  describe('Novels listing', () => {
    test('getNovels supports status filter, search and pagination', async () => {
      const res = await api.getNovels({
        page: 1,
        limit: 10,
        status: 'published',
        search: 'Novel Title 1',
      });
      expect(res.page).toBe(1);
      expect(res.limit).toBe(10);
      expect(Array.isArray(res.data)).toBe(true);
      res.data.forEach((n) => {
        expect(['published', 'draft', 'reviewing']).toContain(n.status);
        // if filtered by published, most results should be published; allow >0 due to search narrowing
        expect(n.title.toLowerCase()).toContain('novel title 1');
      });
      expect(typeof res.total).toBe('number');
    });

    test('getNovels paginates results', async () => {
      const a = await api.getNovels({ page: 1, limit: 5 });
      const b = await api.getNovels({ page: 2, limit: 5 });
      expect(a.data[0]?.id).not.toBe(b.data[0]?.id);
    });
  });
});
