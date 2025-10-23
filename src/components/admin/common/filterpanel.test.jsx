import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterPanel from './filterpanel';

describe('FilterPanel Component', () => {
  const mockOnFilter = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders filter panel', () => {
      render(<FilterPanel />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
      render(<FilterPanel title="Advanced Filters" />);
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });

    test('renders Clear button by default', () => {
      render(<FilterPanel />);
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    test('renders Apply Filters button by default', () => {
      render(<FilterPanel />);
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Select', () => {
    test('renders select filter', () => {
      const filters = [
        {
          type: 'select',
          name: 'status',
          label: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    test('select filter shows options when clicked', async () => {
      const filters = [
        {
          type: 'select',
          name: 'status',
          label: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      ];
      render(<FilterPanel filters={filters} />);

      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Types - MultiSelect', () => {
    test('renders multiselect filter', () => {
      const filters = [
        {
          type: 'multiselect',
          name: 'tags',
          label: 'Tags',
          options: [
            { label: 'Tag 1', value: 'tag1' },
            { label: 'Tag 2', value: 'tag2' },
          ],
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Date', () => {
    test('renders date filter', () => {
      const filters = [
        {
          type: 'date',
          name: 'created_date',
          label: 'Created Date',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Created Date')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Date Range', () => {
    test('renders daterange filter', () => {
      const filters = [
        {
          type: 'daterange',
          name: 'date_range',
          label: 'Date Range',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Number', () => {
    test('renders number filter', () => {
      const filters = [
        {
          type: 'number',
          name: 'age',
          label: 'Age',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Number Range', () => {
    test('renders numberrange filter with min and max inputs', () => {
      const filters = [
        {
          type: 'numberrange',
          name: 'price_range',
          label: 'Price Range',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Price Range')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Slider', () => {
    test('renders slider filter', () => {
      const filters = [
        {
          type: 'slider',
          name: 'rating',
          label: 'Rating',
          min: 0,
          max: 5,
        },
      ];
      const { container } = render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(container.querySelector('.ant-slider')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Checkbox', () => {
    test('renders checkbox group filter', () => {
      const filters = [
        {
          type: 'checkbox',
          name: 'features',
          label: 'Features',
          options: [
            { label: 'Feature 1', value: 'f1' },
            { label: 'Feature 2', value: 'f2' },
          ],
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Radio', () => {
    test('renders radio group filter', () => {
      const filters = [
        {
          type: 'radio',
          name: 'type',
          label: 'Type',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Search', () => {
    test('renders search input filter', () => {
      const filters = [
        {
          type: 'search',
          name: 'keyword',
          label: 'Keyword',
        },
      ];
      const { container } = render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Keyword')).toBeInTheDocument();
      expect(container.querySelector('.anticon-search')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Text Input (Default)', () => {
    test('renders default text input filter', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    test('renders text input for unknown type', () => {
      const filters = [
        {
          type: 'unknown',
          name: 'field',
          label: 'Field',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Field')).toBeInTheDocument();
    });
  });

  describe('Filter Actions', () => {
    test('calls onFilter when values change', async () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(<FilterPanel filters={filters} onFilter={mockOnFilter} />);

      const input = screen.getByPlaceholderText('Enter Name');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(mockOnFilter).toHaveBeenCalled();
      });
    });

    test('calls onClear when Clear button is clicked', () => {
      render(<FilterPanel onClear={mockOnClear} />);

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    test('resets form when Clear button is clicked', async () => {
      const filters = [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          placeholder: 'Enter Name',
        },
      ];
      render(<FilterPanel filters={filters} />);

      const input = screen.getByPlaceholderText('Enter Name');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(input.value).toBe('test');

      const clearButton = screen.getByText(/clear/i);
      fireEvent.click(clearButton);

      await waitFor(
        () => {
          // Check the input element directly after re-querying
          const clearedInput = screen.getByPlaceholderText('Enter Name');
          expect(clearedInput.value).toBe('');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Active Filters Count', () => {
    test('shows active filters count badge', async () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(<FilterPanel filters={filters} />);

      const input = screen.getByPlaceholderText('Enter Name');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    test('counts multiple active filters', async () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'text',
          name: 'email',
          label: 'Email',
        },
      ];
      render(<FilterPanel filters={filters} />);

      const nameInput = screen.getByPlaceholderText('Enter Name');
      const emailInput = screen.getByPlaceholderText('Enter Email');

      fireEvent.change(nameInput, { target: { value: 'test' } });
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    test('resets count to 0 when cleared', async () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(<FilterPanel filters={filters} />);

      const input = screen.getByPlaceholderText('Enter Name');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Collapsible Panel', () => {
    test('starts collapsed when collapsed prop is true', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(
        <FilterPanel filters={filters} collapsed={true} showToggle={true} />
      );

      expect(
        screen.queryByPlaceholderText('Enter Name')
      ).not.toBeInTheDocument();
    });

    test('toggles panel when clicked', async () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(
        <FilterPanel filters={filters} collapsed={true} showToggle={true} />
      );

      const header = screen.getByText('Filters');
      fireEvent.click(header);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      });
    });

    test('shows down icon when collapsed', () => {
      const { container } = render(
        <FilterPanel collapsed={true} showToggle={true} />
      );
      expect(container.querySelector('.anticon-down')).toBeInTheDocument();
    });

    test('shows up icon when expanded', () => {
      const { container } = render(
        <FilterPanel collapsed={false} showToggle={true} />
      );
      expect(container.querySelector('.anticon-up')).toBeInTheDocument();
    });
  });

  describe('Button Visibility', () => {
    test('hides Clear button when showClearButton is false', () => {
      render(<FilterPanel showClearButton={false} />);
      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    test('hides Apply Filters button when showApplyButton is false', () => {
      render(<FilterPanel showApplyButton={false} />);
      expect(screen.queryByText('Apply Filters')).not.toBeInTheDocument();
    });

    test('shows both buttons by default', () => {
      render(<FilterPanel />);
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
  });

  describe('Initial Values', () => {
    test('sets initial values from prop', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      const initialValues = { name: 'Initial Name' };

      render(<FilterPanel filters={filters} initialValues={initialValues} />);

      const input = screen.getByPlaceholderText('Enter Name');
      expect(input.value).toBe('Initial Name');
    });
  });

  describe('Layout', () => {
    test('applies vertical layout by default', () => {
      const { container } = render(<FilterPanel />);
      expect(container.querySelector('.ant-form-vertical')).toBeInTheDocument();
    });

    test('applies horizontal layout when specified', () => {
      const { container } = render(<FilterPanel layout="horizontal" />);
      expect(
        container.querySelector('.ant-form-horizontal')
      ).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<FilterPanel style={customStyle} />);
      const card = container.querySelector('.ant-card');
      expect(card).toHaveStyle(customStyle);
    });

    test('applies custom className', () => {
      const { container } = render(<FilterPanel className="custom-filter" />);
      expect(container.querySelector('.custom-filter')).toBeInTheDocument();
    });

    test('applies custom placeholder', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
          placeholder: 'Custom placeholder',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(
        screen.getByPlaceholderText('Custom placeholder')
      ).toBeInTheDocument();
    });
  });

  describe('Multiple Filters', () => {
    test('renders multiple filters', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'select',
          name: 'status',
          label: 'Status',
          options: [{ label: 'Active', value: 'active' }],
        },
        {
          type: 'number',
          name: 'age',
          label: 'Age',
        },
      ];
      render(<FilterPanel filters={filters} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty filters array', () => {
      const { container } = render(<FilterPanel filters={[]} />);
      expect(container).toBeInTheDocument();
    });

    test('handles filter without options for select', () => {
      const filters = [
        {
          type: 'select',
          name: 'status',
          label: 'Status',
        },
      ];
      render(<FilterPanel filters={filters} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    test('handles filter without name', () => {
      const filters = [
        {
          type: 'text',
          label: 'Field',
        },
      ];
      const { container } = render(<FilterPanel filters={filters} />);
      expect(container).toBeInTheDocument();
    });

    test('handles undefined onFilter', () => {
      const filters = [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
      ];
      render(<FilterPanel filters={filters} />);

      const input = screen.getByPlaceholderText('Enter Name');

      expect(() => {
        fireEvent.change(input, { target: { value: 'test' } });
      }).not.toThrow();
    });

    test('handles undefined onClear', () => {
      render(<FilterPanel />);

      const clearButton = screen.getByText('Clear');

      expect(() => {
        fireEvent.click(clearButton);
      }).not.toThrow();
    });
  });
});
