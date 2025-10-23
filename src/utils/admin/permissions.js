// Yushan Admin Permission Utilities

/**
 * User roles and their hierarchy
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  AUTHOR: 'author',
  USER: 'user',
};

/**
 * Permission categories
 */
export const PERMISSION_CATEGORIES = {
  USERS: 'users',
  NOVELS: 'novels',
  CHAPTERS: 'chapters',
  COMMENTS: 'comments',
  REVIEWS: 'reviews',
  REPORTS: 'reports',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  YUAN: 'yuan',
  RANKINGS: 'rankings',
  LIBRARY: 'library',
  DASHBOARD: 'dashboard',
};

/**
 * Permission actions
 */
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  BAN: 'ban',
  SUSPEND: 'suspend',
  FEATURE: 'feature',
  PUBLISH: 'publish',
  ARCHIVE: 'archive',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
};

/**
 * Role hierarchy levels (higher number = more permissions)
 */
export const ROLE_HIERARCHY = {
  [USER_ROLES.USER]: 1,
  [USER_ROLES.AUTHOR]: 2,
  [USER_ROLES.EDITOR]: 3,
  [USER_ROLES.MODERATOR]: 4,
  [USER_ROLES.ADMIN]: 5,
  [USER_ROLES.SUPER_ADMIN]: 6,
};

/**
 * Default permissions for each role
 */
