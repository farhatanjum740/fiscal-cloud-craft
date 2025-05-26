
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
      // Get current user's role
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      setUserRole(userRoleData as UserRole);

      // Get all team members if user is owner/admin
      if (userRoleData && ['owner', 'admin'].includes(userRoleData.role)) {
        const { data: teamData } = await supabase
          .from('user_roles')
          .select(`
            *,
            profiles(full_name)
          `)
          .eq('company_id', companyId);

        // Type cast and map the data
        const typedTeamData = (teamData || []).map(member => ({
          ...member,
          role: member.role as 'owner' | 'admin' | 'staff' | 'viewer',
          full_name: member.profiles?.[0]?.full_name || 'Unknown User'
        }));

        setTeamMembers(typedTeamData);

        // Get pending invitations
        const { data: invitationData } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('company_id', companyId)
          .is('accepted_at', null);

        // Type cast the invitations
        const typedInvitations = (invitationData || []).map(invitation => ({
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
        description: `Invitation sent to ${email}`,
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
    if (!user || !companyId) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: "User Removed",
        description: "User has been removed from the team",
      });

      await fetchUserRoles();
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive"
      });
      return false;
    }
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
    return requiredRole.includes(userRole.role);
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
