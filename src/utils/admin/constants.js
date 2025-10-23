// Yushan Admin Constants

/**
 * Application configuration constants
 */
export const APP_CONFIG = {
  NAME: 'Yushan Admin',
  VERSION: '1.0.0',
  DESCRIPTION: 'Admin panel for Yushan novel platform',
  DEFAULT_LANGUAGE: 'zh-CN',
  DEFAULT_CURRENCY: 'CNY',
  DEFAULT_TIMEZONE: 'Asia/Shanghai',
  ITEMS_PER_PAGE: 20,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/admin/users',
    CREATE: '/admin/users',
    GET: '/admin/users/:id',
    UPDATE: '/admin/users/:id',
    DELETE: '/admin/users/:id',
    BAN: '/admin/users/:id/ban',
    SUSPEND: '/admin/users/:id/suspend',
    ACTIVATE: '/admin/users/:id/activate',
  },
  NOVELS: {
    LIST: '/admin/novels',
    CREATE: '/admin/novels',
    GET: '/admin/novels/:id',
    UPDATE: '/admin/novels/:id',
    DELETE: '/admin/novels/:id',
    APPROVE: '/admin/novels/:id/approve',
    FEATURE: '/admin/novels/:id/feature',
    ARCHIVE: '/admin/novels/:id/archive',
  },
  CHAPTERS: {
    LIST: '/admin/chapters',
    CREATE: '/admin/chapters',
    GET: '/admin/chapters/:id',
    UPDATE: '/admin/chapters/:id',
    DELETE: '/admin/chapters/:id',
    APPROVE: '/admin/chapters/:id/approve',
    PUBLISH: '/admin/chapters/:id/publish',
  },
  COMMENTS: {
    LIST: '/admin/comments',
    GET: '/admin/comments/:id',
    UPDATE: '/admin/comments/:id',
    DELETE: '/admin/comments/:id',
    APPROVE: '/admin/comments/:id/approve',
  },
  REVIEWS: {
    LIST: '/admin/reviews',
    GET: '/admin/reviews/:id',
    UPDATE: '/admin/reviews/:id',
    DELETE: '/admin/reviews/:id',
    APPROVE: '/admin/reviews/:id/approve',
  },
  REPORTS: {
    LIST: '/admin/reports',
    GET: '/admin/reports/:id',
    UPDATE: '/admin/reports/:id',
    RESOLVE: '/admin/reports/:id/resolve',
    DISMISS: '/admin/reports/:id/dismiss',
  },
  CATEGORIES: {
    LIST: '/admin/categories',
    CREATE: '/admin/categories',
    GET: '/admin/categories/:id',
    UPDATE: '/admin/categories/:id',
    DELETE: '/admin/categories/:id',
  },
  YUAN: {
    TRANSACTIONS: '/admin/yuan/transactions',
    ADJUST: '/admin/yuan/adjust',
    STATISTICS: '/admin/yuan/statistics',
  },
  RANKINGS: {
    NOVELS: '/admin/rankings/novels',
    AUTHORS: '/admin/rankings/authors',
    UPDATE: '/admin/rankings/update',
  },
  SETTINGS: {
    GET: '/admin/settings',
    UPDATE: '/admin/settings',
  },
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
    CHARTS: '/admin/dashboard/charts',
    ACTIVITIES: '/admin/dashboard/activities',
  },
};

/**
 * Status constants
 */
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  FEATURED: 'featured',
  TRENDING: 'trending',
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  DELETED: 'deleted',
  RESOLVED: 'resolved',
  INVESTIGATING: 'investigating',
  CLOSED: 'closed',
};

/**
 * User roles
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
 * Novel genres
 */
