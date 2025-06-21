
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, X } from 'lucide-react';
import { TeamInvitation } from '@/hooks/useTeamManagement';
import { formatDistanceToNow } from 'date-fns';

interface TeamInvitationCardProps {
  invitation: TeamInvitation;
  onCancel: (invitationId: string) => void;
  canManage: boolean;
}

const TeamInvitationCard: React.FC<TeamInvitationCardProps> = ({
  invitation,
  onCancel,
  canManage
}) => {
  const isExpired = new Date(invitation.expires_at) < new Date();
  
  const getTimeLeft = () => {
    const expiresAt = new Date(invitation.expires_at);
    if (isExpired) {
      return 'Expired';
    }
    return `Expires ${formatDistanceToNow(expiresAt, { addSuffix: true })}`;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isExpired ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            
            <div>
              <h3 className="font-medium">{invitation.email}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeLeft()}
                </div>
              </div>
              {invitation.invited_by_name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Invited by {invitation.invited_by_name}
                </p>
              )}
            </div>
          </div>
          
          {canManage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(invitation.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamInvitationCard;
