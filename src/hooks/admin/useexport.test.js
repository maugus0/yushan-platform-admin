import { renderHook, act } from '@testing-library/react';
import { useExport } from './useexport';

describe('useExport Hook (end-to-end)', () => {
  let origCreateObjectURL;
  let origRevokeObjectURL;
  let origCreateElement;
  let anchorClickMock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL object methods
    origCreateObjectURL = URL.createObjectURL;
    origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();

    // Mock document.createElement for <a>
    origCreateElement = document.createElement;
    anchorClickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        const a = origCreateElement.call(document, 'a');
        a.click = anchorClickMock;
        return a;
      }
      return origCreateElement.call(document, tagName);
    });
  });

  afterEach(() => {
    // Restore mocks
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    document.createElement = origCreateElement;
  });

  describe('Converters', () => {
    test('convertToCSV: custom fields, custom delimiter, no headers', () => {
      const { result } = renderHook(() => useExport());
      const data = [
        { a: 1, b: 2 },
        { a: 3, b: 4 },
      ];
      const csv = result.current.convertToCSV(data, {
        delimiter: ';',
        includeHeaders: false,
        customFields: ['b', 'a'],
      });
      const lines = csv.split('\n');
      expect(lines[0]).toBe('2;1');
      expect(lines[1]).toBe('4;3');
    });

    test('convertToCSV: customFields with transform', () => {
      const { result } = renderHook(() => useExport());
      const data = [{ n: 'john', s: 'active' }];
      const csv = result.current.convertToCSV(data, {
        customFields: [
          { key: 'n', label: 'name', transform: (v) => v.toUpperCase() },
          { key: 's', label: 'status' },
        ],
      });
      const lines = csv.split('\n');
      expect(lines[0]).toBe('name,status');
      expect(lines[1]).toBe('JOHN,active');
    });

    test('convertToJSON: pretty vs compact, with customFields', () => {
      const { result } = renderHook(() => useExport());
      const data = [{ a: 1, b: 2 }];
      const pretty = result.current.convertToJSON(data, { pretty: true });
      const compact = result.current.convertToJSON(data, { pretty: false });
      expect(pretty.split('\n').length).toBeGreaterThan(1);
      expect(compact.includes('\n')).toBe(false);

      const mapped = result.current.convertToJSON(data, {
        customFields: [{ key: 'a', label: 'A' }],
      });
      expect(JSON.parse(mapped)).toEqual([{ A: 1 }]);
    });

    test('convertToExcel: returns sheet info with CSV data', () => {
      const { result } = renderHook(() => useExport());
      const data = [{ x: 1, y: 2 }];
      const excel = result.current.convertToExcel(data, {
        sheetName: 'Test',
        customFields: ['x'],
      });
      expect(excel.sheetName).toBe('Test');
      expect(excel.mimeType).toMatch(/spreadsheetml\.sheet/);
      expect(excel.data).toContain('x'); // csv header
      expect(excel.data.split('\n')[1]).toBe('1');
    });
  });

  describe('downloadFile', () => {
    test('creates blob URL, triggers anchor click, revokes URL', () => {
      const { result } = renderHook(() => useExport());
      act(() => {
        result.current.downloadFile('content', 'file.txt', 'text/plain');
      });
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(anchorClickMock).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportData flows', () => {
    test('exportData CSV: sets progress, downloads, returns meta', async () => {
      const { result } = renderHook(() => useExport());
      const progressMarks = [];
      const data = [
        { name: 'A', v: 1 },
        { name: 'B', v: 2 },
      ];

      let res;
      await act(async () => {
        res = await result.current.exportData(data, 'csv', {
          filename: 'test_export',
          onProgress: (p) => progressMarks.push(p),
        });
      });

      expect(res.success).toBe(true);
      expect(res.filename).toBe('test_export.csv');
      expect(res.format).toBe('csv');
      expect(res.recordCount).toBe(2);
      expect(progressMarks[0]).toBeGreaterThanOrEqual(30); // ~33
      expect(progressMarks).toContain(100);
    });

    test('exportData JSON: downloads JSON', async () => {
      const { result } = renderHook(() => useExport());
      await act(async () => {
        const res = await result.current.exportData([{ a: 1 }], 'json', {
          filename: 'json_out',
        });
        expect(res.success).toBe(true);
        expect(res.filename).toBe('json_out.json');
      });
      expect(anchorClickMock).toHaveBeenCalled();
    });

    test('exportData EXCEL: uses CSV payload with xlsx mime type', async () => {
      const { result } = renderHook(() => useExport());
      await act(async () => {
        const res = await result.current.exportData([{ a: 1 }], 'excel', {
          filename: 'excel_out',
        });
        expect(res.success).toBe(true);
        expect(res.filename).toBe('excel_out.xlsx');
      });
    });

    test('exportData with unsupported format returns error and sets error state', async () => {
      const { result } = renderHook(() => useExport());
      let res;
      await act(async () => {
        res = await result.current.exportData([{ a: 1 }], 'pdf');
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unsupported export format/i);
      // clearError should remove error
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });

    test('exportSelected empty should return error and not download', async () => {
      const { result } = renderHook(() => useExport());
      let res;
      await act(async () => {
        res = await result.current.exportSelected([], 'csv', { filename: 'x' });
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/No data selected/i);
      expect(anchorClickMock).not.toHaveBeenCalled();
    });

    test('exportFiltered applies simple filter rules and downloads', async () => {
      const { result } = renderHook(() => useExport());
      const allData = [
        { name: 'John', role: 'admin' },
        { name: 'Jane', role: 'user' },
        { name: 'Bob', role: 'user' },
      ];
      await act(async () => {
        const res = await result.current.exportFiltered(
          allData,
          { role: 'user', name: 'a' }, // name contains 'a', role equals 'user'
          'csv',
          { filename: 'filtered' }
        );
        expect(res.success).toBe(true);
      });
      // Should have triggered a download of filtered rows (Jane only)
      expect(anchorClickMock).toHaveBeenCalled();
    });

    test('resetExport resets state to defaults', async () => {
      const { result } = renderHook(() => useExport());
      // Trigger an export to change state
      await act(async () => {
        await result.current.exportData([{ a: 1 }], 'csv', {
          filename: 'tmp',
        });
      });

      // Now set an error and progress, then reset
      await act(async () => {
        await result.current.exportData([{ a: 1 }], 'zzz'); // unsupported -> error
      });

      act(() => {
        result.current.resetExport();
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Utilities contract', () => {
    test('getSupportedFormats returns array with required entries', () => {
      const { result } = renderHook(() => useExport());
      const formats = result.current.getSupportedFormats();
      expect(Array.isArray(formats)).toBe(true);
      const keys = formats.map((f) => f.value);
      expect(keys).toEqual(expect.arrayContaining(['csv', 'json', 'excel']));
    });

    test('state defaults', () => {
      const { result } = renderHook(() => useExport());
      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });
});
