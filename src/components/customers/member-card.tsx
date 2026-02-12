'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Award, CreditCard, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MemberCardProps {
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone: string;
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
    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
      {/* Header with gradient background - Responsive layout */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* Content - Stack on mobile, side-by-side on larger screens */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
          {/* Avatar - Responsive sizing */}
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 border-4 border-white shadow-lg ring-4 ring-white/20">
            <AvatarImage
              src={user.photoUrl || undefined}
              alt={user.name}
              className="object-cover object-center"
            />
            <AvatarFallback className="text-xl sm:text-2xl bg-white text-purple-600 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User info - Centered on mobile, left-aligned on larger screens */}
          <div className="flex-1 text-center sm:text-left w-full">
            {/* Name - Responsive font size */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 drop-shadow-md">
              {user.name}
            </h2>
            
            {/* Points badge - Prominent and responsive */}
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-3 shadow-lg border border-white/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="font-bold text-sm sm:text-base">{user.points.toLocaleString()} Points</span>
            </div>

            {/* Member ID - Responsive */}
            {showMembershipId && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90 text-xs sm:text-sm">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-mono tracking-wider">
                  ID: {user.id.slice(-8).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card body with details - Responsive grid */}
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-3 sm:gap-4">
          {/* Email */}
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
            <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200 shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5">Email</p>
              <p className="font-semibold text-sm sm:text-base break-all">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          {user.phone && (
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
              <div className="p-2 sm:p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-200 shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5">Phone</p>
                <p className="font-semibold text-sm sm:text-base">{user.phone}</p>
              </div>
            </div>
          )}

          {/* Birthday */}
          {user.birthday && (
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
              <div className="p-2 sm:p-2.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-200 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5">Birthday</p>
                <p className="font-semibold text-sm sm:text-base">
                  {formatDate(user.birthday)}
                  {age && (
                    <span className="text-muted-foreground ml-2 text-xs sm:text-sm font-normal">
                      ({age} years old)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
            <div className="p-2 sm:p-2.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors duration-200 shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5">Member Since</p>
              <p className="font-semibold text-sm sm:text-base">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}