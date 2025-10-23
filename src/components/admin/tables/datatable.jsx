import { useMemo } from 'react';
import { Table, Space, Card, Typography, Divider } from 'antd';
import BulkActions, { useBulkActions } from './bulkactions';
import { useColumnSelector } from './columnselector';
import ExportButton from './exportbutton';
import TableFilters from './tablefilters';

const { Text } = Typography;

const DataTable = ({
  // Data props
  dataSource = [],
  columns = [],
  loading = false,

  // Pagination props
  pagination = {},

  // Selection props
  enableSelection = true,
  bulkActions = [],
  onBulkAction,
  showBulkActionsDropdown = true,

  // Column management
  enableColumnSelector = true,
  columnStorageKey,

  // Export functionality
  enableExport = true,
  exportFilename,
  exportData,

  // Filtering
  enableFilters = false,
  filters = [],
  onFilterChange,

  // Table props
  size = 'middle',
  bordered = false,
  showHeader = true,
  scroll,
  rowKey = 'id',

  // Event handlers
  onChange,
  onRow,

  // Layout
  title,
  extra,

  // Custom styling
  className,
  style,

  // Advanced features
  expandable,
  summary,

  ...restProps
}) => {
  // Bulk actions management
  const { selectedRowKeys, selectedRows, rowSelection, clearSelection } =
    useBulkActions();

  // Column visibility management - removed unused visibleColumns
  const { getVisibleColumns, ColumnSelector: ColumnSelectorComponent } =
    useColumnSelector(columns, null, columnStorageKey);

  // Handle table changes (pagination, sorting, filtering)
  const handleTableChange = (paginationInfo, filters, sorterInfo) => {
    onChange?.(paginationInfo, filters, sorterInfo);
  };

  // Handle bulk actions
  const handleBulkAction = async (actionKey, selectedKeys, selectedItems) => {
    try {
      await onBulkAction?.(actionKey, selectedKeys, selectedItems);
      clearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Enhanced pagination with total info
  const enhancedPagination = useMemo(() => {
    if (pagination === false) return false;

    return {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      ...pagination,
    };
  }, [pagination]);

  // Get final columns (filtered by visibility)
  const finalColumns = useMemo(() => {
    return enableColumnSelector ? getVisibleColumns() : columns;
  }, [enableColumnSelector, getVisibleColumns, columns]);

  // Table configuration
  const tableConfig = {
    dataSource,
    columns: finalColumns,
    loading,
    pagination: enhancedPagination,
    onChange: handleTableChange,
    rowKey,
    size,
    bordered,
    showHeader,
    scroll,
    onRow,
    expandable,
    summary,
    ...restProps,
  };

  // Add row selection if enabled
  if (enableSelection) {
    tableConfig.rowSelection = {
      ...rowSelection,
      getCheckboxProps: (record) => ({
        disabled: record.disabled,
        name: record.name,
      }),
    };
  }

  // Render table header with actions
  const renderTableHeader = () => {
    if (
      !title &&
      !extra &&
      selectedRowKeys.length === 0 &&
      !enableColumnSelector &&
      !enableExport
    ) {
      return null;
    }

    return (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Left side - Title and bulk actions */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}
          >
            {title && (
              <div>
                <Text strong style={{ fontSize: '16px' }}>
                  {title}
                </Text>
              </div>
            )}

            {enableSelection && selectedRowKeys.length > 0 && (
              <BulkActions
                selectedRowKeys={selectedRowKeys}
                selectedRows={selectedRows}
                onAction={handleBulkAction}
                actions={bulkActions}
                loading={loading}
                showActionsDropdown={showBulkActionsDropdown}
              />
            )}
          </div>

          {/* Right side - Controls and actions */}
          <Space>
            {extra}

            {enableExport && (
              <ExportButton
                data={exportData || dataSource}
                filename={exportFilename}
                selectedData={selectedRows}
                hasSelection={selectedRowKeys.length > 0}
              />
            )}

            {enableColumnSelector && <ColumnSelectorComponent />}
          </Space>
        </div>

        {/* Filters */}
        {enableFilters && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <TableFilters filters={filters} onChange={onFilterChange} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className={className} style={style}>
      {renderTableHeader()}

      <Table {...tableConfig} />

      {/* Footer info */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f6f8fa',
            borderRadius: 6,
            border: '1px solid #e1e4e8',
          }}
        >
          <Space>
            <Text type="secondary">
              {selectedRowKeys.length} of {dataSource.length} items selected
            </Text>
          </Space>
        </div>
      )}
    </div>
  );
};

// Enhanced DataTable with Card wrapper
export const CardDataTable = (props) => {
  const { cardProps = {}, ...tableProps } = props;

  return (
    <Card {...cardProps}>
      <DataTable {...tableProps} />
    </Card>
  );
};

// Preset configurations for common table types
export const tablePresets = {
  default: {
    size: 'middle',
    bordered: false,
    enableSelection: true,
    enableColumnSelector: true,
    enableExport: true,
  },

  compact: {
    size: 'small',
    bordered: true,
    enableSelection: false,
    enableColumnSelector: false,
    enableExport: false,
  },

  dashboard: {
    size: 'small',
    bordered: false,
    enableSelection: false,
    enableColumnSelector: false,
    enableExport: true,
    pagination: { pageSize: 5, simple: true },
  },

  admin: {
    size: 'middle',
    bordered: true,
    enableSelection: true,
    enableColumnSelector: true,
    enableExport: true,
    enableFilters: true,
  },
};

export default DataTable;
