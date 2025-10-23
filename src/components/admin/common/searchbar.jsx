import { useState, useMemo } from 'react';
import { Input, Select, Space, Button, AutoComplete } from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { debounce } from 'lodash';

const { Option } = Select;

const SearchBar = ({
  onSearch,
  onClear,
  onFilterToggle,
  placeholder = 'Search...',
  searchValue = '',
  showClear = true,
  showFilter = false,
  showCategoryFilter = false,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  suggestions = [],
  loading = false,
  debounceMs = 300,
  size = 'middle',
  style = {},
  ...props
}) => {
  const [inputValue, setInputValue] = useState(searchValue);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onSearch && onSearch(value);
      }, debounceMs),
    [onSearch, debounceMs]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSearch(value);

    // Update autocomplete options
    if (suggestions.length > 0) {
      const filteredSuggestions = suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10)
        .map((suggestion) => ({ value: suggestion }));
      setAutoCompleteOptions(filteredSuggestions);
    }
  };

  const handleSearch = (value) => {
    onSearch && onSearch(value || inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    setAutoCompleteOptions([]);
    onClear && onClear();
    onSearch && onSearch('');
  };

  const handleCategoryChange = (value) => {
    onCategoryChange && onCategoryChange(value);
  };

  const searchInput =
    suggestions.length > 0 ? (
      <AutoComplete
        options={autoCompleteOptions}
        value={inputValue}
        onChange={handleInputChange}
        onSelect={handleSearch}
        style={{ flex: 1 }}
      >
        <Input
          placeholder={placeholder}
          suffix={
            <Space>
              {showClear && inputValue && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                />
              )}
              <Button
                type="text"
                size="small"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={() => handleSearch(inputValue)}
              />
            </Space>
          }
          onPressEnter={(e) => handleSearch(e.target.value)}
          size={size}
        />
      </AutoComplete>
    ) : (
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onPressEnter={(e) => handleSearch(e.target.value)}
        suffix={
          <Space>
            {showClear && inputValue && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClear}
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={() => handleSearch(inputValue)}
            />
          </Space>
        }
        size={size}
        style={{ flex: 1 }}
      />
    );

  return (
    <Space.Compact style={{ width: '100%', ...style }} {...props}>
      {showCategoryFilter && categories.length > 0 && (
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ width: 120 }}
          size={size}
        >
          <Option value="all">All Categories</Option>
          {categories.map((category) => (
            <Option
              key={category.value || category}
              value={category.value || category}
            >
              {category.label || category}
            </Option>
          ))}
        </Select>
      )}

      {searchInput}

      {showFilter && (
        <Button icon={<FilterOutlined />} onClick={onFilterToggle} size={size}>
          Filter
        </Button>
      )}
    </Space.Compact>
  );
};

export default SearchBar;
