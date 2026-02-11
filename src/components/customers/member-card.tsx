'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Award, CreditCard } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MemberCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    birthday?: Date | null;
    photoUrl?: string | null;
    points: number;
    createdAt: Date;
  };
  showMembershipId?: boolean;
}

export function MemberCard({ user, showMembershipId = false }: MemberCardProps) {
  // Generate initials from name
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate age if birthday is provided
  const age = user.birthday
    ? new Date().getFullYear() - new Date(user.birthday).getFullYear()
    : null;

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
        <div className="flex items-start gap-4">
          <Avatar className="w-40 h-40 border-4 border-white">
            <AvatarImage
              src={user.photoUrl || undefined}
              alt={user.name}
              className="object-cover object-center"
            />
            <AvatarFallback className="text-2xl bg-white text-blue-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 w-fit mb-12">
              <Award className="w-5 h-5" />
              <span className="font-semibold">{user.points} Points</span>

            </div>
            <div className="text-2xl">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              {showMembershipId && (
                <h3 className="text-sm opacity-90 flex items-center gap-2 text-right">
                  <CreditCard className="w-4 h-4" />
                  Member ID: {user.id.slice(-8).toUpperCase()}
                  
                </h3>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Card body with details */}
      <CardContent className="p-6 space-y-4 text-sm">
        <div className="grid gap-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          {user.phone && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          {/* Birthday */}
          {user.birthday && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Birthday</p>
                <p className="font-medium">
                  {formatDate(user.birthday)}
                  {age && <span className="text-muted-foreground ml-2">({age} years old)</span>}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}