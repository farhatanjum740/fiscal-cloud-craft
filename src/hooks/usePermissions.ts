
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManagement, UserRole } from './useTeamManagement';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Permission matrix defining what each role can do
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  owner: [
    // Full access to everything
    { resource: '*', action: 'manage' }
  ],
  admin: [
    // Can manage most resources except company settings
    { resource: 'invoices', action: 'manage' },
    { resource: 'customers', action: 'manage' },
    { resource: 'products', action: 'manage' },
    { resource: 'credit_notes', action: 'manage' },
    { resource: 'reports', action: 'read' },
    { resource: 'team', action: 'read' }
  ],
  staff: [
    // Can create and edit but not delete
    { resource: 'invoices', action: 'create' },
    { resource: 'invoices', action: 'read' },
    { resource: 'invoices', action: 'update' },
    { resource: 'customers', action: 'create' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update' },
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'credit_notes', action: 'create' },
    { resource: 'credit_notes', action: 'read' },
    { resource: 'credit_notes', action: 'update' }
  ],
  viewer: [
    // Read-only access
    { resource: 'invoices', action: 'read' },
    { resource: 'customers', action: 'read' },
    { resource: 'products', action: 'read' },
    { resource: 'credit_notes', action: 'read' },
    { resource: 'reports', action: 'read' }
  ]
};

export const usePermissions = (companyId: string) => {
  const { user } = useAuth();
  const { hasPermission } = useTeamManagement(companyId);

  const checkPermission = useCallback((resource: string, action: Permission['action']): boolean => {
    if (!user) return false;

    // Owner has full permissions
    if (hasPermission(['owner'])) {
      return true;
    }

    // For now, since we have simplified team management, 
    // only owners can perform actions
    return false;
  }, [user, hasPermission]);

  const canCreate = useCallback((resource: string) => {
    return checkPermission(resource, 'create');
  }, [checkPermission]);

  const canRead = useCallback((resource: string) => {
    return checkPermission(resource, 'read');
  }, [checkPermission]);

  const canUpdate = useCallback((resource: string) => {
    return checkPermission(resource, 'update');
  }, [checkPermission]);

  const canDelete = useCallback((resource: string) => {
    return checkPermission(resource, 'delete');
  }, [checkPermission]);

  const canManage = useCallback((resource: string) => {
    return checkPermission(resource, 'manage');
  }, [checkPermission]);

  // Specific permission helpers
  const canManageInvoices = useCallback(() => canManage('invoices'), [canManage]);
  const canManageCustomers = useCallback(() => canManage('customers'), [canManage]);
  const canManageProducts = useCallback(() => canManage('products'), [canManage]);
  const canManageCreditNotes = useCallback(() => canManage('credit_notes'), [canManage]);
  const canManageTeam = useCallback(() => canManage('team'), [canManage]);
  const canViewReports = useCallback(() => canRead('reports'), [canRead]);

  return {
    checkPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    canManageInvoices,
    canManageCustomers,
    canManageProducts,
    canManageCreditNotes,
    canManageTeam,
    canViewReports
  };
};
