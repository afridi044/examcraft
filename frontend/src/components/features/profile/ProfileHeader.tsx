"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, User, Mail, Building, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-700/60"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          {/* Enhanced Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <motion.div 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-2xl ring-4 ring-slate-700/50"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {imageError ? (
                  getInitials(user.first_name || 'U', user.last_name || 'S')
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
                )}
              </motion.div>
              
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
              

            </div>
          </div>

          {/* Enhanced User Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h2>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.institution && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="truncate">{user.institution}</span>
                    </div>
                  )}
                  
                  {user.field_of_study && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="truncate">{user.field_of_study}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>

              {/* Enhanced Edit Button */}
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "destructive" : "default"}
                    size="sm"
                    className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                      isEditing 
                        ? "bg-red-600 hover:bg-red-700 border-red-500" 
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-blue-500"
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 