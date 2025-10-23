import { useState } from 'react';
import { Button, Dropdown, Space, Typography, message } from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  DownOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ExportButton = ({
  data = [],
  selectedData = [],
  hasSelection = false,
  filename = 'export',
  formats = ['csv', 'excel', 'json'],
  onExport,
  disabled = false,
  loading = false,
  type = 'default',
  size = 'default',
}) => {
  const [exportLoading, setExportLoading] = useState({});

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        })
        .join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  // Convert data to Excel format (basic CSV with .xlsx extension)
  const convertToExcel = (data) => {
    // For a more advanced Excel export, you would use a library like xlsx
    return convertToCSV(data);
  };

  // Convert data to JSON format
  const convertToJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  // Download file
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle export action
  const handleExport = async (format, dataToExport) => {
    if (!dataToExport || dataToExport.length === 0) {
      message.warning('No data to export');
      return;
    }

    setExportLoading((prev) => ({ ...prev, [format]: true }));

    try {
      let content, mimeType, extension;
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:.]/g, '-');
      const selectionSuffix =
        hasSelection && dataToExport === selectedData ? '_selected' : '';
      const finalFilename = `${filename}${selectionSuffix}_${timestamp}`;

      switch (format) {
        case 'csv':
          content = convertToCSV(dataToExport);
          mimeType = 'text/csv;charset=utf-8;';
          extension = 'csv';
          break;
        case 'excel':
          content = convertToExcel(dataToExport);
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case 'json':
          content = convertToJSON(dataToExport);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'txt':
          content = convertToCSV(dataToExport);
          mimeType = 'text/plain;charset=utf-8;';
          extension = 'txt';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Custom export handler
      if (onExport) {
        await onExport(format, dataToExport, content);
      } else {
        downloadFile(content, `${finalFilename}.${extension}`, mimeType);
      }

      message.success(
        `Exported ${dataToExport.length} items as ${format.toUpperCase()}`
      );
    } catch (error) {
      message.error(`Export failed: ${error.message}`);
      console.error('Export error:', error);
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  // Get format icon
  const getFormatIcon = (format) => {
    const icons = {
      csv: <FileTextOutlined />,
      excel: <FileExcelOutlined />,
      json: <FileTextOutlined />,
      pdf: <FilePdfOutlined />,
      txt: <FileTextOutlined />,
    };
    return icons[format] || <FileTextOutlined />;
  };

  // Single format export (simple button)
  if (formats.length === 1) {
    const format = formats[0];
    return (
      <Button
        icon={<DownloadOutlined />}
        onClick={() => handleExport(format, hasSelection ? selectedData : data)}
        disabled={disabled || data.length === 0}
        loading={loading || exportLoading[format]}
        type={type}
        size={size}
      >
        Export {format.toUpperCase()}
      </Button>
    );
  }

  // Multiple formats (dropdown)
  const menuItems = [
    // Export all data
    ...formats.map((format) => ({
      key: `all_${format}`,
      label: (
        <Space>
          {getFormatIcon(format)}
          <span>Export All as {format.toUpperCase()}</span>
          <Text type="secondary">({data.length} items)</Text>
        </Space>
      ),
      disabled: data.length === 0,
    })),

    // Separator if selection exists
    ...(hasSelection && selectedData.length > 0 ? [{ type: 'divider' }] : []),

    // Export selected data
    ...(hasSelection && selectedData.length > 0
      ? formats.map((format) => ({
          key: `selected_${format}`,
          label: (
            <Space>
              {getFormatIcon(format)}
              <span>Export Selected as {format.toUpperCase()}</span>
              <Text type="secondary">({selectedData.length} items)</Text>
            </Space>
          ),
        }))
      : []),
  ];

  const handleMenuClick = ({ key }) => {
    const [scope, format] = key.split('_');
    const dataToExport = scope === 'selected' ? selectedData : data;
    handleExport(format, dataToExport);
  };

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
      }}
      disabled={disabled || (data.length === 0 && selectedData.length === 0)}
      trigger={['click']}
    >
      <Button
        icon={<DownloadOutlined />}
        loading={loading}
        type={type}
        size={size}
      >
        Export <DownOutlined />
      </Button>
    </Dropdown>
  );
};

// Hook for managing export state
export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async (exportFunction) => {
    setExporting(true);
    setExportProgress(0);

    try {
      await exportFunction((progress) => setExportProgress(progress));
      message.success('Export completed successfully');
    } catch (error) {
      message.error('Export failed');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return {
    exporting,
    exportProgress,
    handleExport,
  };
};

// Preset export configurations
export const exportPresets = {
  basic: {
    formats: ['csv'],
    filename: 'data',
  },

  standard: {
    formats: ['csv', 'excel', 'json'],
    filename: 'export',
  },

  comprehensive: {
    formats: ['csv', 'excel', 'json', 'txt'],
    filename: 'comprehensive_export',
  },

  reports: {
    formats: ['excel', 'pdf'],
    filename: 'report',
  },
};

export default ExportButton;
