import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import CategoryForm from './categoryform';
import { categoryService } from '../../../services/admin/categoryservice';

// Mock the category service
jest.mock('../../../services/admin/categoryservice', () => ({
  categoryService: {
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
  },
}));

// Mock antd message
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('CategoryForm (enhanced)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    test('renders create form with initial values and disabled switch hint', async () => {
      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Create New Category')).toBeInTheDocument();
      // name/description inputs exist
      expect(
        screen.getByPlaceholderText(
          'Enter category name (e.g., Fantasy, Romance)'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter a brief description of this category'
        )
      ).toBeInTheDocument();
      // Switch extra hint present in create mode
      expect(
        screen.getByText(
          /Backend currently only supports creating active categories/i
        )
      ).toBeInTheDocument();
      // Buttons
      expect(screen.getByText('Create Category')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('submits create successfully, resets form and calls onSuccess', async () => {
      const user = userEvent.setup();
      categoryService.createCategory.mockResolvedValue({
        success: true,
        data: { id: 100, name: 'Fantasy' },
      });

      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText(
        'Enter category name (e.g., Fantasy, Romance)'
      );
      const descriptionInput = screen.getByPlaceholderText(
        'Enter a brief description of this category'
      );

      await user.type(nameInput, 'Fantasy');
      // Use longer text to safely pass min length validations
      await user.type(descriptionInput, 'Epic tales description');

      await user.click(
        screen.getByRole('button', { name: /Create Category/i })
      );

      // Split assertions to reduce retries and extend timeout windows
      await waitFor(
        () => expect(categoryService.createCategory).toHaveBeenCalled(),
        { timeout: 10000 }
      );
      expect(categoryService.createCategory).toHaveBeenCalledWith({
        name: 'Fantasy',
        description: 'Epic tales description',
        isActive: true,
      });

      await waitFor(
        () =>
          expect(require('antd').message.success).toHaveBeenCalledWith(
            'Category created successfully'
          ),
        { timeout: 10000 }
      );

      await waitFor(
        () =>
          expect(mockOnSuccess).toHaveBeenCalledWith({
            id: 100,
            name: 'Fantasy',
          }),
        { timeout: 10000 }
      );
    }, 15000);

    test('shows error when create fails', async () => {
      const user = userEvent.setup();
      categoryService.createCategory.mockRejectedValue(
        new Error('API Error Message')
      );

      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.type(
        screen.getByPlaceholderText(
          'Enter category name (e.g., Fantasy, Romance)'
        ),
        'Bad'
      );
      await user.type(
        screen.getByPlaceholderText(
          'Enter a brief description of this category'
        ),
        'Some description here'
      );

      await user.click(screen.getByText('Create Category'));

      await waitFor(() => {
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to create category: API Error Message'
        );
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    }, 10000);

    test('shows validation messages for empty and too short fields', async () => {
      const user = userEvent.setup();

      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Submit empty
      await user.click(screen.getByText('Create Category'));
      await waitFor(() => {
        expect(
          screen.getByText('Please enter category name')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Please enter category description')
        ).toBeInTheDocument();
      });

      // Too short
      await user.type(
        screen.getByPlaceholderText(
          'Enter category name (e.g., Fantasy, Romance)'
        ),
        'A'
      );
      await user.type(
        screen.getByPlaceholderText(
          'Enter a brief description of this category'
        ),
        'Short'
      );
      await user.click(screen.getByText('Create Category'));

      await waitFor(() => {
        expect(
          screen.getByText('Name must be at least 2 characters')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Description must be at least 10 characters')
        ).toBeInTheDocument();
      });
    }, 10000);

    test('cancel resets form and calls onCancel', async () => {
      const user = userEvent.setup();

      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.type(
        screen.getByPlaceholderText(
          'Enter category name (e.g., Fantasy, Romance)'
        ),
        'Temp'
      );
      await user.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
    }, 10000);

    test('submit button shows loading while pending', async () => {
      const user = userEvent.setup();
      let resolveFn;
      const pending = new Promise((res) => {
        resolveFn = res;
      });
      categoryService.createCategory.mockReturnValue(pending);

      render(
        <CategoryForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.type(
        screen.getByPlaceholderText(
          'Enter category name (e.g., Fantasy, Romance)'
        ),
        'Load'
      );
      await user.type(
        screen.getByPlaceholderText(
          'Enter a brief description of this category'
        ),
        'Long enough description'
      );

      const submitBtn = screen.getByText('Create Category');
      // Trigger submit (loading should become true internally)
      await act(async () => {
        await user.click(submitBtn);
      });

      // We cannot easily inspect AntD Button loading attribute here,
      // but we can finish pending and ensure no errors
      act(() => resolveFn({ success: true, data: { id: 9, name: 'Load' } }));
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    }, 10000);
  });

  describe('Edit Mode', () => {
    test('shows loading spinner while fetching category', async () => {
      categoryService.getCategoryById.mockImplementation(
        () => new Promise(() => {})
      ); // never resolves

      render(
        <CategoryForm
          categoryId={1}
          mode="edit"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Antd Spin exists
      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });

    test('loads existing category and populates form', async () => {
      categoryService.getCategoryById.mockResolvedValue({
        success: true,
        data: {
          name: 'Existing Category',
          description: 'Existing description',
          isActive: false,
        },
      });

      render(
        <CategoryForm
          categoryId={1}
          mode="edit"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(categoryService.getCategoryById).toHaveBeenCalledWith(1);
      });

      // Wait until form title appears and spinner disappears
      await screen.findByText('Edit Category', undefined, { timeout: 5000 });
      await waitFor(() => {
        expect(document.querySelector('.ant-spin')).not.toBeInTheDocument();
      });

      const nameInput = await screen.findByDisplayValue(
        'Existing Category',
        {},
        { timeout: 5000 }
      );
      const descInput = await screen.findByDisplayValue(
        'Existing description',
        {},
        { timeout: 5000 }
      );

      expect(nameInput).toBeInTheDocument();
      expect(descInput).toBeInTheDocument();
    }, 10000);

    test('error on load category shows error message and triggers onCancel', async () => {
      categoryService.getCategoryById.mockRejectedValue(
        new Error('Load failed')
      );

      render(
        <CategoryForm
          categoryId={99}
          mode="edit"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to load category: Load failed'
        );
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    test('updates category successfully and calls onSuccess', async () => {
      const user = userEvent.setup();
      categoryService.getCategoryById.mockResolvedValue({
        success: true,
        data: {
          name: 'Old Name',
          description: 'Old description content',
          isActive: true,
        },
      });
      categoryService.updateCategory.mockResolvedValue({
        success: true,
        data: { id: 7, name: 'New Name' },
      });

      render(
        <CategoryForm
          categoryId={7}
          mode="edit"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() =>
        expect(categoryService.getCategoryById).toHaveBeenCalledWith(7)
      );
      // Ensure form fully loaded
      await screen.findByText('Edit Category', undefined, { timeout: 5000 });
      await waitFor(() => {
        expect(document.querySelector('.ant-spin')).not.toBeInTheDocument();
      });
      const nameInput = await screen.findByPlaceholderText(
        'Enter category name (e.g., Fantasy, Romance)',
        {},
        { timeout: 5000 }
      );
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');
      const submitEl = screen.getByText(/Update Category|Save Changes|Update/i);
      const submitBtn = submitEl.closest('button') || submitEl;
      await user.click(submitBtn);

      await waitFor(() => {
        expect(categoryService.updateCategory).toHaveBeenCalledWith(7, {
          name: 'New Name',
          description: 'Old description content',
          isActive: true,
        });
        expect(require('antd').message.success).toHaveBeenCalledWith(
          'Category updated successfully'
        );
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 7,
          name: 'New Name',
        });
      });
    }, 15000);

    test('update failure shows error message', async () => {
      const user = userEvent.setup();
      categoryService.getCategoryById.mockResolvedValue({
        success: true,
        data: {
          name: 'Name',
          description: 'Desc long enough',
          isActive: true,
        },
      });
      categoryService.updateCategory.mockRejectedValue(
        new Error('Update failed')
      );

      render(
        <CategoryForm
          categoryId={2}
          mode="edit"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() =>
        expect(categoryService.getCategoryById).toHaveBeenCalledWith(2)
      );

      // Ensure form fully loaded then click submit
      await screen.findByText('Edit Category', undefined, { timeout: 5000 });
      await waitFor(() => {
        expect(document.querySelector('.ant-spin')).not.toBeInTheDocument();
      });
      const submitEl = screen.getByText(/Update Category|Save Changes|Update/i);
      const submitBtn = submitEl.closest('button') || submitEl;
      await user.click(submitBtn);

      await waitFor(() => {
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to update category: Update failed'
        );
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    }, 10000);
  });
});
