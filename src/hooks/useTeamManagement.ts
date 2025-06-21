
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useAuditTrail } from './useAuditTrail';

export type UserRole = 'owner' | 'admin' | 'staff' | 'viewer';

export interface TeamMember {
  id: string;
  user_id: string;
  company_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  joined_at: string;
  is_active: boolean;
}

export interface TeamInvitation {
  id: string;
  company_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  invited_by_name?: string;
  expires_at: string;
  created_at: string;
  token: string;
}

export const useTeamManagement = (companyId: string) => {
  const { user } = useAuth();
  const { logAction } = useAuditTrail();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);

  const loadTeamMembers = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      
      // Get company owner
      const { data: companyData } = await supabase
        .from('companies')
        .select(`
          id,
          user_id,
          profiles!companies_user_id_fkey (
            id,
            full_name
          )
        `)
        .eq('id', companyId)
        .single();

      if (companyData) {
        const owner: TeamMember = {
          id: 'owner',
          user_id: companyData.user_id,
          company_id: companyId,
          role: 'owner',
          full_name: companyData.profiles?.full_name || 'Company Owner',
          email: '', // We don't expose email for privacy
          joined_at: new Date().toISOString(),
          is_active: true
        };

        setTeamMembers([owner]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadInvitations = useCallback(async () => {
    if (!companyId || !user) return;

    try {
      const { data: invitationsData } = await supabase
        .from('team_invitations')
        .select(`
          *,
          profiles!team_invitations_invited_by_fkey (
            full_name
          )
        `)
        .eq('company_id', companyId)
        .is('accepted_at', null);

      if (invitationsData) {
        const formattedInvitations: TeamInvitation[] = invitationsData.map(inv => ({
          id: inv.id,
          company_id: inv.company_id,
          email: inv.email,
          role: inv.role as UserRole,
          invited_by: inv.invited_by,
          invited_by_name: inv.profiles?.full_name || 'Unknown',
          expires_at: inv.expires_at,
          created_at: inv.created_at,
          token: inv.token
        }));

        setInvitations(formattedInvitations);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  }, [companyId, user]);

  const inviteUser = useCallback(async (email: string, role: UserRole) => {
    if (!user || !companyId) return false;

    try {
      setLoading(true);

      // Check if user is already invited or is a member
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('company_id', companyId)
        .eq('email', email)
        .is('accepted_at', null)
        .maybeSingle();

      if (existingInvitation) {
        toast({
          title: "Already Invited",
          description: "This user has already been invited",
          variant: "destructive",
        });
        return false;
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          company_id: companyId,
          email,
          role,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
          token
        });

      if (error) throw error;

      await logAction('team_invitations', token, 'CREATE', null, {
        email,
        role,
        company_id: companyId
      });

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}`,
      });

      await loadInvitations();
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, companyId, logAction, loadInvitations]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      await logAction('team_invitations', invitationId, 'DELETE');

      toast({
        title: "Invitation Cancelled",
        description: "Invitation has been cancelled",
      });

      await loadInvitations();
      return true;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAction, loadInvitations]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: UserRole) => {
    // In simplified model, only owner exists, so this is disabled
    toast({
      title: "Feature Simplified",
      description: "Role updates are disabled in the simplified team model",
    });
    return false;
  }, []);

  const removeMember = useCallback(async (memberId: string) => {
    // In simplified model, can't remove owner
    toast({
      title: "Feature Simplified",
      description: "Member removal is disabled in the simplified team model",
    });
    return false;
  }, []);

  const hasPermission = useCallback((requiredRole: UserRole[]) => {
    if (!user) return false;
    
    // Check if user owns the company
    const userMember = teamMembers.find(member => member.user_id === user.id);
    return userMember?.role === 'owner' && requiredRole.includes('owner');
  }, [user, teamMembers]);

  const canManageTeam = useCallback(() => {
    return hasPermission(['owner']);
  }, [hasPermission]);

  return {
    teamMembers,
    invitations,
    loading,
    loadTeamMembers,
    loadInvitations,
    inviteUser,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    hasPermission,
    canManageTeam
  };
};
