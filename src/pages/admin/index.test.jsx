import * as AdminPages from './index';

// Mock all the imported modules to avoid actual component imports during testing
jest.mock('./adminlayout', () => 'AdminLayout');
jest.mock('./login', () => 'AdminLogin');
jest.mock('./dashboard', () => 'Dashboard');
jest.mock('./profile', () => 'AdminProfile');
jest.mock('./users', () => 'UsersOverview');
jest.mock('./users/readers', () => 'Readers');
jest.mock('./users/writers', () => 'Writers');
jest.mock('./novels', () => 'Novels');
jest.mock('./chapters', () => 'Chapters');
jest.mock('./categories', () => 'Categories');
jest.mock('./comments', () => 'Comments');
jest.mock('./reviews', () => 'Reviews');
jest.mock('./library', () => 'Library');
jest.mock('./rankings', () => 'Rankings');
jest.mock('./yuan', () => 'Yuan');
jest.mock('./yuan/yuanstatistics', () => 'YuanStatistics');
jest.mock('./reports', () => 'Reports');
jest.mock('./settings', () => 'Settings');

describe('Admin Pages Index', () => {
  describe('Layout Components', () => {
    test('exports AdminLayout', () => {
      expect(AdminPages.AdminLayout).toBe('AdminLayout');
    });

    test('exports AdminLogin', () => {
      expect(AdminPages.AdminLogin).toBe('AdminLogin');
    });
  });

  describe('Main Pages', () => {
    test('exports Dashboard', () => {
      expect(AdminPages.Dashboard).toBe('Dashboard');
    });

    test('exports AdminProfile', () => {
      expect(AdminPages.AdminProfile).toBe('AdminProfile');
    });
  });

  describe('User Management Pages', () => {
    test('exports UsersOverview', () => {
      expect(AdminPages.UsersOverview).toBe('UsersOverview');
    });

    test('exports Readers', () => {
      expect(AdminPages.Readers).toBe('Readers');
    });

    test('exports Writers', () => {
      expect(AdminPages.Writers).toBe('Writers');
    });
  });

  describe('Content Management Pages', () => {
    test('exports Novels', () => {
      expect(AdminPages.Novels).toBe('Novels');
    });

    test('exports Chapters', () => {
      expect(AdminPages.Chapters).toBe('Chapters');
    });

    test('exports Categories', () => {
      expect(AdminPages.Categories).toBe('Categories');
    });
  });

  describe('Interaction Management Pages', () => {
    test('exports Comments', () => {
      expect(AdminPages.Comments).toBe('Comments');
    });

    test('exports Reviews', () => {
      expect(AdminPages.Reviews).toBe('Reviews');
    });

    test('exports Library', () => {
      expect(AdminPages.Library).toBe('Library');
    });
  });

  describe('Analytics & Rankings Pages', () => {
    test('exports Rankings', () => {
      expect(AdminPages.Rankings).toBe('Rankings');
    });

    test('exports Yuan', () => {
      expect(AdminPages.Yuan).toBe('Yuan');
    });

    test('exports YuanStatistics', () => {
      expect(AdminPages.YuanStatistics).toBe('YuanStatistics');
    });
  });

  describe('Moderation & Settings Pages', () => {
    test('exports Reports', () => {
      expect(AdminPages.Reports).toBe('Reports');
    });

    test('exports Settings', () => {
      expect(AdminPages.Settings).toBe('Settings');
    });
  });

  describe('Export Completeness', () => {
    test('exports all expected components', () => {
      const expectedExports = [
        'AdminLayout',
        'AdminLogin',
        'Dashboard',
        'AdminProfile',
        'UsersOverview',
        'Readers',
        'Writers',
        'Novels',
        'Chapters',
        'Categories',
        'Comments',
        'Reviews',
        'Library',
        'Rankings',
        'Yuan',
        'YuanStatistics',
        'Reports',
        'Settings',
      ];

      expectedExports.forEach((exportName) => {
        expect(AdminPages).toHaveProperty(exportName);
        expect(AdminPages[exportName]).toBeDefined();
        expect(AdminPages[exportName]).not.toBeNull();
      });
    });

    test('has correct number of exports', () => {
      const exportCount = Object.keys(AdminPages).length;
      expect(exportCount).toBe(18); // All expected exports
    });

    test('all exports are default exports', () => {
      Object.values(AdminPages).forEach((exportValue) => {
        expect(typeof exportValue).toBe('string'); // Mocked as strings
      });
    });
  });

  describe('Import/Export Structure', () => {
    test('can import all components individually', () => {
      // Test that we can destructure all exports
      const {
        AdminLayout,
        AdminLogin,
        Dashboard,
        AdminProfile,
        UsersOverview,
        Readers,
        Writers,
        Novels,
        Chapters,
        Categories,
        Comments,
        Reviews,
        Library,
        Rankings,
        Yuan,
        YuanStatistics,
        Reports,
        Settings,
      } = AdminPages;

      expect(AdminLayout).toBeDefined();
      expect(AdminLogin).toBeDefined();
      expect(Dashboard).toBeDefined();
      expect(AdminProfile).toBeDefined();
      expect(UsersOverview).toBeDefined();
      expect(Readers).toBeDefined();
      expect(Writers).toBeDefined();
      expect(Novels).toBeDefined();
      expect(Chapters).toBeDefined();
      expect(Categories).toBeDefined();
      expect(Comments).toBeDefined();
      expect(Reviews).toBeDefined();
      expect(Library).toBeDefined();
      expect(Rankings).toBeDefined();
      expect(Yuan).toBeDefined();
      expect(YuanStatistics).toBeDefined();
      expect(Reports).toBeDefined();
      expect(Settings).toBeDefined();
    });

    test('maintains export consistency', () => {
      // Ensure exports haven't changed unexpectedly
      const exports = Object.keys(AdminPages).sort();
      const expected = [
        'AdminLayout',
        'AdminLogin',
        'AdminProfile',
        'Categories',
        'Chapters',
        'Comments',
        'Dashboard',
        'Library',
        'Novels',
        'Rankings',
        'Readers',
        'Reports',
        'Reviews',
        'Settings',
        'UsersOverview',
        'Writers',
        'Yuan',
        'YuanStatistics',
      ].sort();

      expect(exports).toEqual(expected);
    });
  });

  describe('Module Organization', () => {
    test('groups related components logically', () => {
      // User management group
      expect(AdminPages.UsersOverview).toBeDefined();
      expect(AdminPages.Readers).toBeDefined();
      expect(AdminPages.Writers).toBeDefined();

      // Content management group
      expect(AdminPages.Novels).toBeDefined();
      expect(AdminPages.Chapters).toBeDefined();
      expect(AdminPages.Categories).toBeDefined();

      // Interaction management group
      expect(AdminPages.Comments).toBeDefined();
      expect(AdminPages.Reviews).toBeDefined();
      expect(AdminPages.Library).toBeDefined();

      // Analytics group
      expect(AdminPages.Rankings).toBeDefined();
      expect(AdminPages.Yuan).toBeDefined();
      expect(AdminPages.YuanStatistics).toBeDefined();

      // Moderation group
      expect(AdminPages.Reports).toBeDefined();
      expect(AdminPages.Settings).toBeDefined();
    });

    test('includes core layout components', () => {
      expect(AdminPages.AdminLayout).toBeDefined();
      expect(AdminPages.AdminLogin).toBeDefined();
      expect(AdminPages.Dashboard).toBeDefined();
      expect(AdminPages.AdminProfile).toBeDefined();
    });
  });
});
