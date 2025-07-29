"use client";

import { useState, useEffect } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";
import { ProfileForm } from "@/components/features/profile/ProfileForm";
import { ProfileActions } from "@/components/features/profile/ProfileActions";

import { LoadingSpinner } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, User, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useBackendAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleProfileUpdate = async () => {
    // Force refresh user data after profile update
    await refreshUser();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to view your profile.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Page Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              Profile
            </h1>
            <p className="text-base text-gray-400 mt-2">
              Manage your account settings and view your learning progress
            </p>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className={message.type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                {message.text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <ProfileHeader user={user} isEditing={isEditing} setIsEditing={setIsEditing} />
            
            {/* Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-slate-800/40 border-slate-700/60 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                </div>
                <ProfileForm 
                  user={user} 
                  isEditing={isEditing} 
                  setIsEditing={setIsEditing}
                  onMessage={setMessage}
                  onProfileUpdate={handleProfileUpdate}
                />
              </Card>
            </motion.div>


          </div>

          {/* Right Column - Account Actions */}
          <div className="lg:col-span-1">
            <ProfileActions user={user} onMessage={setMessage} />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
} 