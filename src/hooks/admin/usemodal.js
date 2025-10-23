import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing modal state and behavior
 * Handles multiple modals, animations, and modal management
 */
export const useModal = () => {
  const [modals, setModals] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);

  // Open a modal
  const openModal = useCallback((modalId, data = {}) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: {
        isOpen: true,
        data,
        openedAt: new Date(),
      },
    }));
    setActiveModal(modalId);
    setModalHistory((prev) => [...prev, modalId]);
  }, []);

  // Close a modal
  const closeModal = useCallback(
    (modalId) => {
      setModals((prev) => ({
        ...prev,
        [modalId]: {
          ...prev[modalId],
          isOpen: false,
          closedAt: new Date(),
        },
      }));

      // Update active modal
      if (activeModal === modalId) {
        const remainingModals = modalHistory.filter((id) => id !== modalId);
        const newActiveModal =
          remainingModals.length > 0
            ? remainingModals[remainingModals.length - 1]
            : null;
        setActiveModal(newActiveModal);
        setModalHistory(remainingModals);
      }
    },
    [activeModal, modalHistory]
  );

  // Toggle modal state
  const toggleModal = useCallback(
    (modalId, data = {}) => {
      const modal = modals[modalId];
      if (modal && modal.isOpen) {
        closeModal(modalId);
      } else {
        openModal(modalId, data);
      }
    },
    [modals, openModal, closeModal]
  );

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const updatedModals = {};
      Object.keys(prev).forEach((modalId) => {
        updatedModals[modalId] = {
          ...prev[modalId],
          isOpen: false,
          closedAt: new Date(),
        };
      });
      return updatedModals;
    });
    setActiveModal(null);
    setModalHistory([]);
  }, []);

  // Check if modal is open
  const isModalOpen = useCallback(
    (modalId) => {
      return modals[modalId]?.isOpen || false;
    },
    [modals]
  );

  // Get modal data
  const getModalData = useCallback(
    (modalId) => {
      return modals[modalId]?.data || {};
    },
    [modals]
  );

  // Update modal data
  const updateModalData = useCallback((modalId, newData) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: {
        ...prev[modalId],
        data: { ...prev[modalId]?.data, ...newData },
      },
    }));
  }, []);

  // Get all open modals
  const getOpenModals = useCallback(() => {
    return Object.entries(modals)
      .filter(([_, modal]) => modal.isOpen)
      .map(([id, modal]) => ({ id, ...modal }));
  }, [modals]);

  // Get modal count
  const getModalCount = useCallback(() => {
    return getOpenModals().length;
  }, [getOpenModals]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && activeModal) {
        closeModal(activeModal);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeModal, closeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  return {
    // State
    modals,
    activeModal,
    modalHistory,

    // Actions
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,

    // Getters
    isModalOpen,
    getModalData,
    getOpenModals,
    getModalCount,

    // Utilities
    updateModalData,
  };
};

/**
 * Hook for managing a single modal
 */
export const useSingleModal = (modalId = 'default') => {
  const {
    isModalOpen: isOpen,
    openModal: open,
    closeModal: close,
    toggleModal: toggle,
    getModalData: getData,
    updateModalData: updateData,
  } = useModal();

  const openModal = useCallback(
    (data = {}) => {
      open(modalId, data);
    },
    [modalId, open]
  );

  const closeModal = useCallback(() => {
    close(modalId);
  }, [modalId, close]);

  const toggleModal = useCallback(
    (data = {}) => {
      toggle(modalId, data);
    },
    [modalId, toggle]
  );

  const getModalData = useCallback(() => {
    return getData(modalId);
  }, [modalId, getData]);

  const updateModalData = useCallback(
    (newData) => {
      updateData(modalId, newData);
    },
    [modalId, updateData]
  );

  return {
    isOpen: isOpen(modalId),
    open: openModal,
    close: closeModal,
    toggle: toggleModal,
    data: getModalData(),
    updateData: updateModalData,
  };
};

export default useModal;
