// Yushan Admin Status Utilities

/**
 * Status definitions with colors and labels
 */
export const STATUS_DEFINITIONS = {
  // User statuses
  USER: {
    active: { label: '活跃', color: 'success', variant: 'filled' },
    inactive: { label: '非活跃', color: 'warning', variant: 'filled' },
    suspended: { label: '已暂停', color: 'error', variant: 'filled' },
    banned: { label: '已封禁', color: 'error', variant: 'outlined' },
    pending: { label: '待审核', color: 'info', variant: 'filled' },
  },

  // Novel statuses
  NOVEL: {
    draft: { label: '草稿', color: 'default', variant: 'outlined' },
    pending: { label: '待审核', color: 'info', variant: 'filled' },
    approved: { label: '已批准', color: 'success', variant: 'filled' },
    rejected: { label: '已拒绝', color: 'error', variant: 'filled' },
    published: { label: '已发布', color: 'primary', variant: 'filled' },
    featured: { label: '精选', color: 'warning', variant: 'filled' },
    trending: { label: '热门', color: 'secondary', variant: 'filled' },
    archived: { label: '已归档', color: 'default', variant: 'outlined' },
    completed: { label: '已完结', color: 'success', variant: 'outlined' },
    ongoing: { label: '连载中', color: 'primary', variant: 'outlined' },
    paused: { label: '暂停更新', color: 'warning', variant: 'outlined' },
    cancelled: { label: '已取消', color: 'error', variant: 'outlined' },
  },

  // Chapter statuses
  CHAPTER: {
    draft: { label: '草稿', color: 'default', variant: 'outlined' },
    pending: { label: '待审核', color: 'info', variant: 'filled' },
    approved: { label: '已批准', color: 'success', variant: 'filled' },
    rejected: { label: '已拒绝', color: 'error', variant: 'filled' },
    published: { label: '已发布', color: 'primary', variant: 'filled' },
    scheduled: { label: '定时发布', color: 'info', variant: 'outlined' },
    premium: { label: '付费章节', color: 'warning', variant: 'filled' },
    free: { label: '免费章节', color: 'success', variant: 'outlined' },
  },

  // Comment statuses
  COMMENT: {
    pending: { label: '待审核', color: 'info', variant: 'filled' },
    approved: { label: '已批准', color: 'success', variant: 'filled' },
    rejected: { label: '已拒绝', color: 'error', variant: 'filled' },
    flagged: { label: '已标记', color: 'warning', variant: 'filled' },
    hidden: { label: '已隐藏', color: 'default', variant: 'outlined' },
    deleted: { label: '已删除', color: 'error', variant: 'outlined' },
  },

  // Review statuses
  REVIEW: {
    pending: { label: '待审核', color: 'info', variant: 'filled' },
    approved: { label: '已批准', color: 'success', variant: 'filled' },
    rejected: { label: '已拒绝', color: 'error', variant: 'filled' },
    featured: { label: '精选评价', color: 'warning', variant: 'filled' },
    helpful: { label: '有用', color: 'primary', variant: 'outlined' },
    reported: { label: '被举报', color: 'error', variant: 'outlined' },
  },

  // Report statuses
  REPORT: {
    open: { label: '待处理', color: 'warning', variant: 'filled' },
    investigating: { label: '调查中', color: 'info', variant: 'filled' },
    resolved: { label: '已解决', color: 'success', variant: 'filled' },
    dismissed: { label: '已驳回', color: 'default', variant: 'outlined' },
    escalated: { label: '已升级', color: 'error', variant: 'filled' },
    closed: { label: '已关闭', color: 'default', variant: 'outlined' },
  },

  // Transaction statuses
  TRANSACTION: {
    pending: { label: '处理中', color: 'info', variant: 'filled' },
    completed: { label: '已完成', color: 'success', variant: 'filled' },
    failed: { label: '失败', color: 'error', variant: 'filled' },
    cancelled: { label: '已取消', color: 'default', variant: 'outlined' },
    refunded: { label: '已退款', color: 'warning', variant: 'filled' },
    expired: { label: '已过期', color: 'error', variant: 'outlined' },
  },

  // Order statuses
  ORDER: {
    pending: { label: '待付款', color: 'warning', variant: 'filled' },
    paid: { label: '已付款', color: 'success', variant: 'filled' },
    processing: { label: '处理中', color: 'info', variant: 'filled' },
    shipped: { label: '已发货', color: 'primary', variant: 'filled' },
    delivered: { label: '已送达', color: 'success', variant: 'outlined' },
    cancelled: { label: '已取消', color: 'error', variant: 'filled' },
    refunded: { label: '已退款', color: 'warning', variant: 'filled' },
  },

  // Subscription statuses
  SUBSCRIPTION: {
    active: { label: '活跃', color: 'success', variant: 'filled' },
    expired: { label: '已过期', color: 'error', variant: 'filled' },
    cancelled: { label: '已取消', color: 'default', variant: 'outlined' },
    suspended: { label: '已暂停', color: 'warning', variant: 'filled' },
    trial: { label: '试用期', color: 'info', variant: 'outlined' },
    pending: { label: '待激活', color: 'info', variant: 'filled' },
  },

  // System statuses
  SYSTEM: {
    online: { label: '在线', color: 'success', variant: 'filled' },
    offline: { label: '离线', color: 'error', variant: 'filled' },
    maintenance: { label: '维护中', color: 'warning', variant: 'filled' },
    degraded: { label: '性能下降', color: 'warning', variant: 'outlined' },
    unknown: { label: '未知', color: 'default', variant: 'outlined' },
  },
};

