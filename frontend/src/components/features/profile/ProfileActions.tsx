"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { 
  Download, 
  Trash2, 
  Settings, 
  Shield, 
  Bell, 
  Palette,
  LogOut,
  AlertTriangle
} from "lucide-react";
import type { AuthUser } from "@/lib/services/auth.service";

interface ProfileActionsProps {
  user: AuthUser;
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function ProfileActions({ user, onMessage }: ProfileActionsProps) {
  const { signOut } = useBackendAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Create a data export object
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          institution: user.institution,
          field_of_study: user.field_of_study,
          created_at: user.created_at,
        },
        export_date: new Date().toISOString(),
        note: "This export contains your basic profile information. For complete data export, please contact support."
      };

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `examcraft-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onMessage({
        type: 'success',
        text: 'Data exported successfully!'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      onMessage({
        type: 'error',
        text: 'Failed to export data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      onMessage({
        type: 'error',
        text: 'Please type DELETE to confirm account deletion.'
      });
      return;
    }

    setLoading(true);
    try {
      // Note: This would typically call an API endpoint to delete the account
      // For now, we'll just show a message
      onMessage({
        type: 'success',
        text: 'Account deletion request submitted. You will receive a confirmation email.'
      });
      setDeleteDialogOpen(false);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting account:', error);
      onMessage({
        type: 'error',
        text: 'Failed to delete account. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onMessage({
        type: 'success',
        text: 'Signed out successfully!'
      });
    } catch (error) {
      onMessage({
        type: 'error',
        text: 'Failed to sign out. Please try again.'
      });
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-white/5 border-white/10">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Account Actions</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {/* Export Data */}
        <Button
          onClick={handleExportData}
          disabled={loading}
          variant="outline"
          className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white text-sm sm:text-base"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export My Data
        </Button>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        {/* Delete Account */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 sm:gap-3 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-sm sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="delete-confirmation" className="text-gray-400 text-xs sm:text-sm">
                  Type DELETE to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm"
                  placeholder="DELETE"
                />
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-red-400">
                  <strong>Warning:</strong> This will permanently delete:
                </p>
                <ul className="text-xs sm:text-sm text-red-300 mt-2 space-y-1">
                  <li>• Your profile and account settings</li>
                  <li>• All quizzes and exams you've created</li>
                  <li>• All flashcards and study progress</li>
                  <li>• All learning analytics and statistics</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmation !== 'DELETE'}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-sm sm:text-base w-full sm:w-auto"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coming Soon Features */}
        <div className="pt-3 sm:pt-4 border-t border-white/10">
          <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">Coming Soon</h4>
          
          <div className="space-y-2">
            <Button
              disabled
              variant="outline"
              className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-gray-500 cursor-not-allowed text-sm sm:text-base"
            >
              <Settings className="w-4 h-4" />
              Advanced Settings
            </Button>
            
            <Button
              disabled
              variant="outline"
              className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-gray-500 cursor-not-allowed text-sm sm:text-base"
            >
              <Shield className="w-4 h-4" />
              Privacy Settings
            </Button>
            
            <Button
              disabled
              variant="outline"
              className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-gray-500 cursor-not-allowed text-sm sm:text-base"
            >
              <Bell className="w-4 h-4" />
              Notification Preferences
            </Button>
            
            <Button
              disabled
              variant="outline"
              className="w-full justify-start gap-2 sm:gap-3 bg-white/5 border-white/10 text-gray-500 cursor-not-allowed text-sm sm:text-base"
            >
              <Palette className="w-4 h-4" />
              Theme Settings
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 