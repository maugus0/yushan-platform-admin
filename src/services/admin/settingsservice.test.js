// Mock api.delay to resolve immediately
jest.mock('./api', () => ({
  __esModule: true,
  default: {
    delay: jest.fn(() => Promise.resolve()),
  },
}));

describe('settingsservice', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    // fresh module state for each test (mockSettings reinitialized)
    jest.resetModules();
    // eslint-disable-next-line global-require
    service = require('./settingsservice').default;
  });

  describe('structure', () => {
    test('service should be defined and have methods', () => {
      expect(service).toBeDefined();
      expect(typeof service).toBe('object');
      const keys = Object.keys(service);
      expect(keys.length).toBeGreaterThan(0);
    });
  });

  describe('getAllSettings', () => {
    test('returns full settings with success', async () => {
      const res = await service.getAllSettings();
      expect(res.success).toBe(true);
      expect(res.data).toHaveProperty('system');
      expect(res.data).toHaveProperty('content');
      expect(res.data).toHaveProperty('user');
      expect(res.data).toHaveProperty('moderation');
      expect(res.data).toHaveProperty('analytics');
      expect(res.data).toHaveProperty('email');
      expect(res.data).toHaveProperty('seo');
      expect(res.data).toHaveProperty('payment');
      expect(res.data).toHaveProperty('storage');
    });
  });

  describe('getSettingsByCategory', () => {
    test('returns category data for system', async () => {
      const res = await service.getSettingsByCategory('system');
      expect(res.success).toBe(true);
      expect(res.data).toHaveProperty('siteName');
      expect(res.data).toHaveProperty('maintenanceMode');
    });

    test('throws when category not found', async () => {
      await expect(service.getSettingsByCategory('unknown')).rejects.toThrow(
        /Settings category not found/i
      );
    });
  });

  describe('updateSettings', () => {
    test('merges and updates settings for a category', async () => {
      const res = await service.updateSettings('system', {
        siteName: 'New Site',
        maintenanceMode: true,
      });
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/System settings updated successfully/);
      expect(res.data.siteName).toBe('New Site');
      expect(res.data.maintenanceMode).toBe(true);
      expect(res.data.updatedAt).toBeDefined();
      expect(res.data.updatedBy).toBe('admin_user');
    });

    test('throws on unknown category', async () => {
      await expect(service.updateSettings('nope', {})).rejects.toThrow(
        /Settings category not found/i
      );
    });
  });

  describe('resetSettings', () => {
    test('resets settings for a category to defaults', async () => {
      // first modify, then reset
      await service.updateSettings('email', { smtpHost: 'custom.smtp' });
      const res = await service.resetSettings('email');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/Email settings reset to defaults/);
      // default is smtpHost: 'smtp.yushan.com'
      expect(res.data.smtpHost).toBe('smtp.yushan.com');
    });

    test('throws on unknown category', async () => {
      await expect(service.resetSettings('unknown')).rejects.toThrow(
        /Settings category not found/i
      );
    });
  });

  describe('testEmailSettings', () => {
    test('succeeds when Math.random indicates success', async () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.1 => success
      const res = await service.testEmailSettings({
        recipient: 'user@example.com',
        subject: 'Test',
        message: 'Hello',
      });
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/Test email sent successfully/i);
      expect(res.data.recipient).toBe('user@example.com');
      spy.mockRestore();
    });

    test('fails when Math.random indicates failure', async () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.05); // <= 0.1 => fail
      await expect(
        service.testEmailSettings({
          recipient: 'user@example.com',
          subject: 'Test',
          message: 'Hello',
        })
      ).rejects.toThrow(/Failed to send test email/i);
      spy.mockRestore();
    });
  });

  describe('validateSettings', () => {
    test('system: returns errors and warnings', async () => {
      const res = await service.validateSettings('system', {
        siteName: 'aa', // too short
        adminEmail: 'invalid',
        passwordMinLength: 5, // warning
      });
      expect(res.success).toBe(true);
      expect(res.data.isValid).toBe(false);
      expect(res.data.errors).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Site name must be at least/i),
          expect.stringMatching(/Valid admin email is required/i),
        ])
      );
      expect(res.data.warnings).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Password minimum length/i),
        ])
      );
    });

    test('content: returns errors/warnings accordingly', async () => {
      const res = await service.validateSettings('content', {
        maxChapterLength: 50, // error
        maxCommentLength: 40, // warning
      });
      expect(res.data.isValid).toBe(false);
      expect(res.data.errors.join(' ')).toMatch(/Maximum chapter length/i);
      expect(res.data.warnings.join(' ')).toMatch(/Very short comment length/i);
    });

    test('email: returns errors/warnings accordingly', async () => {
      const res = await service.validateSettings('email', {
        smtpHost: '',
        smtpUsername: '',
        emailRateLimit: 5, // warning
      });
      expect(res.data.isValid).toBe(false);
      expect(res.data.errors.join(' ')).toMatch(/SMTP host and username/i);
      expect(res.data.warnings.join(' ')).toMatch(/Very low email rate limit/i);
    });

    test('payment: returns errors for invalid ranges', async () => {
      const res = await service.validateSettings('payment', {
        authorCommissionRate: 200,
        minimumPayoutAmount: 0.5,
      });
      expect(res.data.isValid).toBe(false);
      expect(res.data.errors.join(' ')).toMatch(/commission rate/i);
      expect(res.data.errors.join(' ')).toMatch(/at least \$1/i);
    });
  });

  describe('getSystemStatus', () => {
    test('healthy when all randoms indicate healthy', async () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const res = await service.getSystemStatus();
      expect(res.success).toBe(true);
      expect(res.data.overall).toBe('healthy');
      spy.mockRestore();
    });

    test('error when any service indicates error', async () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.0);
      const res = await service.getSystemStatus();
      expect(res.success).toBe(true);
      expect(['error', 'warning']).toContain(res.data.overall);
      spy.mockRestore();
    });
  });

  describe('exportSettings', () => {
    test('exports settings package with message', async () => {
      const res = await service.exportSettings();
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/Settings exported successfully/i);
      expect(res.data).toHaveProperty('exportedAt');
      expect(res.data).toHaveProperty('settings');
    });
  });

  describe('importSettings', () => {
    test('throws on invalid settings data', async () => {
      await expect(service.importSettings({ settings: null })).rejects.toThrow(
        /Invalid settings data/i
      );
    });

    test('throws on missing required categories', async () => {
      await expect(
        service.importSettings({ settings: { system: {} }, overwrite: false })
      ).rejects.toThrow(/Missing required categories/i);
    });

    test('imports settings (merge) and (overwrite)', async () => {
      const baseSettings = {
        system: { siteName: 'Imported Name' },
        content: { allowDrafts: false },
        user: { defaultUserRole: 'writer' },
        moderation: { autoModerationEnabled: false },
      };

      // merge import
      const mergeRes = await service.importSettings({
        settings: baseSettings,
        overwrite: false,
      });
      expect(mergeRes.success).toBe(true);
      expect(mergeRes.data.system.siteName).toBe('Imported Name');
      expect(mergeRes.data.user.defaultUserRole).toBe('writer');

      // overwrite import: set a new system value that will replace previous
      const overwriteRes = await service.importSettings({
        settings: {
          system: { siteName: 'Overwrite Name' },
          content: { allowDrafts: true },
          user: { defaultUserRole: 'reader' },
          moderation: { autoModerationEnabled: true },
        },
        overwrite: true,
      });
      expect(overwriteRes.success).toBe(true);
      expect(overwriteRes.data.system.siteName).toBe('Overwrite Name');
    });
  });

  describe('getSettingsHistory', () => {
    test('returns history of given limit and category', async () => {
      const res = await service.getSettingsHistory('system', 5);
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(5);
      expect(res.data.every((h) => h.category === 'system')).toBe(true);
    });
  });

  describe('getSettingCategories', () => {
    test('returns supported categories list', async () => {
      const res = await service.getSettingCategories();
      expect(res.success).toBe(true);
      const ids = res.data.map((c) => c.id);
      expect(ids).toEqual(
        expect.arrayContaining([
          'system',
          'content',
          'user',
          'moderation',
          'analytics',
          'email',
          'seo',
          'payment',
          'storage',
        ])
      );
    });
  });
});
