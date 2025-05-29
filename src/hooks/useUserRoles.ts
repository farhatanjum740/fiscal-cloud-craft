import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, TeamInvitation } from '@/types/subscription';
import { toast } from '@/components/ui/use-toast';

interface UserRoleWithProfile extends Omit<UserRole, 'role'> {
  role: 'owner' | 'admin' | 'staff' | 'viewer';
  full_name?: string;
}

export const useUserRoles = (companyId?: string) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserRoleWithProfile[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && companyId) {
      fetchUserRoles();
    }
  }, [user, companyId]);

  const fetchUserRoles = async () => {
    if (!user || !companyId) return;

    try {
      // Since we've simplified to ownership model, check if user owns the company
      const { data: companyData } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', companyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyData) {
        // User owns this company, so they're the owner
        setUserRole({
          id: 'owner-role',
          user_id: user.id,
          company_id: companyId,
          role: 'owner'
        });

        // For now, only show the owner in team members since we've disabled user_roles table
        // Get user profile for display
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        setTeamMembers([{
          id: 'owner-role',
          user_id: user.id,
          company_id: companyId,
          role: 'owner',
          full_name: profileData?.full_name || 'Company Owner'
        }]);
      } else {
        // User doesn't own this company
        setUserRole(null);
        setTeamMembers([]);
      }

      // Get pending invitations (still works since they use invited_by)
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
    if (!user || !companyId) return false;

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          email,
          company_id: companyId,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}. Note: Team management is currently simplified to company owners only.`,
      });

      await fetchUserRoles();
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeUser = async (userId: string) => {
    // Since we've simplified to ownership model, only show warning
    toast({
      title: "Team Management Simplified",
      description: "Team management is currently simplified to company owners only. Full team features will be restored soon.",
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
    // Since we've simplified to ownership, only owners have permissions
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
