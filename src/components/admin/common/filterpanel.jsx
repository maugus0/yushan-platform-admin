import { useState } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  Slider,
  Typography,
  Divider,
} from 'antd';
import {
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const FilterPanel = ({
  filters = [],
  onFilter,
  onClear,
  initialValues = {},
  collapsed = false,
  showToggle = true,
  showClearButton = true,
  showApplyButton = true,
  title = 'Filters',
  style = {},
  className = '',
  layout = 'vertical',
  ...props
}) => {
  const [form] = Form.useForm();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [activeFilters, setActiveFilters] = useState(0);

  const handleFilter = (values) => {
    // Count active filters
    const activeCount = Object.values(values).filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value === null || value === undefined || value === '') return false;
      return true;
    }).length;

    setActiveFilters(activeCount);
    onFilter && onFilter(values);
  };

  const handleClear = () => {
    form.resetFields();
    setActiveFilters(0);
    onClear && onClear();
  };

  const renderFilterField = (filter) => {
    // eslint-disable-next-line no-unused-vars
    const { type, name, label, options, placeholder, ...fieldProps } = filter;

    switch (type) {
      case 'select':
        return (
          <Select
            placeholder={placeholder || `Select ${label}`}
            allowClear
            {...fieldProps}
          >
            {options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Select
            mode="multiple"
            placeholder={placeholder || `Select ${label}`}
            allowClear
            {...fieldProps}
          >
            {options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'date':
        return (
          <DatePicker
            placeholder={placeholder || `Select ${label}`}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'daterange':
        return (
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'number':
        return (
          <InputNumber
            placeholder={placeholder || `Enter ${label}`}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'numberrange':
        return (
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              placeholder="Min"
              style={{ width: '50%' }}
              {...fieldProps.min}
            />
            <InputNumber
              placeholder="Max"
              style={{ width: '50%' }}
              {...fieldProps.max}
            />
          </Space.Compact>
        );

      case 'slider':
        return <Slider {...fieldProps} />;

      case 'checkbox':
        return <Checkbox.Group options={options} {...fieldProps} />;

      case 'radio':
        return (
          <Radio.Group {...fieldProps}>
            {options?.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'search':
        return (
          <Input
            placeholder={placeholder || `Search ${label}`}
            suffix={<SearchOutlined />}
            {...fieldProps}
          />
        );

      default:
        return (
          <Input
            placeholder={placeholder || `Enter ${label}`}
            {...fieldProps}
          />
        );
    }
  };

  const filterContent = (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onValuesChange={(_, allValues) => handleFilter(allValues)}
      {...props}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {filters.map((filter, index) => (
          <Form.Item
            key={filter.name || index}
            name={filter.name}
            label={filter.label}
            style={{ margin: 0 }}
          >
            {renderFilterField(filter)}
          </Form.Item>
        ))}

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {showClearButton && (
            <Button icon={<ClearOutlined />} onClick={handleClear}>
              Clear
            </Button>
          )}
          {showApplyButton && (
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => form.submit()}
            >
              Apply Filters
            </Button>
          )}
        </Space>
      </Space>
    </Form>
  );

  if (showToggle) {
    return (
      <Card
        style={{ marginBottom: '16px', ...style }}
        className={className}
        bodyStyle={{ padding: isCollapsed ? '12px 16px' : '16px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Space>
            <FilterOutlined />
            <Text strong>{title}</Text>
            {activeFilters > 0 && (
              <span
                style={{
                  background: '#1890ff',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}
              >
                {activeFilters}
              </span>
            )}
          </Space>
          {isCollapsed ? <DownOutlined /> : <UpOutlined />}
        </div>

        {!isCollapsed && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            {filterContent}
          </>
        )}
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          {title}
          {activeFilters > 0 && (
            <span
              style={{
                background: '#1890ff',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
              }}
            >
              {activeFilters}
            </span>
          )}
        </Space>
      }
      style={{ marginBottom: '16px', ...style }}
      className={className}
    >
      {filterContent}
    </Card>
  );
};

export default FilterPanel;
