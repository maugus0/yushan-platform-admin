import {
  STATUS_DEFINITIONS,
  PRIORITY_DEFINITIONS,
  getStatusConfig,
  getPriorityConfig,
  getStatusBadgeProps,
  getStatusTagProps,
  getStatusTransitions,
  isValidStatusTransition,
  getStatusStatistics,
  filterByStatus,
  sortByStatusPriority,
  getStatusColor,
  formatStatus,
  formatStatusHistory,
} from './statusutils';

describe('Status Utilities', () => {
  describe('STATUS_DEFINITIONS', () => {
    test('defines user statuses', () => {
      expect(STATUS_DEFINITIONS.USER).toBeDefined();
      expect(STATUS_DEFINITIONS.USER.active).toHaveProperty('label');
      expect(STATUS_DEFINITIONS.USER.active).toHaveProperty('color');
    });

    test('defines novel statuses', () => {
      expect(STATUS_DEFINITIONS.NOVEL).toBeDefined();
      expect(STATUS_DEFINITIONS.NOVEL.draft).toBeDefined();
    });

    test('defines all major status categories', () => {
      const categories = [
        'USER',
        'NOVEL',
        'CHAPTER',
        'COMMENT',
        'REVIEW',
        'REPORT',
        'TRANSACTION',
        'SUBSCRIPTION',
        'SYSTEM',
      ];
      categories.forEach((cat) => {
        expect(STATUS_DEFINITIONS[cat]).toBeDefined();
      });
    });

    test('each status has label and color', () => {
      Object.entries(STATUS_DEFINITIONS.USER).forEach(([_, status]) => {
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('variant');
      });
    });
  });

  describe('PRIORITY_DEFINITIONS', () => {
    test('defines all priority levels', () => {
      expect(PRIORITY_DEFINITIONS.low).toBeDefined();
      expect(PRIORITY_DEFINITIONS.normal).toBeDefined();
      expect(PRIORITY_DEFINITIONS.medium).toBeDefined();
      expect(PRIORITY_DEFINITIONS.high).toBeDefined();
      expect(PRIORITY_DEFINITIONS.urgent).toBeDefined();
      expect(PRIORITY_DEFINITIONS.critical).toBeDefined();
    });

    test('each priority has label, color, and icon', () => {
      Object.entries(PRIORITY_DEFINITIONS).forEach(([_, priority]) => {
        expect(priority).toHaveProperty('label');
        expect(priority).toHaveProperty('color');
        expect(priority).toHaveProperty('icon');
      });
    });
  });

  describe('getStatusConfig', () => {
    test('returns status configuration for valid category and status', () => {
      const config = getStatusConfig('USER', 'active');
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config.label).toBe('活跃');
    });

    test('handles case-insensitive input', () => {
      const config1 = getStatusConfig('user', 'active');
      const config2 = getStatusConfig('USER', 'ACTIVE');
      expect(config1.label).toEqual(config2.label);
    });

    test('returns default for invalid category', () => {
      const config = getStatusConfig('INVALID', 'status');
      expect(config.color).toBe('default');
      expect(config.variant).toBe('outlined');
    });

    test('returns default for invalid status', () => {
      const config = getStatusConfig('USER', 'invalid_status');
      expect(config.color).toBe('default');
    });

    test('handles all major status categories', () => {
      const categories = ['USER', 'NOVEL', 'CHAPTER', 'COMMENT', 'REVIEW'];
      categories.forEach((cat) => {
        const statuses = Object.keys(STATUS_DEFINITIONS[cat]);
        statuses.forEach((status) => {
          const config = getStatusConfig(cat, status);
          expect(config).toHaveProperty('label');
          expect(config).toHaveProperty('color');
        });
      });
    });
  });

  describe('getPriorityConfig', () => {
    test('returns mapped priority config', () => {
      const cfg = getPriorityConfig('high');
      expect(cfg).toEqual(
        expect.objectContaining({
          label: '高',
          color: 'error',
          icon: expect.any(String),
        })
      );
    });

    test('returns default for unknown priority', () => {
      const cfg = getPriorityConfig('unknown-pri');
      expect(cfg).toEqual(
        expect.objectContaining({
          label: 'unknown-pri',
          color: 'default',
          icon: '❓',
        })
      );
    });
  });

  describe('getStatusBadgeProps', () => {
    test('maps USER.active to antd badge props', () => {
      const props = getStatusBadgeProps('USER', 'active');
      expect(props).toEqual(
        expect.objectContaining({
          status: 'processing',
          color: 'green',
          text: '活跃',
        })
      );
    });

    test('outlined variant maps to default status', () => {
      const props = getStatusBadgeProps('NOVEL', 'archived'); // variant outlined in defs
      expect(props.status).toBe('default');
    });
  });

  describe('getStatusTagProps', () => {
    test('maps NOVEL.published to blue tag', () => {
      const props = getStatusTagProps('NOVEL', 'published');
      expect(props).toEqual(
        expect.objectContaining({
          color: 'blue',
          bordered: false,
          children: '已发布',
        })
      );
    });

    test('outlined becomes bordered', () => {
      const props = getStatusTagProps('USER', 'banned'); // outlined in defs
      expect(props.bordered).toBe(true);
    });
  });

  describe('getStatusTransitions and isValidStatusTransition', () => {
    test('returns transitions for NOVEL.draft', () => {
      const t = getStatusTransitions('NOVEL', 'draft');
      const values = t.map((x) => x.value);
      expect(values).toEqual(['pending']);
      expect(t[0].label).toBe('待审核');
    });

    test('invalid category/status returns empty array', () => {
      expect(getStatusTransitions('NOPE', 'draft')).toEqual([]);
      expect(getStatusTransitions('NOVEL', 'nope')).toEqual([]);
    });

    test('validates transition rules', () => {
      expect(isValidStatusTransition('NOVEL', 'draft', 'pending')).toBe(true);
      expect(isValidStatusTransition('NOVEL', 'draft', 'published')).toBe(
        false
      );
    });
  });

  describe('getStatusStatistics', () => {
    test('builds counts and percentages with configs', () => {
      const items = [
        { status: 'active' },
        { status: 'active' },
        { status: 'inactive' },
      ];
      const stats = getStatusStatistics(items, 'USER');
      expect(stats.active.count).toBe(2);
      expect(stats.inactive.count).toBe(1);
      expect(stats.active.percentage).toBeCloseTo((2 / 3) * 100, 5);
      expect(stats.active.config.label).toBe('活跃');
    });

    test('non-array returns empty object', () => {
      expect(getStatusStatistics(null, 'USER')).toEqual({});
    });
  });

  describe('filterByStatus', () => {
    test('filters by a single status', () => {
      const items = [{ status: 'approved' }, { status: 'rejected' }];
      const res = filterByStatus(items, 'approved');
      expect(res).toHaveLength(1);
      expect(res[0].status).toBe('approved');
    });

    test('filters by multiple statuses', () => {
      const items = [
        { status: 'approved' },
        { status: 'rejected' },
        { status: 'pending' },
      ];
      const res = filterByStatus(items, ['approved', 'pending']);
      expect(res.map((x) => x.status)).toEqual(
        expect.arrayContaining(['approved', 'pending'])
      );
    });
  });

  describe('sortByStatusPriority', () => {
    test('sorts ascending by internal priority map', () => {
      const items = [
        { status: 'pending' }, // 10
        { status: 'approved' }, // 6
        { status: 'archived' }, // 1
        { status: 'deleted' }, // 0
      ];
      const asc = sortByStatusPriority(items, 'NOVEL', 'status', 'asc').map(
        (x) => x.status
      );
      expect(asc).toEqual(['deleted', 'archived', 'approved', 'pending']);
    });

    test('sorts descending by internal priority map', () => {
      const items = [
        { status: 'pending' },
        { status: 'approved' },
        { status: 'archived' },
        { status: 'deleted' },
      ];
      const desc = sortByStatusPriority(items, 'NOVEL', 'status', 'desc').map(
        (x) => x.status
      );
      expect(desc).toEqual(['pending', 'approved', 'archived', 'deleted']);
    });
  });

  describe('getStatusColor', () => {
    test('maps config color to hex', () => {
      expect(getStatusColor('USER', 'active')).toBe('#52c41a'); // success -> green
      expect(getStatusColor('NOVEL', 'published')).toBe('#1890ff'); // primary -> blue
    });
  });

  describe('formatStatus', () => {
    test('uppercases when option enabled', () => {
      expect(formatStatus('USER', 'inactive', { uppercase: true })).toBe(
        '非活跃'.toUpperCase()
      );
    });

    test('falls back to label without icon if none', () => {
      expect(formatStatus('NOVEL', 'featured', { withIcon: true })).toBe(
        '精选'
      );
    });
  });

  describe('formatStatusHistory', () => {
    test('maps from/to status labels and colors', () => {
      const hist = [
        { fromStatus: 'draft', toStatus: 'pending', at: 't1' },
        { fromStatus: 'pending', toStatus: 'approved', at: 't2' },
        { fromStatus: null, toStatus: 'published', at: 't3' },
      ];
      const res = formatStatusHistory(hist, 'NOVEL');
      expect(res[0].fromStatusLabel).toBe('草稿');
      expect(res[0].toStatusLabel).toBe('待审核');
      expect(res[2].fromStatusLabel).toBe('');
      expect(res[2].toStatusColor).toBe('#1890ff'); // primary -> blue
    });
  });
});
