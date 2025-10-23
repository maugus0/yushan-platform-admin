import {
  EditModal,
  DeleteConfirm,
  ConfirmDialog,
  SuspendUserModal,
  BanUserModal,
  ViewModal,
  ReportActionModal,
} from './index';

describe('Modal Components Index', () => {
  test('exports EditModal', () => {
    expect(EditModal).toBeDefined();
    expect(typeof EditModal).toBe('function');
  });

  test('exports DeleteConfirm', () => {
    expect(DeleteConfirm).toBeDefined();
    expect(typeof DeleteConfirm).toBe('function');
  });

  test('exports ConfirmDialog', () => {
    expect(ConfirmDialog).toBeDefined();
    expect(typeof ConfirmDialog).toBe('function');
  });

  test('exports SuspendUserModal', () => {
    expect(SuspendUserModal).toBeDefined();
    expect(typeof SuspendUserModal).toBe('function');
  });

  test('exports BanUserModal', () => {
    expect(BanUserModal).toBeDefined();
    expect(typeof BanUserModal).toBe('function');
  });

  test('exports ViewModal', () => {
    expect(ViewModal).toBeDefined();
    expect(typeof ViewModal).toBe('function');
  });

  test('exports ReportActionModal', () => {
    expect(ReportActionModal).toBeDefined();
    expect(typeof ReportActionModal).toBe('function');
  });

  test('all exports are React components', () => {
    const components = [
      EditModal,
      DeleteConfirm,
      ConfirmDialog,
      SuspendUserModal,
      BanUserModal,
      ViewModal,
      ReportActionModal,
    ];

    components.forEach((component) => {
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');
    });
  });
});
