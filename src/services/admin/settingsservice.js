import api from './api';

// Generate mock settings data
const generateMockSettings = () => {
  return {
    // System settings
    system: {
      siteName: 'Yushan Novel Platform',
      siteDescription: 'Premium platform for reading and publishing novels',
      siteUrl: 'https://yushan.com',
      adminEmail: 'admin@yushan.com',
      supportEmail: 'support@yushan.com',
      contactEmail: 'contact@yushan.com',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'USD',
      currencySymbol: '$',

      // Feature flags
      maintenanceMode: false,
      registrationEnabled: true,
      commentsEnabled: true,
      reviewsEnabled: true,
      ratingsEnabled: true,
      bookmarksEnabled: true,
      collectionsEnabled: true,
      notificationsEnabled: true,
      reportsEnabled: true,
      analyticsEnabled: true,
      searchEnabled: true,

      // API settings
      apiRateLimit: 1000, // requests per hour
      apiTimeout: 30, // seconds
      apiVersion: 'v1.0',

      // File upload settings
      maxFileSize: 50, // MB
      allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      allowedDocumentTypes: ['pdf', 'doc', 'docx', 'txt'],

      // Security settings
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      passwordRequireNumbers: true,
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes

      updatedAt: new Date().toISOString(),
      updatedBy: 'admin_user',
    },

    // Content settings
    content: {
      // Novel settings
      maxChaptersPerNovel: 1000,
      maxChapterLength: 10000, // characters
      minChapterLength: 100,
      autoSaveInterval: 30, // seconds
      allowDrafts: true,
      requireModeration: false,

      // Comment settings
      maxCommentLength: 1000,
      allowNestedComments: true,
      maxCommentDepth: 3,
      commentModerationRequired: false,
      allowAnonymousComments: false,
      commentEditTimeLimit: 300, // seconds (5 minutes)

      // Review settings
      maxReviewLength: 5000,
      reviewModerationRequired: false,
      allowEditReviews: true,
      reviewEditTimeLimit: 3600, // seconds (1 hour)
      minRatingValue: 1,
      maxRatingValue: 5,

      // Search settings
      searchResultsPerPage: 20,
      maxSearchResults: 1000,
      searchIndexUpdateInterval: 60, // minutes
      enableFuzzySearch: true,
      searchMinLength: 2,

      updatedAt: new Date().toISOString(),
      updatedBy: 'content_admin',
    },

    // User settings
    user: {
      // Registration settings
      emailVerificationRequired: true,
      autoActivateAccounts: false,
      allowSocialLogin: true,
      defaultUserRole: 'reader',
      maxUsernameLength: 50,
      minUsernameLength: 3,

      // Profile settings
      allowProfileImages: true,
      maxProfileImageSize: 5, // MB
      allowBiography: true,
      maxBiographyLength: 500,
      allowSocialLinks: true,
      maxSocialLinks: 5,

      // Privacy settings
      defaultProfileVisibility: 'public',
      allowPrivateCollections: true,
      allowPrivateBookmarks: true,
      showReadingHistory: true,
      showReadingStats: true,

      // Notification settings
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      defaultNotificationSettings: {
        newChapter: true,
        newComment: true,
        newReview: false,
        systemUpdates: true,
        marketing: false,
      },

      updatedAt: new Date().toISOString(),
      updatedBy: 'user_admin',
    },

    // Moderation settings
    moderation: {
      // Auto moderation
      autoModerationEnabled: true,
      spamDetectionEnabled: true,
      profanityFilterEnabled: true,
      toxicityDetectionEnabled: true,

      // Thresholds
      spamScoreThreshold: 0.8,
      toxicityScoreThreshold: 0.7,
      flagCountThreshold: 5,

      // Actions
      autoHideSpam: true,
      autoHideToxic: false,
      autoFlagSuspicious: true,
      notifyModerators: true,

      // Review timeframes
      reportReviewTimeframe: 24, // hours
      escalationTimeframe: 72, // hours
      appealTimeframe: 168, // hours (7 days)

      // Moderation queue
      maxQueueSize: 1000,
      prioritizeReports: true,
      assignRandomly: false,

      updatedAt: new Date().toISOString(),
      updatedBy: 'moderation_admin',
    },

    // Analytics settings
    analytics: {
      // Google Analytics
      googleAnalyticsEnabled: true,
      googleAnalyticsId: 'GA-XXXXXXXXX',

      // Internal analytics
      trackPageViews: true,
      trackUserActions: true,
      trackReadingProgress: true,
      trackSearchQueries: true,
      trackDownloads: true,

      // Data retention
      analyticsRetentionDays: 365,
      userDataRetentionDays: 1095, // 3 years
      sessionRetentionDays: 30,

      // Privacy
      anonymizeIpAddresses: true,
      cookieConsentRequired: true,
      gdrpCompliant: true,

      // Reporting
      dailyReportsEnabled: true,
      weeklyReportsEnabled: true,
      monthlyReportsEnabled: true,
      customReportsEnabled: true,

      updatedAt: new Date().toISOString(),
      updatedBy: 'analytics_admin',
    },

    // Email settings
    email: {
      // SMTP configuration
      smtpEnabled: true,
      smtpHost: 'smtp.yushan.com',
      smtpPort: 587,
      smtpSecurity: 'tls',
      smtpUsername: 'noreply@yushan.com',
      smtpPassword: '********', // Hidden for security

      // Email templates
      enableHtmlEmails: true,
      emailSignature: 'Best regards,\nYushan Team',
      supportEmailAddress: 'support@yushan.com',

      // Rate limiting
      emailRateLimit: 100, // emails per hour
      maxEmailsPerUser: 10, // per day

      // Email types
      welcomeEmailEnabled: true,
      passwordResetEnabled: true,
      emailVerificationEnabled: true,
      notificationEmailsEnabled: true,
      marketingEmailsEnabled: true,

      updatedAt: new Date().toISOString(),
      updatedBy: 'system_admin',
    },

    // SEO settings
    seo: {
      // Meta settings
      defaultMetaTitle: 'Yushan - Premium Novel Reading Platform',
      defaultMetaDescription:
        'Discover, read, and share amazing novels on Yushan platform.',
      defaultMetaKeywords: 'novels, reading, books, stories, fiction',

      // Social media
      ogImageUrl: 'https://yushan.com/assets/og-image.jpg',
      twitterCardType: 'summary_large_image',
      facebookAppId: '1234567890',

      // Structured data
      enableStructuredData: true,
      enableBreadcrumbs: true,
      enableSitelinks: true,

      // Sitemap
      sitemapEnabled: true,
      sitemapUpdateFrequency: 'daily',
      maxSitemapUrls: 50000,

      // Robots
      robotsTxtEnabled: true,
      indexFollowDefault: true,

      updatedAt: new Date().toISOString(),
      updatedBy: 'seo_admin',
    },

    // Payment settings
    payment: {
      // Payment gateways
      stripeEnabled: true,
      paypalEnabled: true,
      coinbaseEnabled: false,

      // Currencies
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
      defaultCurrency: 'USD',

      // Subscriptions
      subscriptionsEnabled: true,
      freeTrialDays: 7,
      allowCancellation: true,
      refundPeriodDays: 30,

      // Transactions
      minimumTransactionAmount: 1.0,
      maximumTransactionAmount: 1000.0,
      transactionFeePercentage: 2.9,

      // Author payments
      authorPayoutsEnabled: true,
      authorCommissionRate: 70, // 70% to author, 30% to platform
      minimumPayoutAmount: 25.0,
      payoutSchedule: 'monthly',

      updatedAt: new Date().toISOString(),
      updatedBy: 'finance_admin',
    },

    // CDN and Storage settings
    storage: {
      // File storage
      storageProvider: 'aws_s3',
      bucketName: 'yushan-assets',
      region: 'us-east-1',
      enableCdn: true,
      cdnUrl: 'https://cdn.yushan.com',

      // Image optimization
      enableImageOptimization: true,
      imageQuality: 85,
      generateThumbnails: true,
      thumbnailSizes: [150, 300, 600],

      // Backup settings
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      offSiteBackupEnabled: true,

      updatedAt: new Date().toISOString(),
      updatedBy: 'devops_admin',
    },
  };
};

