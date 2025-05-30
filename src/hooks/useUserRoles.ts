import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TeamInvitation } from '@/types/subscription';
import { toast } from '@/components/ui/use-toast';

interface SimpleUserRole {
  id: string;
  user_id: string;
  company_id: string;
  role: 'owner';
}

interface UserRoleWithProfile extends SimpleUserRole {
  full_name?: string;
}

export const useUserRoles = (companyId?: string) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<SimpleUserRole | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserRoleWithProfile[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && companyId) {
      fetchUserRoles();
    } else {
      setLoading(false);
    }
  }, [user, companyId]);

  const fetchUserRoles = async () => {
    if (!user || !companyId) {
      setLoading(false);
      return;
    }

    try {
      // Check if user owns the company (simplified ownership model)
      const { data: companyData } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', companyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyData) {
        // User owns this company
        const ownerRole: SimpleUserRole = {
          id: 'owner-role',
          user_id: user.id,
          company_id: companyId,
          role: 'owner'
        };
        
        setUserRole(ownerRole);

        // Get user profile for display
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        setTeamMembers([{
          ...ownerRole,
          full_name: profileData?.full_name || 'Company Owner'
        }]);
      } else {
        // User doesn't own this company
        setUserRole(null);
        setTeamMembers([]);
      }

      // Get pending invitations (keeping this for future team functionality)
      const { data: invitationData } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('company_id', companyId)
        .eq('invited_by', user.id)
        .is('accepted_at', null);

      if (invitationData) {
        const typedInvitations = invitationData.map(invitation => ({
          ...invitation,
          role: invitation.role as 'admin' | 'staff' | 'viewer'
        }));
        setInvitations(typedInvitations);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (email: string, role: 'admin' | 'staff' | 'viewer') => {
    toast({
      title: "Team Management Simplified",
      description: "Team management is currently simplified to company owners only. Invitations are not active.",
    });
    return false;
  };

  const removeUser = async (userId: string) => {
    toast({
      title: "Team Management Simplified",
      description: "Team management is currently simplified to company owners only.",
    });
    return false;
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Cancelled",
        description: "Invitation has been cancelled",
      });

      await fetchUserRoles();
      return true;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      return false;
    }
  };

  const hasPermission = (requiredRole: string[]) => {
    if (!userRole) return false;
    return userRole.role === 'owner' && requiredRole.includes('owner');
  };

  return {
    userRole,
    teamMembers,
    invitations,
    loading,
    inviteUser,
    removeUser,
    cancelInvitation,
    hasPermission,
    refetch: fetchUserRoles
  };
};