export const NOVEL_GENRES = {
  FANTASY: 'fantasy',
  ROMANCE: 'romance',
  MYSTERY: 'mystery',
  THRILLER: 'thriller',
  HORROR: 'horror',
  SCIFI: 'scifi',
  HISTORICAL: 'historical',
  CONTEMPORARY: 'contemporary',
  URBAN: 'urban',
  MARTIAL_ARTS: 'martial_arts',
  CULTIVATION: 'cultivation',
  SYSTEM: 'system',
  REINCARNATION: 'reincarnation',
  TRANSMIGRATION: 'transmigration',
  SLICE_OF_LIFE: 'slice_of_life',
  COMEDY: 'comedy',
  DRAMA: 'drama',
  ACTION: 'action',
  ADVENTURE: 'adventure',
  SUPERNATURAL: 'supernatural',
};

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
};

/**
 * Report types
 */
export const REPORT_TYPES = {
  SPAM: 'spam',
  INAPPROPRIATE: 'inappropriate',
  HARASSMENT: 'harassment',
  COPYRIGHT: 'copyright',
  PLAGIARISM: 'plagiarism',
  OFFENSIVE: 'offensive',
  FAKE: 'fake',
  OTHER: 'other',
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  SHORT: 'YYYY-MM-DD',
  LONG: 'MMMM DD, YYYY',
  DATETIME: 'YYYY-MM-DD HH:mm',
  TIME: 'HH:mm:ss',
  FULL: 'MMMM DD, YYYY HH:mm:ss',
};

/**
 * Theme constants
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

/**
 * Language constants
 */
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
  JA_JP: 'ja-JP',
  KO_KR: 'ko-KR',
};

/**
 * File type constants
 */
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt'],
  ARCHIVE: ['zip', 'rar', '7z'],
  ALLOWED_UPLOAD: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
};

/**
 * Table configuration
 */
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_EXPORT_ROWS: 10000,
  BULK_ACTION_LIMIT: 100,
};

/**
 * Chart colors
 */
export const CHART_COLORS = {
  PRIMARY: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d'],
  SECONDARY: ['#722ed1', '#eb2f96', '#fa8c16', '#a0d911', '#1890ff'],
  GRADIENT: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ],
};

/**
 * Animation durations
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 200,
  MODAL_TRANSITION: 300,
};

/**
 * Z-index layers
 */
export const Z_INDEX = {
  DROPDOWN: 1050,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
  LOADING: 9999,
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
};

/**
 * Common filter configurations
 */
