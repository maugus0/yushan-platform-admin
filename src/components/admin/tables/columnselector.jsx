import { useState, useEffect } from 'react';
import {
  Dropdown,
  Button,
  Checkbox,
  Space,
  Typography,
  Divider,
  Input,
  Tooltip,
} from 'antd';
import {
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ColumnSelector = ({
  columns = [],
  visibleColumns = [],
  onChange,
  storageKey = 'table-columns',
  showSearch = true,
  showSelectAll = true,
  showReset = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localVisibleColumns, setLocalVisibleColumns] =
    useState(visibleColumns);

  useEffect(() => {
    setLocalVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  // Load saved column preferences from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const savedColumns = JSON.parse(saved);
          setLocalVisibleColumns(savedColumns);
          onChange?.(savedColumns);
        } catch (error) {
          console.error('Failed to load column preferences:', error);
        }
      }
    }
  }, [storageKey, onChange]);

  // Save column preferences to localStorage
  const saveToStorage = (newVisibleColumns) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newVisibleColumns));
    }
  };

  const handleColumnToggle = (columnKey, checked) => {
    const newVisibleColumns = checked
      ? [...localVisibleColumns, columnKey]
      : localVisibleColumns.filter((key) => key !== columnKey);

    setLocalVisibleColumns(newVisibleColumns);
    saveToStorage(newVisibleColumns);
    onChange?.(newVisibleColumns);
  };

  const handleSelectAll = (checked) => {
    const newVisibleColumns = checked
      ? columns.map((col) => col.key || col.dataIndex)
      : [];

    setLocalVisibleColumns(newVisibleColumns);
    saveToStorage(newVisibleColumns);
    onChange?.(newVisibleColumns);
  };

  const handleReset = () => {
    const defaultColumns = columns
      .filter((col) => col.defaultVisible !== false)
      .map((col) => col.key || col.dataIndex);

    setLocalVisibleColumns(defaultColumns);
    saveToStorage(defaultColumns);
    onChange?.(defaultColumns);
    setSearchTerm('');
  };

  // Filter columns based on search term
  const filteredColumns = columns.filter((column) =>
    column.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allVisible = filteredColumns.every((column) =>
    localVisibleColumns.includes(column.key || column.dataIndex)
  );
  const someVisible = filteredColumns.some((column) =>
    localVisibleColumns.includes(column.key || column.dataIndex)
  );

  const dropdownContent = (
    <div style={{ padding: 8, minWidth: 250, maxWidth: 350 }}>
      {/* Header with stats */}
      <div style={{ marginBottom: 8 }}>
        <Space>
          <Text strong>
            {localVisibleColumns.length} / {columns.length} columns visible
          </Text>
        </Space>
      </div>

      {/* Search */}
      {showSearch && (
        <div style={{ marginBottom: 12 }}>
          <Input
            placeholder="Search columns..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            allowClear
          />
        </div>
      )}

      {/* Select All / None */}
      {showSelectAll && (
        <>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              indeterminate={someVisible && !allVisible}
              checked={allVisible}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              <Text strong>
                {allVisible
                  ? 'Hide All'
                  : someVisible
                    ? 'Show All'
                    : 'Show All'}
              </Text>
            </Checkbox>
          </div>
          <Divider style={{ margin: '8px 0' }} />
        </>
      )}

      {/* Column List */}
      <div style={{ maxHeight: 300, overflow: 'auto' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {filteredColumns.map((column) => {
            const columnKey = column.key || column.dataIndex;
            const isVisible = localVisibleColumns.includes(columnKey);

            return (
              <div
                key={columnKey}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <Checkbox
                  checked={isVisible}
                  onChange={(e) =>
                    handleColumnToggle(columnKey, e.target.checked)
                  }
                  style={{ marginRight: 8 }}
                />
                <span
                  style={{ color: isVisible ? undefined : '#999', flex: 1 }}
                >
                  {isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
                <Text
                  style={{
                    marginLeft: 8,
                    color: isVisible ? undefined : '#999',
                    flex: 1,
                  }}
                >
                  {column.title}
                </Text>
                {column.required && (
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', marginLeft: 8 }}
                  >
                    Required
                  </Text>
                )}
              </div>
            );
          })}
        </Space>
      </div>

      {/* Actions */}
      {showReset && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ textAlign: 'center' }}>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Reset to Default
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Tooltip title="Customize columns">
        <Button icon={<SettingOutlined />}>
          Columns ({localVisibleColumns.length})
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

// Hook for managing column visibility
export const useColumnSelector = (
  columns,
  defaultVisible = null,
  storageKey = null
) => {
  const getDefaultVisibleColumns = () => {
    if (defaultVisible) return defaultVisible;
    return columns
      .filter((col) => col.defaultVisible !== false)
      .map((col) => col.key || col.dataIndex);
  };

  const [visibleColumns, setVisibleColumns] = useState(
    getDefaultVisibleColumns()
  );

  // Filter columns based on visibility
  const getVisibleColumns = () => {
    return columns.filter((column) => {
      const columnKey = column.key || column.dataIndex;
      return visibleColumns.includes(columnKey) || column.required;
    });
  };

  const handleColumnChange = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
  };

  return {
    visibleColumns,
    setVisibleColumns,
    getVisibleColumns,
    handleColumnChange,
    ColumnSelector: (props) => (
      <ColumnSelector
        columns={columns}
        visibleColumns={visibleColumns}
        onChange={handleColumnChange}
        storageKey={storageKey}
        {...props}
      />
    ),
  };
};

export default ColumnSelector;
