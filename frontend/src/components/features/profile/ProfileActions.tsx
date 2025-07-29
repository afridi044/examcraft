"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { motion } from "framer-motion";
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
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to sign out' });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 3000));
      onMessage({ type: 'success', text: 'Account deleted successfully' });
      setShowDeleteDialog(false);
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >


      {/* Account Actions */}
      <Card className="p-6 bg-slate-800/40 border-slate-700/60 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Account Actions
        </h3>
        
        <div className="space-y-3">
          {/* Export Data */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleExportData}
              disabled={loading}
              variant="outline"
              className="w-full justify-start gap-3 bg-slate-700/30 border-slate-600/50 text-white hover:bg-slate-700/50 hover:text-white text-sm"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export My Data
            </Button>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start gap-3 bg-slate-700/30 border-slate-600/50 text-white hover:bg-slate-700/50 hover:text-white text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </motion.div>

          {/* Delete Account */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:text-red-300 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="p-6 bg-slate-800/40 border-slate-700/60 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Account Information
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Account Status</span>
            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Member Since</span>
            <span className="text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Email Verified</span>
            <span className="text-green-400">✓</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 