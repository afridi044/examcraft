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
import { AlertCircle, CheckCircle } from "lucide-react";

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
          <LoadingSpinner size="lg" />
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
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1">
              Manage your account settings and view your learning progress
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
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
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <ProfileHeader user={user} isEditing={isEditing} setIsEditing={setIsEditing} />
            
            {/* Profile Form */}
            <Card className="p-4 sm:p-6 bg-white/5 border-white/10">
              <ProfileForm 
                user={user} 
                isEditing={isEditing} 
                setIsEditing={setIsEditing}
                onMessage={setMessage}
                onProfileUpdate={handleProfileUpdate}
              />
            </Card>
          </div>

          {/* Right Column - Account Actions */}
          <div className="lg:col-span-1">
            <ProfileActions user={user} onMessage={setMessage} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 