const mockSettings = generateMockSettings();

export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    try {
      await api.delay(600);

      return {
        success: true,
        data: mockSettings,
      };
    } catch (error) {
      throw new Error('Failed to fetch settings');
    }
  },

  // Get settings by category
  getSettingsByCategory: async (category) => {
    try {
      await api.delay(400);

      if (!mockSettings[category]) {
        throw new Error('Settings category not found');
      }

      return {
        success: true,
        data: mockSettings[category],
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch settings category');
    }
  },

  // Update settings for a category
  updateSettings: async (category, settingsData) => {
    try {
      await api.delay(600);

      if (!mockSettings[category]) {
        throw new Error('Settings category not found');
      }

      // Merge with existing settings
      mockSettings[category] = {
        ...mockSettings[category],
        ...settingsData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin_user', // In real app, this would be the actual user
      };

      return {
        success: true,
        data: mockSettings[category],
        message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update settings');
    }
  },

  // Reset settings to defaults for a category
  resetSettings: async (category) => {
    try {
      await api.delay(500);

      if (!mockSettings[category]) {
        throw new Error('Settings category not found');
      }

      // Reset to defaults (simplified - in real app, would have actual defaults)
      const defaultSettings = generateMockSettings()[category];
      mockSettings[category] = {
        ...defaultSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin_user',
      };

      return {
        success: true,
        data: mockSettings[category],
        message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings reset to defaults`,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to reset settings');
    }
  },

  // Test email settings
  testEmailSettings: async (emailData) => {
    try {
      await api.delay(1000); // Simulate email sending delay

      // eslint-disable-next-line no-unused-vars
      const { recipient, subject, message } = emailData;

      // Simulate email test
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        return {
          success: true,
          message: `Test email sent successfully to ${recipient}`,
          data: {
            recipient,
            subject,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        throw new Error(
          'Failed to send test email. Please check SMTP configuration.'
        );
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to test email settings');
    }
  },

  // Validate settings
  validateSettings: async (category, settingsData) => {
    try {
      await api.delay(300);

      const errors = [];
      const warnings = [];

      // Basic validation based on category
      switch (category) {
        case 'system':
          if (!settingsData.siteName || settingsData.siteName.length < 3) {
            errors.push('Site name must be at least 3 characters long');
          }
          if (
            !settingsData.adminEmail ||
            !isValidEmail(settingsData.adminEmail)
          ) {
            errors.push('Valid admin email is required');
          }
          if (
            settingsData.passwordMinLength &&
            settingsData.passwordMinLength < 6
          ) {
            warnings.push(
              'Password minimum length less than 6 is not recommended'
            );
          }
          break;

        case 'content':
          if (
            settingsData.maxChapterLength &&
            settingsData.maxChapterLength < 100
          ) {
            errors.push(
              'Maximum chapter length must be at least 100 characters'
            );
          }
          if (
            settingsData.maxCommentLength &&
            settingsData.maxCommentLength < 50
          ) {
            warnings.push(
              'Very short comment length may limit user expression'
            );
          }
          break;

        case 'email':
          if (!settingsData.smtpHost || !settingsData.smtpUsername) {
            errors.push('SMTP host and username are required');
          }
          if (settingsData.emailRateLimit && settingsData.emailRateLimit < 10) {
            warnings.push(
              'Very low email rate limit may cause delivery delays'
            );
          }
          break;

        case 'payment':
          if (
            settingsData.authorCommissionRate &&
            (settingsData.authorCommissionRate < 0 ||
              settingsData.authorCommissionRate > 100)
          ) {
            errors.push('Author commission rate must be between 0 and 100');
          }
          if (
            settingsData.minimumPayoutAmount &&
            settingsData.minimumPayoutAmount < 1
          ) {
            errors.push('Minimum payout amount must be at least $1');
          }
          break;
      }

      return {
        success: true,
        data: {
          isValid: errors.length === 0,
          errors,
          warnings,
        },
      };
    } catch (error) {
      throw new Error('Failed to validate settings');
    }
  },

  // Get system status
  getSystemStatus: async () => {
    try {
      await api.delay(400);

      // Simulate system status checks
      const status = {
        database: Math.random() > 0.05 ? 'healthy' : 'warning', // 95% healthy
        redis: Math.random() > 0.03 ? 'healthy' : 'error', // 97% healthy
        storage: Math.random() > 0.02 ? 'healthy' : 'warning', // 98% healthy
        email: Math.random() > 0.1 ? 'healthy' : 'error', // 90% healthy
        cdn: Math.random() > 0.05 ? 'healthy' : 'warning', // 95% healthy
        search: Math.random() > 0.08 ? 'healthy' : 'warning', // 92% healthy
      };

      const overallStatus = Object.values(status).every((s) => s === 'healthy')
        ? 'healthy'
        : Object.values(status).some((s) => s === 'error')
          ? 'error'
          : 'warning';

      return {
        success: true,
        data: {
          overall: overallStatus,
          services: status,
          lastChecked: new Date().toISOString(),
          uptime: '99.9%',
          version: '1.0.0',
          environment: 'production',
        },
      };
    } catch (error) {
      throw new Error('Failed to get system status');
    }
  },

  // Export settings
  exportSettings: async () => {
    try {
      await api.delay(800);

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        settings: mockSettings,
      };

      return {
        success: true,
        data: exportData,
        message: 'Settings exported successfully',
      };
    } catch (error) {
      throw new Error('Failed to export settings');
    }
  },

  // Import settings
  importSettings: async (importData) => {
    try {
      await api.delay(1000);

      const { settings, overwrite = false } = importData;

      if (!settings || typeof settings !== 'object') {
        throw new Error('Invalid settings data');
      }

      // Validate import data
      const requiredCategories = ['system', 'content', 'user', 'moderation'];
      const missingCategories = requiredCategories.filter(
        (cat) => !settings[cat]
      );

      if (missingCategories.length > 0) {
        throw new Error(
          `Missing required categories: ${missingCategories.join(', ')}`
        );
      }

      // Import settings
      Object.keys(settings).forEach((category) => {
        if (mockSettings[category]) {
          if (overwrite) {
            mockSettings[category] = {
              ...settings[category],
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin_user',
            };
          } else {
            mockSettings[category] = {
              ...mockSettings[category],
              ...settings[category],
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin_user',
            };
          }
        }
      });

      return {
        success: true,
        data: mockSettings,
        message: 'Settings imported successfully',
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to import settings');
    }
  },

  // Get settings history (for audit purposes)
  getSettingsHistory: async (category = null, limit = 50) => {
    try {
      await api.delay(500);

      // Generate mock history data
      const history = [];
      for (let i = 0; i < limit; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000); // Past days
        const categories = category ? [category] : Object.keys(mockSettings);
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        history.push({
          id: i + 1,
          category: randomCategory,
          action: Math.random() > 0.8 ? 'reset' : 'update',
          changedBy: `admin_user_${Math.floor(Math.random() * 5) + 1}`,
          changes: {
            field: 'exampleSetting',
            oldValue: 'oldValue',
            newValue: 'newValue',
          },
          timestamp: date.toISOString(),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        });
      }

      return {
        success: true,
        data: history,
        total: history.length,
      };
    } catch (error) {
      throw new Error('Failed to fetch settings history');
    }
  },

  // Get available setting categories
  getSettingCategories: async () => {
    try {
      await api.delay(200);

      const categories = [
        {
          id: 'system',
          name: 'System',
          description: 'Core system configuration',
        },
        {
          id: 'content',
          name: 'Content',
          description: 'Content management settings',
        },
        {
          id: 'user',
          name: 'User',
          description: 'User management and preferences',
        },
        {
          id: 'moderation',
          name: 'Moderation',
          description: 'Content moderation settings',
        },
        {
          id: 'analytics',
          name: 'Analytics',
          description: 'Analytics and tracking settings',
        },
        {
          id: 'email',
          name: 'Email',
          description: 'Email configuration and templates',
        },
        {
          id: 'seo',
          name: 'SEO',
          description: 'Search engine optimization settings',
        },
        {
          id: 'payment',
          name: 'Payment',
          description: 'Payment gateway and billing settings',
        },
        {
          id: 'storage',
          name: 'Storage',
          description: 'File storage and CDN settings',
        },
      ];

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new Error('Failed to fetch setting categories');
    }
  },
};

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default settingsService;
