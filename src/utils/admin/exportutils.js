// Yushan Admin Export Utilities

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration
 * @param {string} filename - Export filename
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create CSV headers
  const headers = columns.map((col) => col.title || col.label || col.key);

  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((row) => {
      return columns
        .map((col) => {
          const value = getNestedValue(row, col.dataIndex || col.key);
          const formattedValue = col.render ? col.render(value, row) : value;

          // Escape commas and quotes in CSV
          const cleanValue = String(formattedValue || '')
            .replace(/"/g, '""')
            .replace(/,/g, '，'); // Use Chinese comma

          return `"${cleanValue}"`;
        })
        .join(',');
    }),
  ];

  // Create and download file
  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadFile(blob, `${filename}.csv`);
};

/**
 * Export data to Excel format (requires xlsx library)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration
 * @param {string} filename - Export filename
 */
export const exportToExcel = (data, columns, filename = 'export') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // This would require the xlsx library to be installed
    // For now, we'll fall back to CSV
    console.warn('Excel export requires xlsx library. Falling back to CSV.');
    exportToCSV(data, columns, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    exportToCSV(data, columns, filename);
  }
};

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration (optional, for filtering fields)
 * @param {string} filename - Export filename
 */
export const exportToJSON = (data, columns = null, filename = 'export') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  let exportData = data;

  // Filter fields if columns are specified
  if (columns && Array.isArray(columns)) {
    exportData = data.map((row) => {
      const filteredRow = {};
      columns.forEach((col) => {
        const key = col.dataIndex || col.key;
        const value = getNestedValue(row, key);
        filteredRow[key] = col.render ? col.render(value, row) : value;
      });
      return filteredRow;
    });
  }

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], {
    type: 'application/json;charset=utf-8;',
  });
  downloadFile(blob, `${filename}.json`);
};

/**
 * Export data to PDF format (basic table format)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration
 * @param {string} filename - Export filename
 * @param {object} options - PDF options
 */
export const exportToPDF = (
  data,
  columns,
  _filename = 'export',
  options = {}
) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // This would require a PDF library like jsPDF
    // For now, we'll create a simple HTML table and use browser print
    const htmlContent = createTableHTML(data, columns, options);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};

/**
 * Create HTML table for printing/PDF
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column configuration
 * @param {object} options - Formatting options
 * @returns {string} - HTML content
 */
const createTableHTML = (data, columns, options = {}) => {
  const { title = 'Export Report', showDate = true } = options;
  const currentDate = new Date().toLocaleDateString('zh-CN');

  const headers = columns
    .map(
      (col) =>
        `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${col.title || col.label || col.key}</th>`
    )
    .join('');

  const rows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          const value = getNestedValue(row, col.dataIndex || col.key);
          const formattedValue = col.render ? col.render(value, row) : value;
          return `<td style="border: 1px solid #ddd; padding: 8px;">${formattedValue || ''}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { text-align: left; }
        .header { margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .date { color: #666; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${title}</div>
        ${showDate ? `<div class="date">导出日期: ${currentDate}</div>` : ''}
      </div>
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="no-print" style="margin-top: 20px;">
        <button onclick="window.print()">打印</button>
        <button onclick="window.close()">关闭</button>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get nested object value by path
 * @param {object} obj - Object to search
 * @param {string} path - Dot notation path
 * @returns {any} - Value at path
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';

  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
};

/**
 * Download file blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export table data with pagination
 * @param {Function} fetchData - Function to fetch data
 * @param {object} params - Export parameters
 * @param {Array} columns - Column configuration
 * @param {string} format - Export format
 * @param {string} filename - Export filename
 */
export const exportTableData = async (
  fetchData,
  params,
  columns,
  format = 'csv',
  filename = 'export'
) => {
  try {
    // Show loading state
    const loadingToast = showLoadingToast('正在导出数据...');

    // Fetch all data (remove pagination)
    const exportParams = {
      ...params,
      page: 1,
      pageSize: 10000, // Large number to get all data
    };

    const response = await fetchData(exportParams);
    const data = response.data || response.list || response;

    // Hide loading toast
    hideToast(loadingToast);

    if (!Array.isArray(data) || data.length === 0) {
      showErrorToast('没有数据可导出');
      return;
    }

    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        exportToCSV(data, columns, filename);
        break;
      case 'excel':
        exportToExcel(data, columns, filename);
        break;
      case 'json':
        exportToJSON(data, columns, filename);
        break;
      case 'pdf':
        exportToPDF(data, columns, filename);
        break;
      default:
        exportToCSV(data, columns, filename);
    }

    showSuccessToast(`成功导出 ${data.length} 条记录`);
  } catch (error) {
    console.error('Export error:', error);
    showErrorToast('导出失败，请重试');
  }
};

/**
 * Batch export multiple datasets
 * @param {Array} datasets - Array of dataset configurations
 * @param {string} format - Export format
 */
export const batchExport = async (datasets, format = 'csv') => {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    showErrorToast('没有数据可导出');
    return;
  }

  try {
    const loadingToast = showLoadingToast('正在批量导出...');

    for (const dataset of datasets) {
      const { data, columns, filename } = dataset;

      switch (format.toLowerCase()) {
        case 'csv':
          exportToCSV(data, columns, filename);
          break;
        case 'excel':
          exportToExcel(data, columns, filename);
          break;
        case 'json':
          exportToJSON(data, columns, filename);
          break;
        case 'pdf':
          exportToPDF(data, columns, filename);
          break;
        default:
          exportToCSV(data, columns, filename);
      }

      // Add delay between exports to avoid overwhelming the browser
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    hideToast(loadingToast);
    showSuccessToast(`成功批量导出 ${datasets.length} 个文件`);
  } catch (error) {
    console.error('Batch export error:', error);
    showErrorToast('批量导出失败，请重试');
  }
};

/**
 * Get export filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} format - File format
 * @returns {string} - Filename with timestamp
 */
export const getTimestampedFilename = (baseName, format = 'csv') => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${baseName}_${timestamp}.${format}`;
};

