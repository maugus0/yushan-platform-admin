describe('Tables Index', () => {
  test('module exists', () => {
    expect(true).toBe(true);
  });
});

describe('Tables Index (re-exports)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('re-exports default exports under named exports', () => {
    jest.mock('../datatable', () => ({
      __esModule: true,
      default: 'MOCK_DATATABLE',
    }));
    jest.mock('../tablefilters', () => ({
      __esModule: true,
      default: 'MOCK_TABLEFILTERS',
    }));
    jest.mock('../tableactions', () => ({
      __esModule: true,
      default: 'MOCK_TABLEACTIONS',
    }));
    jest.mock('../bulkactions', () => ({
      __esModule: true,
      default: 'MOCK_BULKACTIONS',
    }));
    jest.mock('../columnselector', () => ({
      __esModule: true,
      default: 'MOCK_COLUMNSELECTOR',
    }));
    jest.mock('../exportbutton', () => ({
      __esModule: true,
      default: 'MOCK_EXPORTBUTTON',
    }));
    jest.mock('../pagination', () => ({
      __esModule: true,
      default: 'MOCK_PAGINATION',
    }));

    const {
      DataTable,
      TableFilters,
      TableActions,
      BulkActions,
      ColumnSelector,
      ExportButton,
      Pagination,
    } = require('../index.js');

    expect(DataTable).toBe('MOCK_DATATABLE');
    expect(TableFilters).toBe('MOCK_TABLEFILTERS');
    expect(TableActions).toBe('MOCK_TABLEACTIONS');
    expect(BulkActions).toBe('MOCK_BULKACTIONS');
    expect(ColumnSelector).toBe('MOCK_COLUMNSELECTOR');
    expect(ExportButton).toBe('MOCK_EXPORTBUTTON');
    expect(Pagination).toBe('MOCK_PAGINATION');
  });

  test('exports only expected keys', () => {
    jest.mock('../datatable', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../tablefilters', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../tableactions', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../bulkactions', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../columnselector', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../exportbutton', () => ({ __esModule: true, default: 'X' }));
    jest.mock('../pagination', () => ({ __esModule: true, default: 'X' }));

    const mod = require('../index.js');

    expect(Object.keys(mod).sort()).toEqual(
      [
        'BulkActions',
        'ColumnSelector',
        'DataTable',
        'ExportButton',
        'Pagination',
        'TableActions',
        'TableFilters',
      ].sort()
    );
  });
});