export const commonFilters = {
  search: {
    type: 'text',
    label: 'Search',
    placeholder: 'Enter keywords to search',
    quickFilter: true,
    span: 8,
  },
  status: {
    type: 'select',
    label: 'Status',
    placeholder: 'Select status',
    quickFilter: true,
    span: 6,
    options: [
      { label: 'All', value: '' },
      { label: 'Active', value: STATUS.ACTIVE },
      { label: 'Inactive', value: STATUS.INACTIVE },
      { label: 'Pending', value: STATUS.PENDING },
      { label: 'Approved', value: STATUS.APPROVED },
      { label: 'Rejected', value: STATUS.REJECTED },
      { label: 'Suspended', value: STATUS.SUSPENDED },
      { label: 'Banned', value: STATUS.BANNED },
    ],
  },
  dateRange: {
    type: 'daterange',
    label: 'Date Range',
    placeholder: ['Start Date', 'End Date'],
    quickFilter: false,
    span: 8,
  },
  role: {
    type: 'select',
    label: 'Role',
    placeholder: 'Select role',
    quickFilter: true,
    span: 6,
    options: [
      { label: 'All', value: '' },
      { label: 'Super Admin', value: USER_ROLES.SUPER_ADMIN },
      { label: 'Admin', value: USER_ROLES.ADMIN },
      { label: 'Moderator', value: USER_ROLES.MODERATOR },
      { label: 'Editor', value: USER_ROLES.EDITOR },
      { label: 'Author', value: USER_ROLES.AUTHOR },
      { label: 'User', value: USER_ROLES.USER },
    ],
  },
  genre: {
    type: 'select',
    label: 'Genre',
    placeholder: 'Select genre',
    quickFilter: true,
    span: 6,
    options: [
      { label: 'All', value: '' },
      { label: 'Fantasy', value: NOVEL_GENRES.FANTASY },
      { label: 'Romance', value: NOVEL_GENRES.ROMANCE },
      { label: 'Mystery', value: NOVEL_GENRES.MYSTERY },
      { label: 'Thriller', value: NOVEL_GENRES.THRILLER },
      { label: 'Horror', value: NOVEL_GENRES.HORROR },
      { label: 'Sci-Fi', value: NOVEL_GENRES.SCIFI },
      { label: 'Historical', value: NOVEL_GENRES.HISTORICAL },
      { label: 'Contemporary', value: NOVEL_GENRES.CONTEMPORARY },
      { label: 'Urban', value: NOVEL_GENRES.URBAN },
      { label: 'Martial Arts', value: NOVEL_GENRES.MARTIAL_ARTS },
      { label: 'Cultivation', value: NOVEL_GENRES.CULTIVATION },
      { label: 'System', value: NOVEL_GENRES.SYSTEM },
      { label: 'Reincarnation', value: NOVEL_GENRES.REINCARNATION },
      { label: 'Transmigration', value: NOVEL_GENRES.TRANSMIGRATION },
    ],
  },
  priority: {
    type: 'select',
    label: 'Priority',
    placeholder: 'Select priority',
    quickFilter: true,
    span: 6,
    options: [
      { label: 'All', value: '' },
      { label: 'Low', value: PRIORITY_LEVELS.LOW },
      { label: 'Normal', value: PRIORITY_LEVELS.NORMAL },
      { label: 'Medium', value: PRIORITY_LEVELS.MEDIUM },
      { label: 'High', value: PRIORITY_LEVELS.HIGH },
      { label: 'Urgent', value: PRIORITY_LEVELS.URGENT },
      { label: 'Critical', value: PRIORITY_LEVELS.CRITICAL },
    ],
  },
};

/**
 * Field types for forms and modals
 */
export const fieldTypes = {
  text: (name, label, options = {}) => ({
    type: 'text',
    name,
    label,
    ...options,
  }),
  textarea: (name, label, options = {}) => ({
    type: 'textarea',
    name,
    label,
    ...options,
  }),
  select: (name, label, options, config = {}) => ({
    type: 'select',
    name,
    label,
    options,
    ...config,
  }),
  number: (name, label, options = {}) => ({
    type: 'number',
    name,
    label,
    ...options,
  }),
  date: (name, label, options = {}) => ({
    type: 'date',
    name,
    label,
    ...options,
  }),
  daterange: (name, label, options = {}) => ({
    type: 'daterange',
    name,
    label,
    ...options,
  }),
  checkbox: (name, label, options = {}) => ({
    type: 'checkbox',
    name,
    label,
    ...options,
  }),
  radio: (name, label, radioOptions, config = {}) => ({
    type: 'radio',
    name,
    label,
    options: radioOptions,
    ...config,
  }),
  switch: (name, label, options = {}) => ({
    type: 'switch',
    name,
    label,
    ...options,
  }),
  upload: (name, label, options = {}) => ({
    type: 'upload',
    name,
    label,
    ...options,
  }),
  password: (name, label, options = {}) => ({
    type: 'password',
    name,
    label,
    ...options,
  }),
  email: (name, label, options = {}) => ({
    type: 'email',
    name,
    label,
    ...options,
  }),
  url: (name, label, options = {}) => ({
    type: 'url',
    name,
    label,
    ...options,
  }),
  tags: (name, label, options = {}) => ({
    type: 'tags',
    name,
    label,
    ...options,
  }),
  rating: (name, label, options = {}) => ({
    type: 'rating',
    name,
    label,
    ...options,
  }),
  slider: (name, label, options = {}) => ({
    type: 'slider',
    name,
    label,
    ...options,
  }),
  color: (name, label, options = {}) => ({
    type: 'color',
    name,
    label,
    ...options,
  }),
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: { required: true, message: 'This field is required' },
  email: { type: 'email', message: 'Please enter a valid email address' },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: 'Please enter a valid phone number',
  },
  password: { min: 8, message: 'Password must be at least 8 characters' },
  username: {
    pattern: /^[a-zA-Z0-9_-]{3,20}$/,
    message:
      'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens',
  },
  positiveNumber: {
    type: 'number',
    min: 0,
    message: 'Please enter a number greater than or equal to 0',
  },
  integer: { type: 'integer', message: 'Please enter an integer' },
  url: { type: 'url', message: 'Please enter a valid URL' },
  maxLength: (length) => ({
    max: length,
    message: `Maximum ${length} characters`,
  }),
  minLength: (length) => ({
    min: length,
    message: `Minimum ${length} characters`,
  }),
  range: (min, max) => ({
    min,
    max,
    message: `Length must be between ${min}-${max} characters`,
  }),
};