/**
 * Prepare data for export (format and filter)
 * @param {Array} data - Raw data
 * @param {Array} columns - Column configuration
 * @param {object} options - Preparation options
 * @returns {Array} - Prepared data
 */
export const prepareDataForExport = (data, columns, options = {}) => {
  if (!Array.isArray(data)) return [];

  const {
    includeHidden = false,
    formatDates = true,
    removeHtml = true,
    maxLength = 1000,
  } = options;

  // Filter columns
  const visibleColumns = includeHidden
    ? columns
    : columns.filter((col) => !col.hidden);

  return data.map((row) => {
    const exportRow = {};

    visibleColumns.forEach((col) => {
      const key = col.dataIndex || col.key;
      let value = getNestedValue(row, key);

      // Apply column renderer
      if (col.render && typeof col.render === 'function') {
        value = col.render(value, row);
      }

      // Format value
      value = formatValueForExport(value, {
        formatDates,
        removeHtml,
        maxLength,
      });

      exportRow[col.title || col.label || key] = value;
    });

    return exportRow;
  });
};

/**
 * Format value for export
 * @param {any} value - Value to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted value
 */
const formatValueForExport = (value, options = {}) => {
  const { formatDates = true, removeHtml = true, maxLength = 1000 } = options;

  if (value === null || value === undefined) {
    return '';
  }

  let formattedValue = String(value);

  // Remove HTML tags
  if (removeHtml) {
    formattedValue = formattedValue.replace(/<[^>]*>/g, '');
  }

  // Format dates
  if (formatDates && isDateString(formattedValue)) {
    const date = new Date(formattedValue);
    if (!isNaN(date.getTime())) {
      formattedValue = date.toLocaleDateString('zh-CN');
    }
  }

  // Truncate long values
  if (formattedValue.length > maxLength) {
    formattedValue = formattedValue.substring(0, maxLength) + '...';
  }

  return formattedValue;
};

/**
 * Check if string is a date
 * @param {string} str - String to check
 * @returns {boolean} - True if string looks like a date
 */
const isDateString = (str) => {
  const dateRegex =
    /^\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4}/;
  return dateRegex.test(str);
};

/**
 * Simple toast notifications (you would replace with your actual toast system)
 */
const showLoadingToast = (message) => {
  console.log('Loading:', message);
  return Date.now(); // Return ID for hiding
};

const hideToast = (id) => {
  console.log('Hide toast:', id);
};

const showSuccessToast = (message) => {
  console.log('Success:', message);
};

const showErrorToast = (message) => {
  console.error('Error:', message);
};

/**
 * Get supported export formats
 * @returns {Array} - Array of supported formats
 */
export const getSupportedFormats = () => {
  return [
    { value: 'csv', label: 'CSV 文件', icon: '📄' },
    { value: 'excel', label: 'Excel 文件', icon: '📊' },
    { value: 'json', label: 'JSON 文件', icon: '💾' },
    { value: 'pdf', label: 'PDF 文件', icon: '📋' },
  ];
};

/**
 * Validate export parameters
 * @param {Array} data - Data to export
 * @param {Array} columns - Column configuration
 * @param {string} format - Export format
 * @returns {object} - Validation result
 */
export const validateExportParams = (data, columns, format) => {
  const errors = [];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('没有数据可导出');
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    errors.push('没有列配置');
  }

  const supportedFormats = ['csv', 'excel', 'json', 'pdf'];
  if (!supportedFormats.includes(format?.toLowerCase())) {
    errors.push('不支持的导出格式');
  }

  if (data && data.length > 50000) {
    errors.push('数据量过大，建议分批导出');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  exportTableData,
  batchExport,
  getTimestampedFilename,
  prepareDataForExport,
  getSupportedFormats,
  validateExportParams,
};
