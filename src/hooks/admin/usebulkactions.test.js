import { renderHook, act, waitFor } from '@testing-library/react';
import { useBulkActions } from './usebulkactions';

describe('useBulkActions Hook', () => {
  const mockData = [
    { id: 1, name: 'Item 1', status: 'active' },
    { id: 2, name: 'Item 2', status: 'inactive' },
    { id: 3, name: 'Item 3', status: 'pending' },
    { id: 4, name: 'Item 4', status: 'active' },
  ];

  describe('Initial State', () => {
    test('initializes with empty selection', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.selectedData).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelectAll).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test('initializes with empty data', () => {
      const { result } = renderHook(() => useBulkActions([]));

      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.selectedData).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('Selection State', () => {
    test('isAllSelected returns true when all items are selected', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isIndeterminate).toBe(false);
    });

    test('isIndeterminate returns true when some items are selected', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
      });

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(true);
    });

    test('isAllSelected and isIndeterminate return false when no items are selected', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(false);
    });
  });

  describe('Single Item Selection', () => {
    test('selectItem adds item to selection', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      expect(result.current.selectedItems).toContain(1);
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isItemSelected(1)).toBe(true);
    });

    test('deselectItem removes item from selection', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.deselectItem(1);
      });

      expect(result.current.selectedItems).not.toContain(1);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isItemSelected(1)).toBe(false);
    });

    test('toggleItem toggles item selection', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      // First toggle - select
      act(() => {
        result.current.toggleItem(1);
      });

      expect(result.current.isItemSelected(1)).toBe(true);

      // Second toggle - deselect
      act(() => {
        result.current.toggleItem(1);
      });

      expect(result.current.isItemSelected(1)).toBe(false);
    });

    test('selecting multiple items updates count correctly', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
        result.current.selectItem(3);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.selectedItems).toEqual([1, 2, 3]);
    });
  });

  describe('Select All Functionality', () => {
    test('selectAll selects all items', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedItems).toEqual([1, 2, 3, 4]);
      expect(result.current.selectedCount).toBe(4);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isSelectAll).toBe(true);
    });

    test('deselectAll removes all selections', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectAll();
        result.current.deselectAll();
      });

      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isSelectAll).toBe(false);
    });

    test('toggleSelectAll toggles between select all and deselect all', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      // First toggle - select all
      act(() => {
        result.current.toggleSelectAll();
      });

      expect(result.current.isAllSelected).toBe(true);

      // Second toggle - deselect all
      act(() => {
        result.current.toggleSelectAll();
      });

      expect(result.current.isAllSelected).toBe(false);
    });
  });

  describe('Selected Data', () => {
    test('selectedData returns correct items', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(3);
      });

      expect(result.current.selectedData).toEqual([
        { id: 1, name: 'Item 1', status: 'active' },
        { id: 3, name: 'Item 3', status: 'pending' },
      ]);
    });

    test('selectedData updates when data changes', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useBulkActions(data),
        { initialProps: { data: mockData } }
      );

      act(() => {
        result.current.selectItem(1);
      });

      expect(result.current.selectedData).toEqual([
        { id: 1, name: 'Item 1', status: 'active' },
      ]);

      // Update data
      const newData = [
        { id: 1, name: 'Updated Item 1', status: 'inactive' },
        { id: 5, name: 'New Item', status: 'active' },
      ];

      rerender({ data: newData });

      expect(result.current.selectedData).toEqual([
        { id: 1, name: 'Updated Item 1', status: 'inactive' },
      ]);
    });
  });

  describe('Bulk Actions', () => {
    test('executeBulkAction executes action with selected data', async () => {
      const mockAction = jest.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
      });

      let actionResult;
      await act(async () => {
        actionResult = await result.current.executeBulkAction(mockAction, {
          test: 'data',
        });
      });

      expect(mockAction).toHaveBeenCalledWith(
        [
          { id: 1, name: 'Item 1', status: 'active' },
          { id: 2, name: 'Item 2', status: 'inactive' },
        ],
        { test: 'data' }
      );
      expect(actionResult.success).toBe(true);
      expect(actionResult.result).toBe('success');
    });

    test('executeBulkAction handles errors', async () => {
      const mockAction = jest
        .fn()
        .mockRejectedValue(new Error('Action failed'));
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      let actionResult;
      await act(async () => {
        actionResult = await result.current.executeBulkAction(mockAction);
      });

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('Action failed');
      expect(result.current.error).toBe('Action failed');
    });

    test('executeBulkAction returns error when no items selected', async () => {
      const mockAction = jest.fn();
      const { result } = renderHook(() => useBulkActions(mockData));

      let actionResult;
      await act(async () => {
        actionResult = await result.current.executeBulkAction(mockAction);
      });

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('No items selected');
      expect(mockAction).not.toHaveBeenCalled();
    });

    test('deleteSelected executes delete action', async () => {
      const mockDeleteAction = jest.fn().mockResolvedValue('deleted');
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteSelected(mockDeleteAction);
      });

      expect(mockDeleteAction).toHaveBeenCalledWith(
        [{ id: 1, name: 'Item 1', status: 'active' }],
        {}
      );
      expect(deleteResult.success).toBe(true);
    });

    test('updateSelected executes update action', async () => {
      const mockUpdateAction = jest.fn().mockResolvedValue('updated');
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateSelected(mockUpdateAction, {
          status: 'inactive',
        });
      });

      expect(mockUpdateAction).toHaveBeenCalledWith(
        [{ id: 1, name: 'Item 1', status: 'active' }],
        { status: 'inactive' }
      );
      expect(updateResult.success).toBe(true);
    });

    test('exportSelected executes export action', async () => {
      const mockExportAction = jest.fn().mockResolvedValue('exported');
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportSelected(mockExportAction, {
          format: 'csv',
        });
      });

      expect(mockExportAction).toHaveBeenCalledWith(
        [{ id: 1, name: 'Item 1', status: 'active' }],
        { format: 'csv' }
      );
      expect(exportResult.success).toBe(true);
    });
  });

  describe('Utilities', () => {
    test('getSelectionSummary returns correct summary', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
      });

      const summary = result.current.getSelectionSummary();

      expect(summary).toEqual({
        total: 4,
        selected: 2,
        unselected: 2,
        percentage: 50,
      });
    });

    test('getSelectedIds returns array of selected IDs', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(3);
      });

      expect(result.current.getSelectedIds()).toEqual([1, 3]);
    });

    test('setSelectedByIds sets selection by IDs', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.setSelectedByIds([1, 3, 4]);
      });

      expect(result.current.selectedItems).toEqual([1, 3, 4]);
      expect(result.current.selectedCount).toBe(3);
    });

    test('clearSelection clears all selections', () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
        result.current.clearSelection();
      });

      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
    });

    test('clearError clears error state', async () => {
      const { result } = renderHook(() => useBulkActions(mockData));

      // First select an item
      act(() => {
        result.current.selectItem(1);
      });

      await act(async () => {
        try {
          await result.current.executeBulkAction(
            jest.fn().mockRejectedValue(new Error('Test error'))
          );
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Processing State', () => {
    test('isProcessing is true during bulk action', async () => {
      const mockAction = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      const { result } = renderHook(() => useBulkActions(mockData));

      act(() => {
        result.current.selectItem(1);
      });

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        result.current.executeBulkAction(mockAction);
      });

      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });
});
