"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading";
import { userService } from "@/lib/services/user.service";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { motion } from "framer-motion";
import { Save, X, User, Mail, Building, GraduationCap } from "lucide-react";
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">First Name</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-gray-200">{user.first_name || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Last Name</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-gray-200">{user.last_name || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">Email</Label>
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-200">{user.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Institution</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg">
              <Building className="w-4 h-4 text-purple-400" />
              <span className="text-gray-200">{user.institution || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Field of Study</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg">
              <GraduationCap className="w-4 h-4 text-orange-400" />
              <span className="text-gray-200">{user.field_of_study || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-sm font-medium text-gray-300">
            First Name *
          </Label>
          <div className="relative">
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="w-full bg-slate-700/50 border-slate-600/60 rounded-lg px-4 py-3 pl-10 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              placeholder="Enter your first name"
              required
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-sm font-medium text-gray-300">
            Last Name *
          </Label>
          <div className="relative">
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="w-full bg-slate-700/50 border-slate-600/60 rounded-lg px-4 py-3 pl-10 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              placeholder="Enter your last name"
              required
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-300">
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="w-full bg-slate-700/50 border-slate-600/60 rounded-lg px-4 py-3 pl-10 text-gray-400 cursor-not-allowed"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xs text-gray-400">Email address cannot be changed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="institution" className="text-sm font-medium text-gray-300">
            Institution
          </Label>
          <div className="relative">
            <Input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              className="w-full bg-slate-700/50 border-slate-600/60 rounded-lg px-4 py-3 pl-10 text-gray-200 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              placeholder="Enter your institution"
            />
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="field_of_study" className="text-sm font-medium text-gray-300">
            Field of Study
          </Label>
          <div className="relative">
            <Input
              id="field_of_study"
              type="text"
              value={formData.field_of_study}
              onChange={(e) => handleInputChange('field_of_study', e.target.value)}
              className="w-full bg-slate-700/50 border-slate-600/60 rounded-lg px-4 py-3 pl-10 text-gray-200 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
              placeholder="Enter your field of study"
            />
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2 bg-slate-700/30 border-slate-600/50 text-white hover:bg-slate-700/50 hover:text-white"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      </div>
    </motion.form>
  );
} 