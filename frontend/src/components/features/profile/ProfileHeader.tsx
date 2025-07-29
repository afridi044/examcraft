"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, User, Mail, Building, GraduationCap } from "lucide-react";
import type { AuthUser } from "@/lib/services/auth.service";

interface ProfileHeaderProps {
  user: AuthUser;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function ProfileHeader({ user, isEditing, setIsEditing }: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-4 sm:p-6 bg-white/5 border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold">
              {imageError ? (
                getInitials(user.first_name || 'U', user.last_name || 'S')
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                
                {user.institution && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{user.institution}</span>
                  </div>
                )}
                
                {user.field_of_study && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{user.field_of_study}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Member since {formatDate(user.created_at)}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "destructive" : "default"}
                size="sm"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 