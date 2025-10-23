/* eslint-disable no-undef */
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportTableData,
  getTimestampedFilename,
  prepareDataForExport,
  getSupportedFormats,
  validateExportParams,
} from './exportutils';

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();

// Mock window.open for PDF export
let openSpy;
// Spy document methods used by downloadFile
let appendSpy, removeSpy;

beforeAll(() => {
  openSpy = jest.spyOn(window, 'open').mockImplementation(() => {
    return {
      document: {
        write: jest.fn(),
        close: jest.fn(),
      },
      print: jest.fn(),
    };
  });
});

afterAll(() => {
  openSpy.mockRestore();
});

describe('Export Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    // spy on document body DOM ops
    appendSpy = jest.spyOn(document.body, 'appendChild');
    removeSpy = jest.spyOn(document.body, 'removeChild');
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  describe('exportToCSV', () => {
    test('handles empty data', () => {
      exportToCSV([], [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('handles null data', () => {
      exportToCSV(null, [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('handles undefined data', () => {
      exportToCSV(undefined, [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('exportToExcel', () => {
    test('handles empty data', () => {
      exportToExcel([], [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('handles null data', () => {
      exportToExcel(null, [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('logs warning for missing xlsx', () => {
      const data = [{ id: 1 }];
      const columns = [{ key: 'id' }];
      exportToExcel(data, columns);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    test('handles empty data', () => {
      exportToJSON([], [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('handles null data', () => {
      exportToJSON(null, [], 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('handles undefined data', () => {
      exportToJSON(undefined, null, 'test');
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('Export error handling', () => {
    test('CSV logs warning on empty input', () => {
      exportToCSV([], []);
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('JSON logs warning on empty input', () => {
      exportToJSON([], []);
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });

    test('Excel logs warning on empty input', () => {
      exportToExcel([], []);
      expect(console.warn).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('exportToCSV/JSON download behavior', () => {
    test('CSV triggers anchor download flow', () => {
      const data = [{ id: 1, name: 'Alice, "A"' }];
      const columns = [
        { key: 'id', title: 'ID' },
        { key: 'name', title: 'Name' },
      ];
      exportToCSV(data, columns, 'users');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });

    test('JSON triggers anchor download flow', () => {
      const data = [{ id: 2, name: 'Bob' }];
      exportToJSON(data, [{ key: 'id' }, { key: 'name' }], 'users');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe('exportTableData', () => {
    test('no data => shows error toast (console.error)', async () => {
      const fetchData = jest.fn().mockResolvedValue({ data: [] });
      await exportTableData(
        fetchData,
        { page: 1 },
        [{ key: 'id', title: 'ID' }],
        'csv',
        'test'
      );
      expect(fetchData).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error:', '没有数据可导出');
    });

    test('exports CSV when data present', async () => {
      const rows = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];
      const fetchData = jest.fn().mockResolvedValue({ data: rows });
      await exportTableData(
        fetchData,
        { page: 2, pageSize: 10 },
        [
          { key: 'id', title: 'ID' },
          { key: 'name', title: 'Name' },
        ],
        'csv',
        'users'
      );
      expect(fetchData).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 10000 })
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('getTimestampedFilename', () => {
    test('returns filename with timestamp and extension', () => {
      const name = getTimestampedFilename('export', 'csv');
      expect(name).toMatch(/^export_\d{8}T?\d{6,}\.csv$/);
    });
  });

  describe('prepareDataForExport', () => {
    test('filters hidden columns and formats values', () => {
      const data = [
        {
          id: 1,
          html: '<b>strong</b>',
          date: '2024-01-01',
          long: 'x'.repeat(1100),
          nested: { a: 'v' },
        },
      ];
      const columns = [
        { key: 'id', title: 'ID' },
        { key: 'html', title: 'HTML' },
        { key: 'date', title: 'Date' },
        { key: 'long', title: 'Long', hidden: false },
        { key: 'nested.a', title: 'Nested' },
        { key: 'hidden', title: 'Hidden', hidden: true },
      ];
      const res = prepareDataForExport(data, columns, {
        includeHidden: false,
        maxLength: 100,
      });
      expect(Object.keys(res[0])).toEqual(
        expect.arrayContaining(['ID', 'HTML', 'Date', 'Long', 'Nested'])
      );
      expect(Object.keys(res[0])).not.toContain('Hidden');
      expect(res[0]['HTML']).toBe('strong');
      // date formatted (zh-CN locale), just ensure it changed from ISO style
      expect(res[0]['Date']).not.toBe('2024-01-01');
      expect(res[0]['Long'].endsWith('...')).toBe(true);
      expect(res[0]['Nested']).toBe('v');
    });
  });

  describe('getSupportedFormats', () => {
    test('returns list of supported formats', () => {
      const f = getSupportedFormats();
      expect(f.map((x) => x.value)).toEqual(
        expect.arrayContaining(['csv', 'excel', 'json', 'pdf'])
      );
    });
  });

  describe('validateExportParams', () => {
    test('invalid inputs return errors', () => {
      const res = validateExportParams([], [], 'xml');
      expect(res.isValid).toBe(false);
      expect(res.errors.join(' ')).toMatch(/没有数据可导出/);
      expect(res.errors.join(' ')).toMatch(/没有列配置/);
      expect(res.errors.join(' ')).toMatch(/不支持的导出格式/);
    });

    test('valid inputs return isValid=true', () => {
      const res = validateExportParams(
        [{ id: 1 }],
        [{ key: 'id', title: 'ID' }],
        'csv'
      );
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });
  });
});