/**
 * Priority levels with colors and labels
 */
export const PRIORITY_DEFINITIONS = {
  low: { label: '低', color: 'success', icon: '⬇️' },
  normal: { label: '正常', color: 'info', icon: '➡️' },
  medium: { label: '中', color: 'warning', icon: '⬆️' },
  high: { label: '高', color: 'error', icon: '🔺' },
  urgent: { label: '紧急', color: 'error', icon: '🚨' },
  critical: { label: '关键', color: 'error', icon: '🔥' },
};

/**
 * Get status configuration
 * @param {string} category - Status category (USER, NOVEL, etc.)
 * @param {string} status - Status value
 * @returns {object} - Status configuration
 */
export const getStatusConfig = (category, status) => {
  const categoryDef = STATUS_DEFINITIONS[category?.toUpperCase()];
  if (!categoryDef) {
    return { label: status, color: 'default', variant: 'outlined' };
  }

  const statusDef = categoryDef[status?.toLowerCase()];
  if (!statusDef) {
    return { label: status, color: 'default', variant: 'outlined' };
  }

  return statusDef;
};

/**
 * Get priority configuration
 * @param {string} priority - Priority level
 * @returns {object} - Priority configuration
 */
export const getPriorityConfig = (priority) => {
  const priorityDef = PRIORITY_DEFINITIONS[priority?.toLowerCase()];
  if (!priorityDef) {
    return { label: priority, color: 'default', icon: '❓' };
  }

  return priorityDef;
};

/**
 * Get status badge props for Ant Design
 * @param {string} category - Status category
 * @param {string} status - Status value
 * @returns {object} - Badge props
 */
export const getStatusBadgeProps = (category, status) => {
  const config = getStatusConfig(category, status);

  const colorMap = {
    default: 'default',
    primary: 'blue',
    secondary: 'purple',
    success: 'green',
    warning: 'orange',
    error: 'red',
    info: 'blue',
  };

  return {
    status: config.variant === 'outlined' ? 'default' : 'processing',
    color: colorMap[config.color] || 'default',
    text: config.label,
  };
};

/**
 * Get status tag props for Ant Design
 * @param {string} category - Status category
 * @param {string} status - Status value
 * @returns {object} - Tag props
 */
export const getStatusTagProps = (category, status) => {
  const config = getStatusConfig(category, status);

  const colorMap = {
    default: 'default',
    primary: 'blue',
    secondary: 'purple',
    success: 'green',
    warning: 'orange',
    error: 'red',
    info: 'blue',
  };

  return {
    color: colorMap[config.color] || 'default',
    bordered: config.variant === 'outlined',
    children: config.label,
  };
};

/**
 * Get available status transitions
 * @param {string} category - Status category
 * @param {string} currentStatus - Current status
 * @returns {Array} - Array of available transitions
 */
export const getStatusTransitions = (category, currentStatus) => {
  const transitions = {
    USER: {
      active: ['inactive', 'suspended', 'banned'],
      inactive: ['active', 'suspended', 'banned'],
      suspended: ['active', 'banned'],
      banned: ['active'],
      pending: ['active', 'rejected'],
    },

    NOVEL: {
      draft: ['pending'],
      pending: ['approved', 'rejected'],
      approved: ['published', 'rejected'],
      rejected: ['pending'],
      published: ['featured', 'archived'],
      featured: ['published', 'archived'],
      trending: ['published', 'featured', 'archived'],
      archived: ['published'],
      ongoing: ['completed', 'paused', 'cancelled'],
      completed: ['ongoing'],
      paused: ['ongoing', 'cancelled'],
      cancelled: ['ongoing'],
    },

    CHAPTER: {
      draft: ['pending'],
      pending: ['approved', 'rejected'],
      approved: ['published', 'rejected'],
      rejected: ['pending'],
      published: ['archived'],
      scheduled: ['published', 'cancelled'],
      premium: ['free'],
      free: ['premium'],
    },

    COMMENT: {
      pending: ['approved', 'rejected'],
      approved: ['flagged', 'hidden', 'deleted'],
      rejected: ['pending'],
      flagged: ['approved', 'hidden', 'deleted'],
      hidden: ['approved', 'deleted'],
      deleted: [],
    },

    REVIEW: {
      pending: ['approved', 'rejected'],
      approved: ['featured', 'reported'],
      rejected: ['pending'],
      featured: ['approved'],
      helpful: ['approved'],
      reported: ['approved', 'rejected'],
    },

    REPORT: {
      open: ['investigating', 'dismissed'],
      investigating: ['resolved', 'escalated', 'dismissed'],
      resolved: ['closed'],
      dismissed: ['open'],
      escalated: ['resolved', 'dismissed'],
      closed: [],
    },

    TRANSACTION: {
      pending: ['completed', 'failed', 'cancelled'],
      completed: ['refunded'],
      failed: ['pending'],
      cancelled: [],
      refunded: [],
      expired: [],
    },
  };

  const categoryTransitions = transitions[category?.toUpperCase()];
  if (!categoryTransitions) return [];

  const availableTransitions =
    categoryTransitions[currentStatus?.toLowerCase()];
  if (!availableTransitions) return [];

  return availableTransitions.map((status) => ({
    value: status,
    label: getStatusConfig(category, status).label,
  }));
};