/**
 * Default form layout
 */
export const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

/**
 * Responsive form layout
 */
export const responsiveFormLayout = {
  xs: { labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  sm: { labelCol: { span: 8 }, wrapperCol: { span: 16 } },
  md: { labelCol: { span: 6 }, wrapperCol: { span: 18 } },
  lg: { labelCol: { span: 4 }, wrapperCol: { span: 20 } },
};

/**
 * Table action types
 */
export const TABLE_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  BAN: 'ban',
  SUSPEND: 'suspend',
  ACTIVATE: 'activate',
  FEATURE: 'feature',
  ARCHIVE: 'archive',
  EXPORT: 'export',
  DUPLICATE: 'duplicate',
};

/**
 * Bulk action types
 */
export const BULK_ACTIONS = {
  DELETE: 'bulk_delete',
  APPROVE: 'bulk_approve',
  REJECT: 'bulk_reject',
  BAN: 'bulk_ban',
  SUSPEND: 'bulk_suspend',
  ACTIVATE: 'bulk_activate',
  EXPORT: 'bulk_export',
  ARCHIVE: 'bulk_archive',
};

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
  PDF: 'pdf',
};

/**
 * Search operators
 */
export const SEARCH_OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  CONTAINS: 'contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  IN: 'in',
  NOT_IN: 'not_in',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',
};

/**
 * Error codes
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
};

/**
 * Success codes
 */
export const SUCCESS_CODES = {
  OK: 200,
  CREATED: 201,
  UPDATED: 200,
  DELETED: 204,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'yushan_admin_token',
  REFRESH_TOKEN: 'yushan_admin_refresh_token',
  USER_PROFILE: 'yushan_admin_user',
  THEME: 'yushan_admin_theme',
  LANGUAGE: 'yushan_admin_language',
  SIDEBAR_COLLAPSED: 'yushan_admin_sidebar_collapsed',
  TABLE_SETTINGS: 'yushan_admin_table_settings',
  DASHBOARD_LAYOUT: 'yushan_admin_dashboard_layout',
};

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  STATUS,
  USER_ROLES,
  NOVEL_GENRES,
  PRIORITY_LEVELS,
  REPORT_TYPES,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  THEMES,
  LANGUAGES,
  FILE_TYPES,
  TABLE_CONFIG,
  CHART_COLORS,
  ANIMATION,
  Z_INDEX,
  BREAKPOINTS,
  commonFilters,
  fieldTypes,
  validationRules,
  formLayout,
  responsiveFormLayout,
  TABLE_ACTIONS,
  BULK_ACTIONS,
  EXPORT_FORMATS,
  SEARCH_OPERATORS,
  ERROR_CODES,
  SUCCESS_CODES,
  STORAGE_KEYS,
};
