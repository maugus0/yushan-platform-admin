import { renderHook, act, waitFor } from '@testing-library/react';
import { useModal, useSingleModal } from './usemodal';

describe('useModal Hook', () => {
  beforeEach(() => {
    // Reset document body style
    document.body.style.overflow = 'unset';
  });

  describe('Initial State', () => {
    test('initializes with empty modals', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.modals).toEqual({});
      expect(result.current.activeModal).toBe(null);
      expect(result.current.modalHistory).toEqual([]);
    });
  });

  describe('Modal Management', () => {
    test('opens a modal', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal', { title: 'Test Modal' });
      });

      expect(result.current.modals.testModal.isOpen).toBe(true);
      expect(result.current.modals.testModal.data).toEqual({
        title: 'Test Modal',
      });
      expect(result.current.activeModal).toBe('testModal');
      expect(result.current.modalHistory).toEqual(['testModal']);
    });

    test('closes a modal', async () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal', { title: 'Test Modal' });
      });

      await waitFor(() => {
        expect(result.current.activeModal).toBe('testModal');
      });

      act(() => {
        result.current.closeModal('testModal');
      });

      await waitFor(() => {
        expect(result.current.modals.testModal.isOpen).toBe(false);
        expect(result.current.activeModal).toBe(null);
        expect(result.current.modalHistory).toEqual([]);
      });
    });

    test('toggles modal state', () => {
      const { result } = renderHook(() => useModal());

      // First toggle - open
      act(() => {
        result.current.toggleModal('testModal', { title: 'Test Modal' });
      });

      expect(result.current.modals.testModal.isOpen).toBe(true);

      // Second toggle - close
      act(() => {
        result.current.toggleModal('testModal');
      });

      expect(result.current.modals.testModal.isOpen).toBe(false);
    });

    test('manages multiple modals', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('modal1', { title: 'Modal 1' });
        result.current.openModal('modal2', { title: 'Modal 2' });
      });

      expect(result.current.modals.modal1.isOpen).toBe(true);
      expect(result.current.modals.modal2.isOpen).toBe(true);
      expect(result.current.activeModal).toBe('modal2');
      expect(result.current.modalHistory).toEqual(['modal1', 'modal2']);
    });

    test('updates active modal when closing', async () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('modal1', { title: 'Modal 1' });
      });

      await waitFor(() => {
        expect(result.current.activeModal).toBe('modal1');
      });

      act(() => {
        result.current.openModal('modal2', { title: 'Modal 2' });
      });

      await waitFor(() => {
        expect(result.current.activeModal).toBe('modal2');
      });

      act(() => {
        result.current.closeModal('modal2');
      });

      await waitFor(() => {
        expect(result.current.activeModal).toBe('modal1');
        expect(result.current.modalHistory).toEqual(['modal1']);
      });
    });

    test('closes all modals', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('modal1', { title: 'Modal 1' });
        result.current.openModal('modal2', { title: 'Modal 2' });
        result.current.closeAllModals();
      });

      expect(result.current.modals.modal1.isOpen).toBe(false);
      expect(result.current.modals.modal2.isOpen).toBe(false);
      expect(result.current.activeModal).toBe(null);
      expect(result.current.modalHistory).toEqual([]);
    });
  });

  describe('Modal Getters', () => {
    test('checks if modal is open', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isModalOpen('testModal')).toBe(false);

      act(() => {
        result.current.openModal('testModal');
      });

      expect(result.current.isModalOpen('testModal')).toBe(true);
    });

    test('gets modal data', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal', { title: 'Test Modal', id: 1 });
      });

      expect(result.current.getModalData('testModal')).toEqual({
        title: 'Test Modal',
        id: 1,
      });
    });

    test('gets open modals', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('modal1', { title: 'Modal 1' });
        result.current.openModal('modal2', { title: 'Modal 2' });
        result.current.closeModal('modal1');
      });

      const openModals = result.current.getOpenModals();
      expect(openModals).toHaveLength(1);
      expect(openModals[0].id).toBe('modal2');
    });

    test('gets modal count', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.getModalCount()).toBe(0);

      act(() => {
        result.current.openModal('modal1');
        result.current.openModal('modal2');
      });

      expect(result.current.getModalCount()).toBe(2);
    });
  });

  describe('Modal Data Management', () => {
    test('updates modal data', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal', { title: 'Original Title' });
        result.current.updateModalData('testModal', {
          title: 'Updated Title',
          id: 1,
        });
      });

      expect(result.current.getModalData('testModal')).toEqual({
        title: 'Updated Title',
        id: 1,
      });
    });
  });

  describe('Keyboard Events', () => {
    test('closes modal on escape key', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal');
      });

      expect(result.current.activeModal).toBe('testModal');

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);
      });

      expect(result.current.activeModal).toBe(null);
    });
  });

  describe('Body Scroll Management', () => {
    test('prevents body scroll when modal is open', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.openModal('testModal');
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        result.current.closeModal('testModal');
      });

      expect(document.body.style.overflow).toBe('unset');
    });
  });
});

describe('useSingleModal Hook', () => {
  test('provides single modal interface', () => {
    const { result } = renderHook(() => useSingleModal('testModal'));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toEqual({});

    act(() => {
      result.current.open({ title: 'Test Modal' });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual({ title: 'Test Modal' });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  test('toggles modal state', () => {
    const { result } = renderHook(() => useSingleModal('testModal'));

    act(() => {
      result.current.toggle({ title: 'Test Modal' });
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  test('updates modal data', () => {
    const { result } = renderHook(() => useSingleModal('testModal'));

    act(() => {
      result.current.open({ title: 'Original Title' });
      result.current.updateData({ title: 'Updated Title', id: 1 });
    });

    expect(result.current.data).toEqual({
      title: 'Updated Title',
      id: 1,
    });
  });
});
