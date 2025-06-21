
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users, Mail, Info, Loader2 } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import TeamInviteDialog from './TeamInviteDialog';
import TeamMemberCard from './TeamMemberCard';
import TeamInvitationCard from './TeamInvitationCard';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedTeamManagementProps {
  companyId: string;
}

const EnhancedTeamManagement: React.FC<EnhancedTeamManagementProps> = ({ companyId }) => {
  const { user } = useAuth();
  const {
    teamMembers,
    invitations,
    loading,
    loadTeamMembers,
    loadInvitations,
    inviteUser,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    canManageTeam
  } = useTeamManagement(companyId);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadTeamMembers();
      loadInvitations();
    }
  }, [companyId, loadTeamMembers, loadInvitations]);

  if (loading && teamMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Team Management
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const canManage = canManageTeam();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your team members and access permissions
          </p>
        </div>
        
        {canManage && (
          <Button onClick={() => setIsInviteDialogOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Team management is currently simplified. Full role-based access control and multi-user collaboration 
          features are available for future enhancement.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({teamMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Active team members with access to your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    canManage={canManage}
                    onUpdateRole={updateMemberRole}
                    onRemoveMember={removeMember}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invitations</p>
                  {canManage && (
                    <p className="text-sm mt-2">
                      Invite team members to collaborate on your projects
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <TeamInvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onCancel={cancelInvitation}
                      canManage={canManage}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TeamInviteDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={inviteUser}
        loading={loading}
      />
    </div>
  );
};

export default EnhancedTeamManagement;
