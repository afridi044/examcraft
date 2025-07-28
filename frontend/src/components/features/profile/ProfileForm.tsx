"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading";
import { userService } from "@/lib/services/user.service";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { Save, X } from "lucide-react";
import type { AuthUser } from "@/lib/services/auth.service";

interface ProfileFormProps {
  user: AuthUser;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
  onProfileUpdate?: () => Promise<void>;
}

interface FormData {
  first_name: string;
  last_name: string;
  institution: string;
  field_of_study: string;
}

export function ProfileForm({ user, isEditing, setIsEditing, onMessage, onProfileUpdate }: ProfileFormProps) {
  const { refreshUser } = useBackendAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    institution: user.institution || '',
    field_of_study: user.field_of_study || '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        onMessage({
          type: 'error',
          text: 'First name and last name are required.'
        });
        return;
      }

      const response = await userService.updateCurrentUser({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        institution: formData.institution.trim() || null,
        field_of_study: formData.field_of_study.trim() || null,
      });

      if (response.success && response.data) {
        // Update the user state with the new data
        // This ensures the UI reflects the changes immediately
        const updatedUser = response.data;
        
        // Force a re-render by updating the form data with new values
        setFormData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          institution: updatedUser.institution || '',
          field_of_study: updatedUser.field_of_study || '',
        });
        
        // Call the profile update callback to refresh the global state
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
        
        onMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
        
        setIsEditing(false);
      } else {
        onMessage({
          type: 'error',
          text: response.error || 'Failed to update profile. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      onMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      institution: user.institution || '',
      field_of_study: user.field_of_study || '',
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-white">Profile Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label className="text-gray-400 text-xs sm:text-sm">First Name</Label>
            <div className="mt-1 p-2 sm:p-3 bg-white/5 rounded-md border border-white/10 text-white text-sm sm:text-base">
              {user.first_name || 'Not provided'}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-xs sm:text-sm">Last Name</Label>
            <div className="mt-1 p-2 sm:p-3 bg-white/5 rounded-md border border-white/10 text-white text-sm sm:text-base">
              {user.last_name || 'Not provided'}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-xs sm:text-sm">Email</Label>
            <div className="mt-1 p-2 sm:p-3 bg-white/5 rounded-md border border-white/10 text-white text-sm sm:text-base">
              {user.email}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-xs sm:text-sm">Institution</Label>
            <div className="mt-1 p-2 sm:p-3 bg-white/5 rounded-md border border-white/10 text-white text-sm sm:text-base">
              {user.institution || 'Not provided'}
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <Label className="text-gray-400 text-xs sm:text-sm">Field of Study</Label>
            <div className="mt-1 p-2 sm:p-3 bg-white/5 rounded-md border border-white/10 text-white text-sm sm:text-base">
              {user.field_of_study || 'Not provided'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-white">Edit Profile Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="first_name" className="text-gray-400 text-xs sm:text-sm">
            First Name *
          </Label>
          <Input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm sm:text-base"
            placeholder="Enter your first name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="last_name" className="text-gray-400 text-xs sm:text-sm">
            Last Name *
          </Label>
          <Input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm sm:text-base"
            placeholder="Enter your last name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="institution" className="text-gray-400 text-xs sm:text-sm">
            Institution
          </Label>
          <Input
            id="institution"
            type="text"
            value={formData.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm sm:text-base"
            placeholder="Enter your institution"
          />
        </div>
        
        <div>
          <Label htmlFor="field_of_study" className="text-gray-400 text-xs sm:text-sm">
            Field of Study
          </Label>
          <Input
            id="field_of_study"
            type="text"
            value={formData.field_of_study}
            onChange={(e) => handleInputChange('field_of_study', e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm sm:text-base"
            placeholder="Enter your field of study"
          />
        </div>
        
        <div className="sm:col-span-2">
          <Label htmlFor="email" className="text-gray-400 text-xs sm:text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm sm:text-base"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
} 