/**
 * Check if status transition is valid
 * @param {string} category - Status category
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - True if transition is valid
 */
export const isValidStatusTransition = (category, fromStatus, toStatus) => {
  const availableTransitions = getStatusTransitions(category, fromStatus);
  return availableTransitions.some(
    (transition) => transition.value === toStatus
  );
};

/**
 * Get status statistics
 * @param {Array} items - Array of items with status
 * @param {string} category - Status category
 * @param {string} statusField - Field name containing status
 * @returns {object} - Status statistics
 */
export const getStatusStatistics = (
  items,
  category,
  statusField = 'status'
) => {
  if (!Array.isArray(items)) return {};

  const stats = {};
  const total = items.length;

  items.forEach((item) => {
    const status = item[statusField];
    if (!stats[status]) {
      stats[status] = {
        count: 0,
        percentage: 0,
        config: getStatusConfig(category, status),
      };
    }
    stats[status].count++;
  });

  // Calculate percentages
  Object.keys(stats).forEach((status) => {
    stats[status].percentage =
      total > 0 ? (stats[status].count / total) * 100 : 0;
  });

  return stats;
};

/**
 * Filter items by status
 * @param {Array} items - Array of items
 * @param {string|Array} statuses - Status or array of statuses to filter by
 * @param {string} statusField - Field name containing status
 * @returns {Array} - Filtered items
 */
export const filterByStatus = (items, statuses, statusField = 'status') => {
  if (!Array.isArray(items)) return [];

  const statusArray = Array.isArray(statuses) ? statuses : [statuses];

  return items.filter((item) => statusArray.includes(item[statusField]));
};

/**
 * Sort items by status priority
 * @param {Array} items - Array of items
 * @param {string} category - Status category
 * @param {string} statusField - Field name containing status
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} - Sorted items
 */
export const sortByStatusPriority = (
  items,
  category,
  statusField = 'status',
  direction = 'asc'
) => {
  if (!Array.isArray(items)) return [];

  const priorityMap = {
    // Higher number = higher priority
    pending: 10,
    investigating: 9,
    processing: 8,
    active: 7,
    approved: 6,
    published: 5,
    completed: 4,
    resolved: 3,
    inactive: 2,
    archived: 1,
    deleted: 0,
    cancelled: 0,
    rejected: 0,
  };

  return [...items].sort((a, b) => {
    const aPriority = priorityMap[a[statusField]] || 0;
    const bPriority = priorityMap[b[statusField]] || 0;

    return direction === 'asc' ? aPriority - bPriority : bPriority - aPriority;
  });
};

/**
 * Get status color for charts
 * @param {string} category - Status category
 * @param {string} status - Status value
 * @returns {string} - Color hex code
 */
export const getStatusColor = (category, status) => {
  const config = getStatusConfig(category, status);

  const colorMap = {
    default: '#d9d9d9',
    primary: '#1890ff',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2',
  };

  return colorMap[config.color] || colorMap.default;
};

/**
 * Format status for display
 * @param {string} category - Status category
 * @param {string} status - Status value
 * @param {object} options - Formatting options
 * @returns {string} - Formatted status
 */
export const formatStatus = (category, status, options = {}) => {
  const config = getStatusConfig(category, status);
  const { uppercase = false, withIcon = false } = options;

  let result = config.label;

  if (uppercase) {
    result = result.toUpperCase();
  }

  if (withIcon && config.icon) {
    result = `${config.icon} ${result}`;
  }

  return result;
};

/**
 * Get status history formatting
 * @param {Array} statusHistory - Array of status changes
 * @param {string} category - Status category
 * @returns {Array} - Formatted status history
 */
export const formatStatusHistory = (statusHistory, category) => {
  if (!Array.isArray(statusHistory)) return [];

  return statusHistory.map((entry) => ({
    ...entry,
    fromStatusLabel: entry.fromStatus
      ? getStatusConfig(category, entry.fromStatus).label
      : '',
    toStatusLabel: getStatusConfig(category, entry.toStatus).label,
    fromStatusColor: entry.fromStatus
      ? getStatusColor(category, entry.fromStatus)
      : '',
    toStatusColor: getStatusColor(category, entry.toStatus),
  }));
};

export default {
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
};
