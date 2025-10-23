import {
  APP_CONFIG,
  API_ENDPOINTS,
  STATUS,
  USER_ROLES,
  NOVEL_GENRES,
  PRIORITY_LEVELS,
  REPORT_TYPES,
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
  TABLE_ACTIONS,
  BULK_ACTIONS,
  EXPORT_FORMATS,
  SEARCH_OPERATORS,
  ERROR_CODES,
  SUCCESS_CODES,
  STORAGE_KEYS,
} from './constants';

describe('Constants Module', () => {
  describe('APP_CONFIG', () => {
    test('has required application configuration', () => {
      expect(APP_CONFIG).toBeDefined();
      expect(APP_CONFIG.NAME).toBe('Yushan Admin');
      expect(APP_CONFIG.VERSION).toBe('1.0.0');
      expect(APP_CONFIG.DEFAULT_LANGUAGE).toBe('zh-CN');
    });

    test('has valid settings', () => {
      expect(APP_CONFIG.ITEMS_PER_PAGE).toBe(20);
      expect(APP_CONFIG.MAX_UPLOAD_SIZE).toBeGreaterThan(0);
    });
  });

  describe('API_ENDPOINTS', () => {
    test('API_ENDPOINTS is defined', () => {
      expect(API_ENDPOINTS).toBeDefined();
    });

    test('has core endpoints', () => {
      expect(API_ENDPOINTS.AUTH).toBeDefined();
      expect(API_ENDPOINTS.USERS).toBeDefined();
      expect(API_ENDPOINTS.NOVELS).toBeDefined();
    });

    test('auth endpoints are strings', () => {
      expect(typeof API_ENDPOINTS.AUTH.LOGIN).toBe('string');
      expect(typeof API_ENDPOINTS.AUTH.LOGOUT).toBe('string');
    });

    test('user endpoints are configured', () => {
      expect(API_ENDPOINTS.USERS.LIST).toBeDefined();
      expect(API_ENDPOINTS.USERS.BAN).toBeDefined();
      expect(API_ENDPOINTS.USERS.SUSPEND).toBeDefined();
    });

    test('novel endpoints are configured', () => {
      expect(API_ENDPOINTS.NOVELS).toBeDefined();
      expect(API_ENDPOINTS.NOVELS.LIST).toBeDefined();
      expect(API_ENDPOINTS.NOVELS.APPROVE).toBeDefined();
    });
  });

  describe('All endpoint categories exist', () => {
    test('has all required endpoint categories', () => {
      const categories = [
        'AUTH',
        'USERS',
        'NOVELS',
        'CHAPTERS',
        'COMMENTS',
        'REVIEWS',
        'REPORTS',
        'CATEGORIES',
        'YUAN',
        'RANKINGS',
        'SETTINGS',
        'DASHBOARD',
      ];
      categories.forEach((cat) => {
        expect(API_ENDPOINTS[cat]).toBeDefined();
      });
    });
  });

  describe('STATUS', () => {
    test('has key statuses', () => {
      expect(STATUS.ACTIVE).toBe('active');
      expect(STATUS.SUSPENDED).toBe('suspended');
      expect(STATUS.BANNED).toBe('banned');
      expect(STATUS.PUBLISHED).toBe('published');
      expect(STATUS.RESOLVED).toBe('resolved');
    });
  });

  describe('USER_ROLES', () => {
    test('contains all roles', () => {
      expect(USER_ROLES.SUPER_ADMIN).toBe('super_admin');
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.EDITOR).toBe('editor');
      expect(USER_ROLES.AUTHOR).toBe('author');
      expect(USER_ROLES.USER).toBe('user');
    });
  });

  describe('NOVEL_GENRES', () => {
    test('includes representative genres', () => {
      expect(NOVEL_GENRES.FANTASY).toBe('fantasy');
      expect(NOVEL_GENRES.ROMANCE).toBe('romance');
      expect(NOVEL_GENRES.MARTIAL_ARTS).toBe('martial_arts');
      expect(NOVEL_GENRES.CULTIVATION).toBe('cultivation');
      expect(NOVEL_GENRES.SCIFI).toBe('scifi');
    });
  });

  describe('PRIORITY_LEVELS', () => {
    test('priority labels', () => {
      expect(PRIORITY_LEVELS.LOW).toBe('low');
      expect(PRIORITY_LEVELS.CRITICAL).toBe('critical');
    });
  });

  describe('REPORT_TYPES', () => {
    test('report categories', () => {
      expect(REPORT_TYPES.SPAM).toBe('spam');
      expect(REPORT_TYPES.COPYRIGHT).toBe('copyright');
      expect(REPORT_TYPES.OTHER).toBe('other');
    });
  });

  describe('DATE_FORMATS', () => {
    test('format strings are defined', () => {
      expect(DATE_FORMATS.SHORT).toMatch(/YYYY/);
      expect(DATE_FORMATS.DATETIME).toMatch(/HH:mm/);
    });
  });

  describe('TABLE_CONFIG', () => {
    test('pagination and limits', () => {
      expect(TABLE_CONFIG.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
      expect(TABLE_CONFIG.PAGE_SIZE_OPTIONS).toContain(10);
      expect(TABLE_CONFIG.MAX_EXPORT_ROWS).toBeGreaterThan(0);
    });
  });

  describe('EXPORT_FORMATS', () => {
    test('export options', () => {
      expect(EXPORT_FORMATS.CSV).toBe('csv');
      expect(EXPORT_FORMATS.EXCEL).toBe('excel');
      expect(EXPORT_FORMATS.JSON).toBe('json');
      expect(EXPORT_FORMATS.PDF).toBe('pdf');
    });
  });

  describe('ERROR_CODES and SUCCESS_CODES', () => {
    test('HTTP error codes', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBe(401);
      expect(ERROR_CODES.NOT_FOUND).toBe(404);
      expect(ERROR_CODES.SERVER_ERROR).toBe(500);
    });
    test('HTTP success codes', () => {
      expect(SUCCESS_CODES.OK).toBe(200);
      expect(SUCCESS_CODES.CREATED).toBe(201);
      expect(SUCCESS_CODES.DELETED).toBe(204);
    });
  });

  describe('STORAGE_KEYS', () => {
    test('storage key strings', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toMatch(/token/i);
      expect(STORAGE_KEYS.USER_PROFILE).toMatch(/user/i);
      expect(typeof STORAGE_KEYS.TABLE_SETTINGS).toBe('string');
    });
  });

  describe('UI and theme constants', () => {
    test('themes exist', () => {
      expect(Object.values(THEMES)).toEqual(
        expect.arrayContaining(['light', 'dark', 'auto'])
      );
    });
    test('languages include zh-CN and en-US', () => {
      expect(LANGUAGES.ZH_CN).toBe('zh-CN');
      expect(LANGUAGES.EN_US).toBe('en-US');
    });
    test('file types include images and documents', () => {
      expect(FILE_TYPES.IMAGE).toEqual(expect.arrayContaining(['jpg', 'png']));
      expect(FILE_TYPES.DOCUMENT).toEqual(
        expect.arrayContaining(['pdf', 'doc'])
      );
    });
    test('chart colors arrays not empty', () => {
      expect(CHART_COLORS.PRIMARY.length).toBeGreaterThan(0);
    });
    test('animation and z-index expose numeric values', () => {
      expect(ANIMATION.NORMAL).toBeGreaterThan(0);
      expect(Z_INDEX.MODAL).toBeGreaterThan(0);
    });
    test('breakpoints are numeric', () => {
      expect(BREAKPOINTS.MD).toBeGreaterThan(0);
    });
  });

  describe('commonFilters', () => {
    test('has search/status/dateRange quick filters', () => {
      expect(commonFilters.search.type).toBe('text');
      expect(commonFilters.status.type).toBe('select');
      expect(commonFilters.dateRange.type).toBe('daterange');
    });

    test('search filter configuration', () => {
      expect(commonFilters.search.label).toBe('Search');
      expect(commonFilters.search.placeholder).toBe('Enter keywords to search');
      expect(commonFilters.search.quickFilter).toBe(true);
      expect(commonFilters.search.span).toBe(8);
    });

    test('status filter options', () => {
      expect(commonFilters.status.options).toEqual(
        expect.arrayContaining([
          { label: 'All', value: '' },
          { label: 'Active', value: STATUS.ACTIVE },
          { label: 'Inactive', value: STATUS.INACTIVE },
          { label: 'Pending', value: STATUS.PENDING },
          { label: 'Approved', value: STATUS.APPROVED },
          { label: 'Rejected', value: STATUS.REJECTED },
          { label: 'Suspended', value: STATUS.SUSPENDED },
          { label: 'Banned', value: STATUS.BANNED },
        ])
      );
    });

    test('role filter options', () => {
      expect(commonFilters.role.options).toEqual(
        expect.arrayContaining([
          { label: 'All', value: '' },
          { label: 'Super Admin', value: USER_ROLES.SUPER_ADMIN },
          { label: 'Admin', value: USER_ROLES.ADMIN },
          { label: 'Moderator', value: USER_ROLES.MODERATOR },
          { label: 'Editor', value: USER_ROLES.EDITOR },
          { label: 'Author', value: USER_ROLES.AUTHOR },
          { label: 'User', value: USER_ROLES.USER },
        ])
      );
    });

    test('genre filter options', () => {
      expect(commonFilters.genre.options).toEqual(
        expect.arrayContaining([
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
        ])
      );
    });

    test('priority filter options', () => {
      expect(commonFilters.priority.options).toEqual(
        expect.arrayContaining([
          { label: 'All', value: '' },
          { label: 'Low', value: PRIORITY_LEVELS.LOW },
          { label: 'Normal', value: PRIORITY_LEVELS.NORMAL },
          { label: 'Medium', value: PRIORITY_LEVELS.MEDIUM },
          { label: 'High', value: PRIORITY_LEVELS.HIGH },
          { label: 'Urgent', value: PRIORITY_LEVELS.URGENT },
          { label: 'Critical', value: PRIORITY_LEVELS.CRITICAL },
        ])
      );
    });
  });

  describe('fieldTypes', () => {
    test('factory returns config objects with type and name', () => {
      const f = fieldTypes.text('title', 'Title');
      expect(f.type).toBe('text');
      expect(f.name).toBe('title');
      const s = fieldTypes.select('status', 'Status', [
        { label: 'A', value: 'a' },
      ]);
      expect(s.type).toBe('select');
      expect(s.options[0].value).toBe('a');
    });

    test('text field type', () => {
      const field = fieldTypes.text('name', 'Full Name', {
        required: true,
        placeholder: 'Enter name',
      });
      expect(field).toEqual({
        type: 'text',
        name: 'name',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter name',
      });
    });

    test('textarea field type', () => {
      const field = fieldTypes.textarea('description', 'Description', {
        rows: 4,
      });
      expect(field).toEqual({
        type: 'textarea',
        name: 'description',
        label: 'Description',
        rows: 4,
      });
    });

    test('select field type', () => {
      const options = [{ label: 'Option 1', value: '1' }];
      const field = fieldTypes.select('category', 'Category', options, {
        multiple: true,
      });
      expect(field).toEqual({
        type: 'select',
        name: 'category',
        label: 'Category',
        options,
        multiple: true,
      });
    });

    test('number field type', () => {
      const field = fieldTypes.number('age', 'Age', { min: 0, max: 120 });
      expect(field).toEqual({
        type: 'number',
        name: 'age',
        label: 'Age',
        min: 0,
        max: 120,
      });
    });

    test('date field type', () => {
      const field = fieldTypes.date('birthdate', 'Birth Date', {
        format: 'YYYY-MM-DD',
      });
      expect(field).toEqual({
        type: 'date',
        name: 'birthdate',
        label: 'Birth Date',
        format: 'YYYY-MM-DD',
      });
    });

    test('daterange field type', () => {
      const field = fieldTypes.daterange('period', 'Time Period', {
        showTime: true,
      });
      expect(field).toEqual({
        type: 'daterange',
        name: 'period',
        label: 'Time Period',
        showTime: true,
      });
    });

    test('checkbox field type', () => {
      const field = fieldTypes.checkbox('agree', 'I agree', {
        defaultChecked: false,
      });
      expect(field).toEqual({
        type: 'checkbox',
        name: 'agree',
        label: 'I agree',
        defaultChecked: false,
      });
    });

    test('radio field type', () => {
      const radioOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ];
      const field = fieldTypes.radio('choice', 'Choose', radioOptions, {
        buttonStyle: 'solid',
      });
      expect(field).toEqual({
        type: 'radio',
        name: 'choice',
        label: 'Choose',
        options: radioOptions,
        buttonStyle: 'solid',
      });
    });

    test('switch field type', () => {
      const field = fieldTypes.switch('enabled', 'Enabled', {
        defaultChecked: true,
      });
      expect(field).toEqual({
        type: 'switch',
        name: 'enabled',
        label: 'Enabled',
        defaultChecked: true,
      });
    });

    test('upload field type', () => {
      const field = fieldTypes.upload('avatar', 'Avatar', {
        accept: 'image/*',
        maxCount: 1,
      });
      expect(field).toEqual({
        type: 'upload',
        name: 'avatar',
        label: 'Avatar',
        accept: 'image/*',
        maxCount: 1,
      });
    });

    test('password field type', () => {
      const field = fieldTypes.password('password', 'Password', {
        minLength: 8,
      });
      expect(field).toEqual({
        type: 'password',
        name: 'password',
        label: 'Password',
        minLength: 8,
      });
    });

    test('email field type', () => {
      const field = fieldTypes.email('email', 'Email Address', {
        required: true,
      });
      expect(field).toEqual({
        type: 'email',
        name: 'email',
        label: 'Email Address',
        required: true,
      });
    });

    test('url field type', () => {
      const field = fieldTypes.url('website', 'Website', {
        placeholder: 'https://',
      });
      expect(field).toEqual({
        type: 'url',
        name: 'website',
        label: 'Website',
        placeholder: 'https://',
      });
    });

    test('tags field type', () => {
      const field = fieldTypes.tags('tags', 'Tags', { maxTagCount: 5 });
      expect(field).toEqual({
        type: 'tags',
        name: 'tags',
        label: 'Tags',
        maxTagCount: 5,
      });
    });

    test('rating field type', () => {
      const field = fieldTypes.rating('rating', 'Rating', {
        count: 5,
        allowHalf: true,
      });
      expect(field).toEqual({
        type: 'rating',
        name: 'rating',
        label: 'Rating',
        count: 5,
        allowHalf: true,
      });
    });

    test('slider field type', () => {
      const field = fieldTypes.slider('volume', 'Volume', {
        min: 0,
        max: 100,
        step: 10,
      });
      expect(field).toEqual({
        type: 'slider',
        name: 'volume',
        label: 'Volume',
        min: 0,
        max: 100,
        step: 10,
      });
    });

    test('color field type', () => {
      const field = fieldTypes.color('color', 'Color', { showText: true });
      expect(field).toEqual({
        type: 'color',
        name: 'color',
        label: 'Color',
        showText: true,
      });
    });
  });

  describe('validationRules', () => {
    test('has required/email/password rules', () => {
      expect(validationRules.required.required).toBe(true);
      expect(validationRules.email.type).toBe('email');
      expect(validationRules.password.min).toBeGreaterThan(0);
    });

    test('required validation rule', () => {
      expect(validationRules.required).toEqual({
        required: true,
        message: 'This field is required',
      });
    });

    test('email validation rule', () => {
      expect(validationRules.email).toEqual({
        type: 'email',
        message: 'Please enter a valid email address',
      });
    });

    test('phone validation rule', () => {
      expect(validationRules.phone.pattern).toBeInstanceOf(RegExp);
      expect(validationRules.phone.message).toBe(
        'Please enter a valid phone number'
      );
    });

    test('password validation rule', () => {
      expect(validationRules.password.min).toBe(8);
      expect(validationRules.password.message).toBe(
        'Password must be at least 8 characters'
      );
    });

    test('username validation rule', () => {
      expect(validationRules.username.pattern).toBeInstanceOf(RegExp);
      expect(validationRules.username.message).toContain(
        'Username must be 3-20 characters'
      );
    });

    test('positiveNumber validation rule', () => {
      expect(validationRules.positiveNumber.type).toBe('number');
      expect(validationRules.positiveNumber.min).toBe(0);
      expect(validationRules.positiveNumber.message).toBe(
        'Please enter a number greater than or equal to 0'
      );
    });

    test('integer validation rule', () => {
      expect(validationRules.integer.type).toBe('integer');
      expect(validationRules.integer.message).toBe('Please enter an integer');
    });

    test('url validation rule', () => {
      expect(validationRules.url.type).toBe('url');
      expect(validationRules.url.message).toBe('Please enter a valid URL');
    });

    test('maxLength validation rule factory', () => {
      const rule = validationRules.maxLength(100);
      expect(rule.max).toBe(100);
      expect(rule.message).toBe('Maximum 100 characters');
    });

    test('minLength validation rule factory', () => {
      const rule = validationRules.minLength(5);
      expect(rule.min).toBe(5);
      expect(rule.message).toBe('Minimum 5 characters');
    });

    test('range validation rule factory', () => {
      const rule = validationRules.range(5, 100);
      expect(rule.min).toBe(5);
      expect(rule.max).toBe(100);
      expect(rule.message).toBe('Length must be between 5-100 characters');
    });
  });

  describe('Table and bulk actions enums', () => {
    test('TABLE_ACTIONS include CRUD', () => {
      expect(TABLE_ACTIONS.VIEW).toBe('view');
      expect(TABLE_ACTIONS.EDIT).toBe('edit');
      expect(TABLE_ACTIONS.DELETE).toBe('delete');
    });
    test('BULK_ACTIONS include bulk operations', () => {
      expect(BULK_ACTIONS.DELETE).toBe('bulk_delete');
      expect(BULK_ACTIONS.EXPORT).toBe('bulk_export');
    });
  });

  describe('SEARCH_OPERATORS', () => {
    test('string operators defined', () => {
      expect(SEARCH_OPERATORS.CONTAINS).toBe('contains');
      expect(SEARCH_OPERATORS.STARTS_WITH).toBe('starts_with');
      expect(SEARCH_OPERATORS.BETWEEN).toBe('between');
    });

    test('comparison operators', () => {
      expect(SEARCH_OPERATORS.EQUALS).toBe('eq');
      expect(SEARCH_OPERATORS.NOT_EQUALS).toBe('ne');
      expect(SEARCH_OPERATORS.GREATER_THAN).toBe('gt');
      expect(SEARCH_OPERATORS.GREATER_THAN_OR_EQUAL).toBe('gte');
      expect(SEARCH_OPERATORS.LESS_THAN).toBe('lt');
      expect(SEARCH_OPERATORS.LESS_THAN_OR_EQUAL).toBe('lte');
    });

    test('array and null operators', () => {
      expect(SEARCH_OPERATORS.IN).toBe('in');
      expect(SEARCH_OPERATORS.NOT_IN).toBe('not_in');
      expect(SEARCH_OPERATORS.IS_NULL).toBe('is_null');
      expect(SEARCH_OPERATORS.IS_NOT_NULL).toBe('is_not_null');
    });
  });

  describe('CHART_COLORS', () => {
    test('primary colors array', () => {
      expect(CHART_COLORS.PRIMARY).toBeInstanceOf(Array);
      expect(CHART_COLORS.PRIMARY.length).toBeGreaterThan(0);
      expect(CHART_COLORS.PRIMARY[0]).toMatch(/^#/);
    });

    test('secondary colors array', () => {
      expect(CHART_COLORS.SECONDARY).toBeInstanceOf(Array);
      expect(CHART_COLORS.SECONDARY.length).toBeGreaterThan(0);
    });

    test('gradient colors array', () => {
      expect(CHART_COLORS.GRADIENT).toBeInstanceOf(Array);
      expect(CHART_COLORS.GRADIENT.length).toBeGreaterThan(0);
      expect(CHART_COLORS.GRADIENT[0]).toMatch(/linear-gradient/);
    });
  });

  describe('ANIMATION and Z_INDEX', () => {
    test('animation durations', () => {
      expect(ANIMATION.FAST).toBe(150);
      expect(ANIMATION.NORMAL).toBe(300);
      expect(ANIMATION.SLOW).toBe(500);
      expect(ANIMATION.PAGE_TRANSITION).toBe(200);
      expect(ANIMATION.MODAL_TRANSITION).toBe(300);
    });

    test('z-index layers', () => {
      expect(Z_INDEX.DROPDOWN).toBe(1050);
      expect(Z_INDEX.MODAL_BACKDROP).toBe(1040);
      expect(Z_INDEX.MODAL).toBe(1050);
      expect(Z_INDEX.POPOVER).toBe(1060);
      expect(Z_INDEX.TOOLTIP).toBe(1070);
      expect(Z_INDEX.NOTIFICATION).toBe(1080);
      expect(Z_INDEX.LOADING).toBe(9999);
    });
  });

  describe('BREAKPOINTS', () => {
    test('responsive breakpoints', () => {
      expect(BREAKPOINTS.XS).toBe(480);
      expect(BREAKPOINTS.SM).toBe(576);
      expect(BREAKPOINTS.MD).toBe(768);
      expect(BREAKPOINTS.LG).toBe(992);
      expect(BREAKPOINTS.XL).toBe(1200);
      expect(BREAKPOINTS.XXL).toBe(1600);
    });
  });

  describe('APP_CONFIG sanity', () => {
    test('timeouts and sizes are positive', () => {
      expect(APP_CONFIG.MAX_UPLOAD_SIZE).toBeGreaterThan(0);
      expect(APP_CONFIG.SESSION_TIMEOUT).toBeGreaterThan(0);
    });
  });

  describe('API_ENDPOINTS shape', () => {
    test('AUTH endpoints include LOGIN/LOGOUT/REFRESH/PROFILE', () => {
      expect(API_ENDPOINTS.AUTH).toEqual(
        expect.objectContaining({
          LOGIN: expect.any(String),
          LOGOUT: expect.any(String),
          REFRESH: expect.any(String),
          PROFILE: expect.any(String),
        })
      );
    });
  });
});
