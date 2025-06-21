
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Crown, Shield, User, Eye } from 'lucide-react';
import { TeamMember, UserRole } from '@/hooks/useTeamManagement';

interface TeamMemberCardProps {
  member: TeamMember;
  canManage: boolean;
  onUpdateRole?: (memberId: string, newRole: UserRole) => void;
  onRemoveMember?: (memberId: string) => void;
  currentUserId?: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  canManage,
  onUpdateRole,
  onRemoveMember,
  currentUserId
}) => {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'staff':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentUser = member.user_id === currentUserId;
  const canModifyMember = canManage && !isCurrentUser && member.role !== 'owner';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{member.full_name}</h3>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                {getRoleIcon(member.role)}
                <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          {canModifyMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onUpdateRole?.(member.id, 'admin')}
                  disabled={member.role === 'admin'}
                >
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateRole?.(member.id, 'staff')}
                  disabled={member.role === 'staff'}
                >
                  Make Staff
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateRole?.(member.id, 'viewer')}
                  disabled={member.role === 'viewer'}
                >
                  Make Viewer
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onRemoveMember?.(member.id)}
                >
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
