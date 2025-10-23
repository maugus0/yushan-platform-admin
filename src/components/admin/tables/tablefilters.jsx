import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Collapse,
  Tag,
  Divider,
  InputNumber,
  Switch,
  Checkbox,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Option } = Select;

const TableFilters = ({
  filters = [],
  onFiltersChange,
  onReset,
  initialValues = {},
  showAdvanced = true,
  showQuickFilters = true,
  showActiveFilters = true,
  loading = false,
  style = {},
  className = '',
}) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      // Use setTimeout to avoid direct setState in effect
      setTimeout(() => setActiveFilters(initialValues), 0);
    }
  }, [initialValues, form]);

  // Handle form changes
  const handleValuesChange = (changedValues, allValues) => {
    setActiveFilters(allValues);
    if (onFiltersChange) {
      onFiltersChange(allValues);
    }
  };

  // Reset filters
  const handleReset = () => {
    form.resetFields();
    setActiveFilters({});
    if (onReset) {
      onReset();
    }
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value === null || value === undefined || value === '') return false;
      return true;
    }).length;
  };

  // Render filter component based on type
  const renderFilter = (filter) => {
    const {
      // eslint-disable-next-line no-unused-vars
      key,
      label,
      type,
      options = [],
      placeholder,
      width,
      // eslint-disable-next-line no-unused-vars
      rules = [],
      ...props
    } = filter;

    const commonProps = {
      placeholder: placeholder || `Select ${label}`,
      style: { width: width || '100%' },
      allowClear: true,
      ...props,
    };

    switch (type) {
      case 'text':
      case 'search':
        return (
          <Input
            {...commonProps}
            prefix={type === 'search' ? <SearchOutlined /> : null}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            mode={props.multiple ? 'multiple' : undefined}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Select {...commonProps} mode="multiple">
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'date':
        return <DatePicker {...commonProps} />;

      case 'daterange':
        return <RangePicker {...commonProps} />;

      case 'number':
        return <InputNumber {...commonProps} />;

      case 'numberrange':
        return (
          <Input.Group compact>
            <InputNumber
              placeholder="Min"
              style={{ width: '50%' }}
              {...props.minProps}
            />
            <InputNumber
              placeholder="Max"
              style={{ width: '50%' }}
              {...props.maxProps}
            />
          </Input.Group>
        );

      case 'switch':
        return <Switch {...props} />;

      case 'checkbox':
        return <Checkbox.Group options={options} {...props} />;

      default:
        return <Input {...commonProps} />;
    }
  };

  // Separate filters into quick and advanced
  const quickFilters = filters.filter((f) => f.quickFilter);
  const advancedFilters = filters.filter((f) => !f.quickFilter);

  // Render active filter tags
  const renderActiveFilters = () => {
    if (!showActiveFilters || getActiveFilterCount() === 0) return null;

    const tags = [];

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const filter = filters.find((f) => f.key === key);
      if (!filter) return;

      let displayValue = value;

      // Format display value based on type
      if (filter.type === 'daterange' && Array.isArray(value)) {
        displayValue = `${dayjs(value[0]).format('MMM DD')} - ${dayjs(value[1]).format('MMM DD')}`;
      } else if (filter.type === 'date') {
        displayValue = dayjs(value).format('MMM DD, YYYY');
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (filter.options) {
        const option = filter.options.find((opt) => opt.value === value);
        displayValue = option ? option.label : value;
      }

      tags.push(
        <Tag
          key={key}
          closable
          onClose={() => {
            const newValues = { ...activeFilters };
            delete newValues[key];
            form.setFieldsValue({ [key]: undefined });
            handleValuesChange({}, newValues);
          }}
        >
          {filter.label}: {displayValue}
        </Tag>
      );
    });

    return (
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {tags}
          {tags.length > 0 && (
            <Button
              type="link"
              size="small"
              onClick={handleReset}
              icon={<ClearOutlined />}
            >
              Clear All
            </Button>
          )}
        </Space>
      </div>
    );
  };

  return (
    <Card
      className={className}
      style={{ marginBottom: 16, ...style }}
      bodyStyle={{ padding: '16px' }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
      >
        {/* Active Filters */}
        {renderActiveFilters()}

        {/* Quick Filters */}
        {showQuickFilters && quickFilters.length > 0 && (
          <>
            <Row gutter={[16, 16]}>
              {quickFilters.map((filter) => {
                // Support both number and object (responsive) span
                const colProps =
                  typeof filter.span === 'object'
                    ? filter.span
                    : { span: filter.span || 6 };

                return (
                  <Col key={filter.key} {...colProps}>
                    <Form.Item
                      name={filter.key}
                      label={filter.label}
                      rules={filter.rules}
                    >
                      {renderFilter(filter)}
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>

            {showAdvanced && advancedFilters.length > 0 && <Divider />}
          </>
        )}

        {/* Advanced Filters */}
        {showAdvanced && advancedFilters.length > 0 && (
          <Collapse
            ghost
            activeKey={collapsed ? [] : ['advanced']}
            onChange={(keys) => setCollapsed(keys.length === 0)}
          >
            <Panel
              header={
                <Space>
                  <FilterOutlined />
                  Advanced Filters
                  {getActiveFilterCount() > 0 && (
                    <Tag color="blue">{getActiveFilterCount()} active</Tag>
                  )}
                </Space>
              }
              key="advanced"
              extra={collapsed ? <DownOutlined /> : <UpOutlined />}
            >
              <Row gutter={[16, 16]}>
                {advancedFilters.map((filter) => {
                  // Support both number and object (responsive) span
                  const colProps =
                    typeof filter.span === 'object'
                      ? filter.span
                      : { span: filter.span || 8 };

                  return (
                    <Col key={filter.key} {...colProps}>
                      <Form.Item
                        name={filter.key}
                        label={filter.label}
                        rules={filter.rules}
                      >
                        {renderFilter(filter)}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
            </Panel>
          </Collapse>
        )}

        {/* Action Buttons */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button
              onClick={handleReset}
              disabled={getActiveFilterCount() === 0}
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              disabled={getActiveFilterCount() === 0}
            >
              Apply Filters
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
};

// Hook for managing filter state
export const useTableFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);

  const updateFilters = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const applyFilters = async (applyFunction) => {
    setLoading(true);
    try {
      await applyFunction(filters);
    } catch (error) {
      console.error('Filter application error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    loading,
    applyFilters,
  };
};

// Common filter configurations
export const commonFilters = {
  search: {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search...',
    quickFilter: true,
    span: 8,
  },

  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    quickFilter: true,
    span: 4,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ],
  },

  dateRange: {
    key: 'dateRange',
    label: 'Date Range',
    type: 'daterange',
    quickFilter: true,
    span: 6,
  },

  category: {
    key: 'category',
    label: 'Category',
    type: 'select',
    span: 6,
  },

  tags: {
    key: 'tags',
    label: 'Tags',
    type: 'multiselect',
    span: 8,
  },

  verified: {
    key: 'verified',
    label: 'Verified Only',
    type: 'switch',
    span: 4,
  },
};

export default TableFilters;
