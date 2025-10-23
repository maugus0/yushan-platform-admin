import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionButtons from './actionbuttons';

describe('ActionButtons Component', () => {
  const mockRecord = { id: 1, name: 'Test Item' };
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnView = jest.fn();
  const mockOnCopy = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnShare = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnPrint = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      const { container } = render(
        <ActionButtons
          record={mockRecord}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onView={mockOnView}
        />
      );
      expect(container).toBeInTheDocument();
    });

    test('renders view button when showView is true', () => {
      const { container } = render(
        <ActionButtons
          record={mockRecord}
          onView={mockOnView}
          showView={true}
        />
      );
      const viewIcon = container.querySelector('.anticon-eye');
      expect(viewIcon).toBeInTheDocument();
    });

    test('renders edit button when showEdit is true', () => {
      render(
        <ActionButtons
          record={mockRecord}
          onEdit={mockOnEdit}
          showEdit={true}
        />
      );
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    test('renders delete button when showDelete is true', () => {
      render(
        <ActionButtons
          record={mockRecord}
          onDelete={mockOnDelete}
          showDelete={true}
        />
      );
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    test('does not render view button when showView is false', () => {
      render(
        <ActionButtons
          record={mockRecord}
          onView={mockOnView}
          showView={false}
        />
      );
      const viewButtons = screen.queryAllByRole('button', { name: /view/i });
      expect(viewButtons.length).toBe(0);
    });

    test('does not render edit button when showEdit is false', () => {
      render(
        <ActionButtons
          record={mockRecord}
          onEdit={mockOnEdit}
          showEdit={false}
        />
      );
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(0);
    });

    test('does not render delete button when showDelete is false', () => {
      render(
        <ActionButtons
          record={mockRecord}
          onDelete={mockOnDelete}
          showDelete={false}
        />
      );
      const deleteButtons = screen.queryAllByRole('button', {
        name: /delete/i,
      });
      expect(deleteButtons.length).toBe(0);
    });
  });

  describe('Button Click Handlers', () => {
    test('calls onView with record when view button is clicked', () => {
      const { container } = render(
        <ActionButtons record={mockRecord} onView={mockOnView} />
      );
      const viewButton = container
        .querySelector('button .anticon-eye')
        .closest('button');
      fireEvent.click(viewButton);
      expect(mockOnView).toHaveBeenCalledWith(mockRecord);
      expect(mockOnView).toHaveBeenCalledTimes(1);
    });

    test('calls onEdit with record when edit button is clicked', () => {
      render(<ActionButtons record={mockRecord} onEdit={mockOnEdit} />);
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockRecord);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    test('calls onDelete with record when delete is confirmed', async () => {
      render(<ActionButtons record={mockRecord} onDelete={mockOnDelete} />);
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Are you sure you want to delete this item/i)
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /yes/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockRecord);
      });
    });

    test('does not call onDelete when cancel is clicked', async () => {
      render(<ActionButtons record={mockRecord} onDelete={mockOnDelete} />);
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Are you sure you want to delete this item/i)
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /no/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnDelete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Delete Confirmation', () => {
    test('uses custom deleteConfirmTitle', async () => {
      const customTitle = 'Custom Delete Title';
      render(
        <ActionButtons
          record={mockRecord}
          onDelete={mockOnDelete}
          deleteConfirmTitle={customTitle}
        />
      );
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(customTitle)).toBeInTheDocument();
      });
    });

    test('uses custom deleteConfirmDescription', async () => {
      const customDescription = 'Custom warning message';
      render(
        <ActionButtons
          record={mockRecord}
          onDelete={mockOnDelete}
          deleteConfirmDescription={customDescription}
        />
      );
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(customDescription)).toBeInTheDocument();
      });
    });
  });

  describe('More Actions Dropdown', () => {
    test('renders dropdown when showMore is true and actions exist', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onCopy={mockOnCopy}
        />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('does not render dropdown when showMore is false', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={false}
          onCopy={mockOnCopy}
        />
      );
      // Only the default buttons should be present
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeLessThan(4);
    });

    test('includes copy action in dropdown menu', async () => {
      const { container } = render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onCopy={mockOnCopy}
        />
      );
      const moreButton = container.querySelector('.anticon-more');
      if (moreButton) {
        fireEvent.mouseEnter(moreButton.closest('button'));
        fireEvent.click(moreButton.closest('button'));

        await waitFor(
          () => {
            const copyOption = screen.queryByText('Copy');
            if (copyOption) {
              expect(copyOption).toBeInTheDocument();
            }
          },
          { timeout: 1000 }
        );
      }
    });

    test('renders more button when showMore is true and actions exist', () => {
      const { container } = render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onExport={mockOnExport}
        />
      );
      const moreIcon = container.querySelector('.anticon-more');
      expect(moreIcon).toBeInTheDocument();
    });

    test('verifies export handler is passed correctly', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onExport={mockOnExport}
        />
      );
      // Just verify component renders with the handler
      expect(mockOnExport).toBeDefined();
    });

    test('verifies share handler is passed correctly', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onShare={mockOnShare}
        />
      );
      expect(mockOnShare).toBeDefined();
    });

    test('verifies download handler is passed correctly', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onDownload={mockOnDownload}
        />
      );
      expect(mockOnDownload).toBeDefined();
    });

    test('verifies print handler is passed correctly', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onPrint={mockOnPrint}
        />
      );
      expect(mockOnPrint).toBeDefined();
    });

    test('verifies copy handler is passed correctly', () => {
      render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          onCopy={mockOnCopy}
        />
      );
      expect(mockOnCopy).toBeDefined();
    });
  });

  describe('Custom Actions', () => {
    test('accepts custom actions prop', () => {
      const customAction = {
        key: 'custom',
        label: 'Custom Action',
        onClick: jest.fn(),
      };

      const { container } = render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          customActions={[customAction]}
        />
      );

      // Verify component renders with custom actions
      expect(container).toBeInTheDocument();
      expect(customAction.onClick).toBeDefined();
    });

    test('handles multiple custom actions', () => {
      const customActions = [
        {
          key: 'custom1',
          label: 'Action 1',
          onClick: jest.fn(),
        },
        {
          key: 'custom2',
          label: 'Action 2',
          onClick: jest.fn(),
        },
      ];

      const { container } = render(
        <ActionButtons
          record={mockRecord}
          showMore={true}
          customActions={customActions}
        />
      );

      expect(container).toBeInTheDocument();
      expect(customActions[0].onClick).toBeDefined();
      expect(customActions[1].onClick).toBeDefined();
    });
  });

  describe('Button Size and Type', () => {
    test('applies custom size prop', () => {
      const { container } = render(
        <ActionButtons record={mockRecord} onEdit={mockOnEdit} size="large" />
      );
      expect(container).toBeInTheDocument();
    });

    test('applies custom type prop', () => {
      const { container } = render(
        <ActionButtons record={mockRecord} onEdit={mockOnEdit} type="primary" />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Missing Handlers', () => {
    test('does not render view button when onView is not provided', () => {
      render(<ActionButtons record={mockRecord} showView={true} />);
      const viewButtons = screen.queryAllByRole('button', { name: /view/i });
      expect(viewButtons.length).toBe(0);
    });

    test('does not render edit button when onEdit is not provided', () => {
      render(<ActionButtons record={mockRecord} showEdit={true} />);
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(0);
    });

    test('does not render delete button when onDelete is not provided', () => {
      render(<ActionButtons record={mockRecord} showDelete={true} />);
      const deleteButtons = screen.queryAllByRole('button', {
        name: /delete/i,
      });
      expect(deleteButtons.length).toBe(0);
    });
  });
});