export const DEFAULT_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    // Full access to everything
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.REPORTS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.SETTINGS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.YUAN}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.RANKINGS}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.MANAGE}`,
    `${PERMISSION_CATEGORIES.DASHBOARD}.${PERMISSION_ACTIONS.READ}`,
  ],

  [USER_ROLES.ADMIN]: [
    // User management
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.BAN}`,
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.SUSPEND}`,

    // Content management
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.DELETE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.APPROVE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.FEATURE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.ARCHIVE}`,

    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.DELETE}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.APPROVE}`,

    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.DELETE}`,

    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.DELETE}`,

    `${PERMISSION_CATEGORIES.REPORTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REPORTS}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.CREATE}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.YUAN}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.YUAN}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.RANKINGS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.RANKINGS}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.DASHBOARD}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.SETTINGS}.${PERMISSION_ACTIONS.READ}`,
  ],

  [USER_ROLES.MODERATOR]: [
    // Limited user management
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.SUSPEND}`,

    // Content moderation
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.APPROVE}`,

    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.APPROVE}`,

    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.DELETE}`,

    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.UPDATE}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.DELETE}`,

    `${PERMISSION_CATEGORIES.REPORTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REPORTS}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.RANKINGS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.DASHBOARD}.${PERMISSION_ACTIONS.READ}`,
  ],

  [USER_ROLES.EDITOR]: [
    // Content editing
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.CREATE}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.UPDATE}`,

    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.DASHBOARD}.${PERMISSION_ACTIONS.READ}`,
  ],

  [USER_ROLES.AUTHOR]: [
    // Own content management
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.CREATE}`,

    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.CREATE}`,

    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.READ}`,
  ],

  [USER_ROLES.USER]: [
    // Basic read access
    `${PERMISSION_CATEGORIES.NOVELS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CHAPTERS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.COMMENTS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.REVIEWS}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.CATEGORIES}.${PERMISSION_ACTIONS.READ}`,
    `${PERMISSION_CATEGORIES.LIBRARY}.${PERMISSION_ACTIONS.READ}`,
  ],
};

/**
 * Check if user has a specific permission
 * @param {object} user - User object with role and permissions
 * @param {string} permission - Permission string (e.g., 'users.read')
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;

  // Super admin has all permissions
  if (user.role === USER_ROLES.SUPER_ADMIN) {
    return true;
  }

  // Check user's custom permissions first
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  // Check default role permissions
  const rolePermissions = DEFAULT_PERMISSIONS[user.role] || [];

  // Check for exact permission match
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check for manage permission (covers all actions in category)
  const [category] = permission.split('.');
  const managePermission = `${category}.${PERMISSION_ACTIONS.MANAGE}`;

  return rolePermissions.includes(managePermission);
};

/**
 * Check if user has any of the specified permissions
 * @param {object} user - User object
 * @param {Array} permissions - Array of permission strings
 * @returns {boolean} - True if user has any permission
 */
export const hasAnyPermission = (user, permissions) => {
  if (!Array.isArray(permissions)) return false;

  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Check if user has all specified permissions
 * @param {object} user - User object
 * @param {Array} permissions - Array of permission strings
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!Array.isArray(permissions)) return false;

  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Check if user can perform action on resource
 * @param {object} user - User object
 * @param {string} action - Action to perform
 * @param {string} category - Resource category
 * @param {object} resource - Optional resource object for ownership check
 * @returns {boolean} - True if user can perform action
 */
export const canPerformAction = (user, action, category, resource = null) => {
  const permission = `${category}.${action}`;

  // Check basic permission
  if (hasPermission(user, permission)) {
    return true;
  }

  // Check ownership for certain actions
  if (resource && resource.userId === user.id) {
    const ownContentActions = [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ];

    if (ownContentActions.includes(action)) {
      return true;
    }
  }

  return false;
};

/**
 * Check if user has higher role than another user
 * @param {string} userRole - First user's role
 * @param {string} targetRole - Second user's role
 * @returns {boolean} - True if first user has higher role
 */
export const hasHigherRole = (userRole, targetRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  return userLevel > targetLevel;
};

/**
 * Check if user can manage another user
 * @param {object} user - Acting user
 * @param {object} targetUser - Target user
 * @returns {boolean} - True if user can manage target
 */
export const canManageUser = (user, targetUser) => {
  if (!user || !targetUser) return false;

  // Can't manage yourself
  if (user.id === targetUser.id) return false;

  // Must have user management permission
  if (
    !hasPermission(
      user,
      `${PERMISSION_CATEGORIES.USERS}.${PERMISSION_ACTIONS.UPDATE}`
    )
  ) {
    return false;
  }

  // Must have higher role
  return hasHigherRole(user.role, targetUser.role);
};

/**
 * Get filtered menu items based on user permissions
 * @param {object} user - User object
 * @param {Array} menuItems - Array of menu items with permissions
 * @returns {Array} - Filtered menu items
 */
export const getFilteredMenuItems = (user, menuItems) => {
  if (!Array.isArray(menuItems)) return [];

  return menuItems
    .filter((item) => {
      if (!item.permission) return true; // No permission required

      if (Array.isArray(item.permission)) {
        return hasAnyPermission(user, item.permission);
      }

      return hasPermission(user, item.permission);
    })
    .map((item) => {
      // Recursively filter children
      if (item.children) {
        return {
          ...item,
          children: getFilteredMenuItems(user, item.children),
        };
      }

      return item;
    });
};

/**
 * Get available actions for a resource
 * @param {object} user - User object
 * @param {string} category - Resource category
 * @param {object} resource - Resource object
 * @returns {Array} - Array of available actions
 */
export const getAvailableActions = (user, category, resource = null) => {
  const actions = [];

  Object.values(PERMISSION_ACTIONS).forEach((action) => {
    if (canPerformAction(user, action, category, resource)) {
      actions.push(action);
    }
  });

  return actions;
};

/**
 * Permission decorator for React components
 * @param {string|Array} requiredPermissions - Required permissions
 * @param {React.Component} fallback - Fallback component if no permission
 * @returns {Function} - HOC function
 */
export const withPermission = (requiredPermissions, fallback = null) => {
  return (Component) => {
    const WrappedComponent = (props) => {
      const { user, ...otherProps } = props;

      const hasRequiredPermission = Array.isArray(requiredPermissions)
        ? hasAnyPermission(user, requiredPermissions)
        : hasPermission(user, requiredPermissions);

      if (!hasRequiredPermission) {
        return fallback;
      }

      return <Component {...otherProps} user={user} />;
    };

    WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
  };
};

/**
 * Check if user can access admin panel
 * @param {object} user - User object
 * @returns {boolean} - True if user can access admin
 */
export const canAccessAdmin = (user) => {
  if (!user) return false;

  const minRole = USER_ROLES.EDITOR;
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const minLevel = ROLE_HIERARCHY[minRole] || 0;

  return userLevel >= minLevel;
};

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string} - Localized role name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.SUPER_ADMIN]: '超级管理员',
    [USER_ROLES.ADMIN]: '管理员',
    [USER_ROLES.MODERATOR]: '版主',
    [USER_ROLES.EDITOR]: '编辑',
    [USER_ROLES.AUTHOR]: '作者',
    [USER_ROLES.USER]: '用户',
  };

  return roleNames[role] || role;
};

/**
 * Get permission display name
 * @param {string} permission - Permission string
 * @returns {string} - Localized permission name
 */
export const getPermissionDisplayName = (permission) => {
  const [category, action] = permission.split('.');

  const categoryNames = {
    [PERMISSION_CATEGORIES.USERS]: '用户管理',
    [PERMISSION_CATEGORIES.NOVELS]: '小说管理',
    [PERMISSION_CATEGORIES.CHAPTERS]: '章节管理',
    [PERMISSION_CATEGORIES.COMMENTS]: '评论管理',
    [PERMISSION_CATEGORIES.REVIEWS]: '评价管理',
    [PERMISSION_CATEGORIES.REPORTS]: '举报管理',
    [PERMISSION_CATEGORIES.CATEGORIES]: '分类管理',
    [PERMISSION_CATEGORIES.SETTINGS]: '系统设置',
    [PERMISSION_CATEGORIES.YUAN]: '元宝管理',
    [PERMISSION_CATEGORIES.RANKINGS]: '排行榜管理',
    [PERMISSION_CATEGORIES.LIBRARY]: '书库管理',
    [PERMISSION_CATEGORIES.DASHBOARD]: '仪表板',
  };

  const actionNames = {
    [PERMISSION_ACTIONS.CREATE]: '创建',
    [PERMISSION_ACTIONS.READ]: '查看',
    [PERMISSION_ACTIONS.UPDATE]: '编辑',
    [PERMISSION_ACTIONS.DELETE]: '删除',
    [PERMISSION_ACTIONS.APPROVE]: '审核',
    [PERMISSION_ACTIONS.REJECT]: '拒绝',
    [PERMISSION_ACTIONS.BAN]: '封禁',
    [PERMISSION_ACTIONS.SUSPEND]: '暂停',
    [PERMISSION_ACTIONS.FEATURE]: '推荐',
    [PERMISSION_ACTIONS.PUBLISH]: '发布',
    [PERMISSION_ACTIONS.ARCHIVE]: '归档',
    [PERMISSION_ACTIONS.EXPORT]: '导出',
    [PERMISSION_ACTIONS.IMPORT]: '导入',
    [PERMISSION_ACTIONS.MANAGE]: '管理',
  };

  const categoryName = categoryNames[category] || category;
  const actionName = actionNames[action] || action;

  return `${categoryName} - ${actionName}`;
};

export default {
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
  withPermission,
  canAccessAdmin,
  getRoleDisplayName,
  getPermissionDisplayName,
};
