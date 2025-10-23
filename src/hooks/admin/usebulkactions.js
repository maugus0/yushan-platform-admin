import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing bulk actions on data tables
 * Handles selection, bulk operations, and state management
 */
export const useBulkActions = (initialData = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Get selected items data
  const selectedData = useMemo(() => {
    return initialData.filter((item) => selectedItems.has(item.id));
  }, [initialData, selectedItems]);

  // Get selection count
  const selectedCount = selectedItems.size;

  // Check if all items are selected
  const isAllSelected = useMemo(() => {
    return initialData.length > 0 && selectedItems.size === initialData.length;
  }, [initialData.length, selectedItems.size]);

  // Check if some items are selected
  const isIndeterminate = useMemo(() => {
    return selectedItems.size > 0 && selectedItems.size < initialData.length;
  }, [selectedItems.size, initialData.length]);

  // Select a single item
  const selectItem = useCallback((itemId) => {
    setSelectedItems((prev) => new Set([...prev, itemId]));
    setError(null);
  }, []);

  // Deselect a single item
  const deselectItem = useCallback((itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    setError(null);
  }, []);

  // Toggle selection of a single item
  const toggleItem = useCallback(
    (itemId) => {
      if (selectedItems.has(itemId)) {
        deselectItem(itemId);
      } else {
        selectItem(itemId);
      }
    },
    [selectedItems, selectItem, deselectItem]
  );

  // Select all items
  const selectAll = useCallback(() => {
    const allIds = initialData.map((item) => item.id);
    setSelectedItems(new Set(allIds));
    setIsSelectAll(true);
    setError(null);
  }, [initialData]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectAll(false);
    setError(null);
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectAll(false);
    setError(null);
  }, []);

  // Execute bulk action
  const executeBulkAction = useCallback(
    async (action, actionData = {}) => {
      if (selectedItems.size === 0) {
        setError('No items selected');
        return { success: false, error: 'No items selected' };
      }

      setIsProcessing(true);
      setError(null);

      try {
        const result = await action(selectedData, actionData);
        return { success: true, result };
      } catch (err) {
        const errorMessage = err.message || 'Bulk action failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedItems.size, selectedData]
  );

  // Delete selected items
  const deleteSelected = useCallback(
    async (deleteAction) => {
      return executeBulkAction(deleteAction, {});
    },
    [executeBulkAction]
  );

  // Update selected items
  const updateSelected = useCallback(
    async (updateAction, updateData) => {
      return executeBulkAction(updateAction, updateData);
    },
    [executeBulkAction]
  );

  // Export selected items
  const exportSelected = useCallback(
    async (exportAction, exportOptions = {}) => {
      return executeBulkAction(exportAction, exportOptions);
    },
    [executeBulkAction]
  );

  // Get selection summary
  const getSelectionSummary = useCallback(() => {
    return {
      total: initialData.length,
      selected: selectedCount,
      unselected: initialData.length - selectedCount,
      percentage:
        initialData.length > 0
          ? Math.round((selectedCount / initialData.length) * 100)
          : 0,
    };
  }, [initialData.length, selectedCount]);

  // Check if item is selected
  const isItemSelected = useCallback(
    (itemId) => {
      return selectedItems.has(itemId);
    },
    [selectedItems]
  );

  // Get selected item IDs
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedItems);
  }, [selectedItems]);

  // Set selected items by IDs
  const setSelectedByIds = useCallback((ids) => {
    setSelectedItems(new Set(ids));
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    selectedItems: getSelectedIds(),
    selectedData,
    selectedCount,
    isSelectAll,
    isProcessing,
    error,

    // Selection state
    isAllSelected,
    isIndeterminate,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    clearSelection,

    // Bulk actions
    executeBulkAction,
    deleteSelected,
    updateSelected,
    exportSelected,

    // Utilities
    getSelectionSummary,
    isItemSelected,
    getSelectedIds,
    setSelectedByIds,
    clearError,
  };
};

export default useBulkActions;
