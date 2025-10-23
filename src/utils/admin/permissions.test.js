import {
  USER_ROLES,
  PERMISSION_CATEGORIES,
  PERMISSION_ACTIONS,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canPerformAction,
  hasHigherRole,
  canManageUser,
  getFilteredMenuItems,
  getAvailableActions,
  canAccessAdmin,
  getRoleDisplayName,
  getPermissionDisplayName,
} from './permissions';

describe('Permission Utilities', () => {
  describe('USER_ROLES', () => {
    test('defines all user roles', () => {
      expect(USER_ROLES.SUPER_ADMIN).toBe('super_admin');
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.MODERATOR).toBe('moderator');
      expect(USER_ROLES.EDITOR).toBe('editor');
      expect(USER_ROLES.AUTHOR).toBe('author');
      expect(USER_ROLES.USER).toBe('user');
    });

    test('has 6 roles', () => {
      const roles = Object.keys(USER_ROLES);
      expect(roles.length).toBe(6);
    });
  });

  describe('PERMISSION_CATEGORIES', () => {
    test('defines all permission categories', () => {
      expect(PERMISSION_CATEGORIES.USERS).toBe('users');
      expect(PERMISSION_CATEGORIES.NOVELS).toBe('novels');
      expect(PERMISSION_CATEGORIES.CHAPTERS).toBe('chapters');
      expect(PERMISSION_CATEGORIES.COMMENTS).toBe('comments');
      expect(PERMISSION_CATEGORIES.SETTINGS).toBe('settings');
    });

    test('has 12 categories', () => {
      const categories = Object.keys(PERMISSION_CATEGORIES);
      expect(categories.length).toBe(12);
    });
  });

  describe('PERMISSION_ACTIONS', () => {
    test('defines core permission actions', () => {
      expect(PERMISSION_ACTIONS.CREATE).toBe('create');
      expect(PERMISSION_ACTIONS.READ).toBe('read');
      expect(PERMISSION_ACTIONS.UPDATE).toBe('update');
      expect(PERMISSION_ACTIONS.DELETE).toBe('delete');
      expect(PERMISSION_ACTIONS.APPROVE).toBe('approve');
    });

    test('defines admin actions', () => {
      expect(PERMISSION_ACTIONS.BAN).toBe('ban');
      expect(PERMISSION_ACTIONS.SUSPEND).toBe('suspend');
      expect(PERMISSION_ACTIONS.MANAGE).toBe('manage');
    });

    test('has actions defined', () => {
      const actions = Object.keys(PERMISSION_ACTIONS);
      expect(actions.length).toBeGreaterThan(10);
    });
  });

  describe('ROLE_HIERARCHY', () => {
    test('establishes role hierarchy levels', () => {
      expect(ROLE_HIERARCHY[USER_ROLES.USER]).toBe(1);
      expect(ROLE_HIERARCHY[USER_ROLES.AUTHOR]).toBe(2);
      expect(ROLE_HIERARCHY[USER_ROLES.EDITOR]).toBe(3);
      expect(ROLE_HIERARCHY[USER_ROLES.MODERATOR]).toBe(4);
      expect(ROLE_HIERARCHY[USER_ROLES.ADMIN]).toBe(5);
      expect(ROLE_HIERARCHY[USER_ROLES.SUPER_ADMIN]).toBe(6);
    });

    test('super admin is highest level', () => {
      const levels = Object.values(ROLE_HIERARCHY);
      const maxLevel = Math.max(...levels);
      expect(ROLE_HIERARCHY[USER_ROLES.SUPER_ADMIN]).toBe(maxLevel);
    });

    test('user is lowest level', () => {
      const levels = Object.values(ROLE_HIERARCHY);
      const minLevel = Math.min(...levels);
      expect(ROLE_HIERARCHY[USER_ROLES.USER]).toBe(minLevel);
    });
  });

  describe('DEFAULT_PERMISSIONS', () => {
    test('super admin has full permissions', () => {
      const superAdminPerms = DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN];
      expect(Array.isArray(superAdminPerms)).toBe(true);
      expect(superAdminPerms.length > 0).toBe(true);
      expect(superAdminPerms.some((p) => p.includes('manage'))).toBe(true);
    });

    test('admin has comprehensive permissions', () => {
      const adminPerms = DEFAULT_PERMISSIONS[USER_ROLES.ADMIN];
      expect(adminPerms.length > 0).toBe(true);
      expect(adminPerms.some((p) => p.includes('users'))).toBe(true);
      expect(adminPerms.some((p) => p.includes('novels'))).toBe(true);
    });

    test('admin has fewer or equal permissions to super admin', () => {
      const superAdminPerms = DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN];
      expect(superAdminPerms.some((p) => p.includes('manage'))).toBe(true);
    });

    test('moderator has limited permissions', () => {
      const modPerms = DEFAULT_PERMISSIONS[USER_ROLES.MODERATOR];
      const adminPerms = DEFAULT_PERMISSIONS[USER_ROLES.ADMIN];
      expect(modPerms.length < adminPerms.length).toBe(true);
      expect(modPerms.some((p) => p.includes('comments'))).toBe(true);
    });

    test('user has minimal permissions', () => {
      const userPerms = DEFAULT_PERMISSIONS[USER_ROLES.USER];
      expect(Array.isArray(userPerms)).toBe(true);
    });

    test('each role has permissions defined', () => {
      Object.values(USER_ROLES).forEach((role) => {
        expect(DEFAULT_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(DEFAULT_PERMISSIONS[role])).toBe(true);
      });
    });

    test('permissions follow pattern category.action', () => {
      const adminPerms = DEFAULT_PERMISSIONS[USER_ROLES.ADMIN];
      adminPerms.forEach((perm) => {
        expect(perm).toMatch(/\w+\.\w+/);
      });
    });
  });

  describe('Permission hierarchy', () => {
    test('each role has appropriate permissions', () => {
      expect(DEFAULT_PERMISSIONS[USER_ROLES.USER]).toBeDefined();
      expect(DEFAULT_PERMISSIONS[USER_ROLES.AUTHOR]).toBeDefined();
      expect(DEFAULT_PERMISSIONS[USER_ROLES.MODERATOR]).toBeDefined();
      expect(DEFAULT_PERMISSIONS[USER_ROLES.ADMIN]).toBeDefined();
      expect(DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN]).toBeDefined();
    });
  });

  describe('Content access patterns', () => {
    test('admins can manage users', () => {
      const adminPerms = DEFAULT_PERMISSIONS[USER_ROLES.ADMIN];
      expect(adminPerms.some((p) => p.startsWith('users.'))).toBe(true);
    });

    test('admins can manage novels', () => {
      const adminPerms = DEFAULT_PERMISSIONS[USER_ROLES.ADMIN];
      expect(adminPerms.some((p) => p.startsWith('novels.'))).toBe(true);
    });

    test('moderators can approve content', () => {
      const modPerms = DEFAULT_PERMISSIONS[USER_ROLES.MODERATOR];
      expect(modPerms.some((p) => p.includes('approve'))).toBe(true);
    });

    test('super admin has dashboard access', () => {
      const superAdminPerms = DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN];
      expect(superAdminPerms.some((p) => p.startsWith('dashboard.'))).toBe(
        true
      );
    });
  });

  describe('Permission Functions', () => {
    const adminUser = {
      id: 'u1',
      role: USER_ROLES.ADMIN,
      permissions: [],
    };
    const superAdmin = {
      id: 's1',
      role: USER_ROLES.SUPER_ADMIN,
      permissions: [],
    };
    const normalUser = { id: 'u2', role: USER_ROLES.USER, permissions: [] };

    describe('hasPermission', () => {
      test('super admin always has permission', () => {
        expect(hasPermission(superAdmin, 'any.category.action')).toBe(true);
      });

      test('matches exact permission or manage permission', () => {
        const user = {
          id: 'u3',
          role: USER_ROLES.MODERATOR,
          permissions: [
            `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.MANAGE}`,
          ],
        };
        expect(hasPermission(user, 'novels.update')).toBe(true);
        expect(hasPermission(user, 'reports.update')).toBe(true);
      });

      test('honors custom permissions', () => {
        const user = {
          id: 'u4',
          role: USER_ROLES.USER,
          permissions: ['comments.create'],
        };
        expect(hasPermission(user, 'comments.create')).toBe(true);
        expect(hasPermission(user, 'comments.delete')).toBe(false);
      });

      test('returns false for invalid inputs', () => {
        expect(hasPermission(null, 'x.y')).toBe(false);
        expect(hasPermission(adminUser, null)).toBe(false);
      });
    });

    describe('hasAnyPermission / hasAllPermissions', () => {
      test('hasAnyPermission returns true if any permission allowed', () => {
        const perms = ['users.read', 'novels.update'];
        expect(hasAnyPermission(adminUser, perms)).toBe(true);
      });

      test('hasAllPermissions returns true only when all allowed', () => {
        const permsOk = ['novels.read', 'chapters.read'];
        const permsNo = ['novels.read', 'yuan.manage'];
        expect(hasAllPermissions(adminUser, permsOk)).toBe(true);
        expect(hasAllPermissions(adminUser, permsNo)).toBe(false);
      });

      test('invalid inputs return false', () => {
        expect(hasAnyPermission(adminUser, 'not-array')).toBe(false);
        expect(hasAllPermissions(adminUser, 'not-array')).toBe(false);
      });
    });

    describe('canPerformAction', () => {
      test('returns true when has direct permission', () => {
        expect(
          canPerformAction(
            adminUser,
            PERMISSION_ACTIONS.UPDATE,
            PERMISSION_CATEGORIES.NOVELS
          )
        ).toBe(true);
      });

      test('ownership allows certain actions even without explicit permission', () => {
        const user = { id: 'owner', role: USER_ROLES.USER, permissions: [] };
        const resource = { userId: 'owner' };
        expect(
          canPerformAction(
            user,
            PERMISSION_ACTIONS.UPDATE,
            PERMISSION_CATEGORIES.NOVELS,
            resource
          )
        ).toBe(true);
        expect(
          canPerformAction(
            user,
            PERMISSION_ACTIONS.APPROVE,
            PERMISSION_CATEGORIES.NOVELS,
            resource
          )
        ).toBe(false);
      });
    });

    describe('hasHigherRole', () => {
      test('compares role hierarchy correctly', () => {
        expect(hasHigherRole(USER_ROLES.ADMIN, USER_ROLES.MODERATOR)).toBe(
          true
        );
        expect(hasHigherRole(USER_ROLES.USER, USER_ROLES.AUTHOR)).toBe(false);
        expect(hasHigherRole(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)).toBe(
          false
        );
      });
    });

    describe('canManageUser', () => {
      test('cannot manage self', () => {
        const u = {
          id: 'same',
          role: USER_ROLES.ADMIN,
          permissions: DEFAULT_PERMISSIONS[USER_ROLES.ADMIN],
        };
        expect(canManageUser(u, u)).toBe(false);
      });

      test('requires update permission and higher role', () => {
        const admin = {
          id: 'a',
          role: USER_ROLES.ADMIN,
          permissions: DEFAULT_PERMISSIONS[USER_ROLES.ADMIN],
        };
        const moderator = {
          id: 'm',
          role: USER_ROLES.MODERATOR,
          permissions: DEFAULT_PERMISSIONS[USER_ROLES.MODERATOR],
        };
        expect(canManageUser(admin, moderator)).toBe(true);
        // lower role managing higher role -> false
        expect(canManageUser(moderator, admin)).toBe(false);
        // missing update permission -> false
        const noUpdate = {
          id: 'x',
          role: USER_ROLES.MODERATOR,
          permissions: [],
        };
        expect(canManageUser(noUpdate, normalUser)).toBe(false);
      });
    });

    describe('getFilteredMenuItems', () => {
      const menu = [
        { key: 'dashboard' },
        { key: 'users', permission: 'users.read' },
        { key: 'yuan', permission: 'yuan.manage' },
        {
          key: 'nested',
          children: [
            { key: 'reports', permission: 'reports.read' },
            { key: 'settings', permission: 'settings.manage' },
          ],
        },
      ];

      test('filters items based on permission, keeps unprotected items', () => {
        const filtered = getFilteredMenuItems(adminUser, menu);
        const keys = filtered.map((m) => m.key);
        expect(keys).toContain('dashboard');
        expect(keys).toContain('users');
        expect(keys).toContain('nested');

        expect(keys).not.toContain('yuan');

        const nested = filtered.find((m) => m.key === 'nested');
        const nestedKeys = nested.children.map((c) => c.key);
        expect(nestedKeys).toContain('reports');
        expect(nestedKeys).not.toContain('settings');
      });

      test('handles invalid menu input', () => {
        expect(getFilteredMenuItems(adminUser, null)).toEqual([]);
      });
    });

    describe('getAvailableActions', () => {
      test('returns actions allowed by canPerformAction', () => {
        const actions = getAvailableActions(
          adminUser,
          PERMISSION_CATEGORIES.NOVELS,
          { userId: 'not-admin' }
        );
        expect(Array.isArray(actions)).toBe(true);
        expect(actions).toContain(PERMISSION_ACTIONS.READ);
        expect(actions).toContain(PERMISSION_ACTIONS.UPDATE);
      });
    });

    describe('canAccessAdmin', () => {
      test('editor and above can access admin', () => {
        expect(canAccessAdmin({ role: USER_ROLES.EDITOR })).toBe(true);
        expect(canAccessAdmin({ role: USER_ROLES.MODERATOR })).toBe(true);
        expect(canAccessAdmin({ role: USER_ROLES.USER })).toBe(false);
        expect(canAccessAdmin(null)).toBe(false);
      });
    });

    describe('Display name helpers', () => {
      test('getRoleDisplayName returns mapped Chinese name or original', () => {
        expect(getRoleDisplayName(USER_ROLES.ADMIN)).toMatch(/管理员/);
        expect(getRoleDisplayName('unknown_role')).toBe('unknown_role');
      });

      test('getPermissionDisplayName returns combined label', () => {
        const label = getPermissionDisplayName(
          `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.READ}`
        );
        expect(label).toMatch(/用户管理/);
        expect(label).toMatch(/查看/);
      });
    });
  });
});
