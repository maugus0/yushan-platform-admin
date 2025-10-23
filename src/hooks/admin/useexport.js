import { useState, useCallback } from 'react';

/**
 * Custom hook for handling data export functionality
 * Supports multiple formats and export options
 */
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState(null);

  // Convert data to CSV format
  const convertToCSV = useCallback((data, options = {}) => {
    if (!data || data.length === 0) return '';

    const {
      headers = null,
      delimiter = ',',
      includeHeaders = true,
      customFields = null,
    } = options;

    let csvData = data;
    let csvHeaders = headers;

    // Use custom fields if provided
    if (customFields) {
      csvData = data.map((item) => {
        const customItem = {};
        customFields.forEach((field) => {
          if (typeof field === 'string') {
            customItem[field] = item[field];
          } else if (typeof field === 'object' && field.key) {
            customItem[field.label || field.key] = field.transform
              ? field.transform(item[field.key], item)
              : item[field.key];
          }
        });
        return customItem;
      });
    }

    // Get headers from first item if not provided
    if (!csvHeaders) {
      csvHeaders = Object.keys(csvData[0]);
    }

    // Build CSV content
    const csvContent = [];

    if (includeHeaders) {
      csvContent.push(csvHeaders.join(delimiter));
    }

    csvData.forEach((row) => {
      const csvRow = csvHeaders.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';

        // Escape quotes and wrap in quotes if contains delimiter or quotes
        const stringValue = String(value);
        if (
          stringValue.includes(delimiter) ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent.push(csvRow.join(delimiter));
    });

    return csvContent.join('\n');
  }, []);

  // Convert data to JSON format
  const convertToJSON = useCallback((data, options = {}) => {
    const { pretty = true, customFields = null } = options;

    let jsonData = data;

    // Use custom fields if provided
    if (customFields) {
      jsonData = data.map((item) => {
        const customItem = {};
        customFields.forEach((field) => {
          if (typeof field === 'string') {
            customItem[field] = item[field];
          } else if (typeof field === 'object' && field.key) {
            customItem[field.label || field.key] = field.transform
              ? field.transform(item[field.key], item)
              : item[field.key];
          }
        });
        return customItem;
      });
    }

    return pretty
      ? JSON.stringify(jsonData, null, 2)
      : JSON.stringify(jsonData);
  }, []);

  // Convert data to Excel format (simplified)
  const convertToExcel = useCallback(
    (data, options = {}) => {
      const {
        sheetName = 'Sheet1',
        headers = null,
        customFields = null,
      } = options;

      // This is a simplified implementation
      // In a real app, you'd use a library like xlsx
      const csvData = convertToCSV(data, { headers, customFields });

      return {
        sheetName,
        data: csvData,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    },
    [convertToCSV]
  );

  // Download file
  const downloadFile = useCallback(
    (content, filename, mimeType = 'text/plain') => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    },
    []
  );

  // Export data with progress tracking
  const exportData = useCallback(
    async (data, format, options = {}) => {
      setIsExporting(true);
      setExportProgress(0);
      setError(null);

      try {
        const {
          filename = `export_${new Date().toISOString().split('T')[0]}`,
          onProgress = null,
          customFields = null,
          ...formatOptions
        } = options;

        let content;
        let mimeType;
        let fileExtension;

        // Simulate progress for large datasets
        const totalSteps = 3;
        let currentStep = 0;

        const updateProgress = (step) => {
          currentStep = step;
          const progress = Math.round((currentStep / totalSteps) * 100);
          setExportProgress(progress);
          if (onProgress) onProgress(progress);
        };

        updateProgress(1);

        switch (format.toLowerCase()) {
          case 'csv':
            content = convertToCSV(data, { customFields, ...formatOptions });
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
          case 'json':
            content = convertToJSON(data, { customFields, ...formatOptions });
            mimeType = 'application/json';
            fileExtension = 'json';
            break;
          case 'excel':
          case 'xlsx': {
            const excelData = convertToExcel(data, {
              customFields,
              ...formatOptions,
            });
            content = excelData.data;
            mimeType = excelData.mimeType;
            fileExtension = 'xlsx';
            break;
          }
          default:
            throw new Error(`Unsupported export format: ${format}`);
        }

        updateProgress(2);

        const fullFilename = `${filename}.${fileExtension}`;
        downloadFile(content, fullFilename, mimeType);

        updateProgress(3);

        return {
          success: true,
          filename: fullFilename,
          format,
          recordCount: data.length,
        };
      } catch (err) {
        const errorMessage = err.message || 'Export failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    [convertToCSV, convertToJSON, convertToExcel, downloadFile]
  );

  // Export selected data
  const exportSelected = useCallback(
    async (selectedData, format, options = {}) => {
      if (!selectedData || selectedData.length === 0) {
        setError('No data selected for export');
        return {
          success: false,
          error: 'No data selected for export',
        };
      }

      return exportData(selectedData, format, options);
    },
    [exportData]
  );

  // Export filtered data
  const exportFiltered = useCallback(
    async (allData, filters, format, options = {}) => {
      // Apply filters to data
      let filteredData = allData;

      if (filters && Object.keys(filters).length > 0) {
        filteredData = allData.filter((item) => {
          return Object.entries(filters).every(([key, value]) => {
            if (value === null || value === undefined || value === '')
              return true;
            const itemValue = item[key];
            if (typeof itemValue === 'string') {
              return itemValue
                .toLowerCase()
                .includes(String(value).toLowerCase());
            }
            return itemValue === value;
          });
        });
      }

      return exportData(filteredData, format, options);
    },
    [exportData]
  );

  // Get supported formats
  const getSupportedFormats = useCallback(() => {
    return [
      { value: 'csv', label: 'CSV', mimeType: 'text/csv' },
      { value: 'json', label: 'JSON', mimeType: 'application/json' },
      {
        value: 'excel',
        label: 'Excel',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ];
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset export state
  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
    setError(null);
  }, []);

  return {
    // State
    isExporting,
    exportProgress,
    error,

    // Actions
    exportData,
    exportSelected,
    exportFiltered,
    downloadFile,

    // Utilities
    convertToCSV,
    convertToJSON,
    convertToExcel,
    getSupportedFormats,
    clearError,
    resetExport,
  };
};

export default useExport;
