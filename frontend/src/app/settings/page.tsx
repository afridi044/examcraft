"use client";

import { useState, useEffect } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Eye, 
  Shield, 
  Palette, 
  Clock, 
  Download, 
  Trash2, 
  User,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Lock,
  Key,
  Database,
  Globe,
  Languages
} from "lucide-react";
import { motion } from "framer-motion";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "appearance",
    title: "Appearance",
    icon: <Palette className="h-5 w-5" />,
    description: "Customize your interface",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: <Bell className="h-5 w-5" />,
    description: "Manage your alerts",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: <Shield className="h-5 w-5" />,
    description: "Control your data",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "data",
    title: "Data & Storage",
    icon: <Database className="h-5 w-5" />,
    description: "Export and manage data",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: "preferences",
    title: "Preferences",
    icon: <Settings className="h-5 w-5" />,
    description: "Study and learning settings",
    color: "from-teal-500 to-blue-500"
  }
];

export default function SettingsPage() {
  const { user } = useBackendAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState("appearance");
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on component mount
    try {
      const savedSettings = localStorage.getItem('examcraft-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("❌ Failed to load settings from localStorage:", error);
    }
    
    // Default settings
    return {
      // Appearance
      theme: theme, // Use current theme from context
      fontSize: "medium",
      animations: true,
      
      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      studyReminders: true,
      achievementAlerts: true,
      weeklyReports: false,
      
      // Privacy
      dataCollection: true,
      analytics: true,
      publicProfile: false,
      
      // Preferences
      autoSave: true,
      studyTimer: 25,
      breakTimer: 5,
      soundEnabled: true,
      language: "en"
    };
  });

  // Load font size on component mount
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem('examcraft-font-size');
      if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
        applyFontSize(savedFontSize);
        // Update settings state to match the actual font size
        setSettings((prev: any) => ({
          ...prev,
          fontSize: savedFontSize
        }));
      }
    } catch (error) {
      console.error('Failed to load font size from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('examcraft-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    console.log(`🔄 Setting ${setting} to ${value}`);
    
    setSettings((prev: any) => ({
      ...prev,
      [setting]: value
    }));
    
    // Handle theme change immediately
    if (setting === 'theme') {
      setTheme(value);
    }
    
    // Handle font size change immediately
    if (setting === 'fontSize') {
      applyFontSize(value);
    }
    
    // Save to localStorage
    try {
      const updatedSettings = {
        ...settings,
        [setting]: value
      };
      localStorage.setItem('examcraft-settings', JSON.stringify(updatedSettings));
      console.log(`✅ Saved ${setting} = ${value} to localStorage`);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    // Apply new font size
    switch (fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'medium':
        root.classList.add('text-base');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('examcraft-font-size', fontSize);
    } catch (error) {
      console.error('Failed to save font size to localStorage:', error);
    }
    
    // Update settings state to reflect the actual font size
    setSettings((prev: any) => ({
      ...prev,
      fontSize: fontSize
    }));
  };




  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Theme</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred color scheme</p>
          </div>
          <Select value={theme} onValueChange={(value) => handleSettingChange("appearance", "theme", value)}>
            <SelectTrigger className={`w-36 h-10 px-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-slate-700/60 border-slate-600/60 hover:bg-slate-700/80 hover:border-slate-500/60 text-white shadow-lg' 
                : 'bg-white/90 border-gray-300/60 hover:bg-white hover:border-gray-400/60 text-gray-900 shadow-md'
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`rounded-xl border-2 shadow-xl ${
              isDark 
                ? 'bg-slate-800/95 border-slate-600/60 backdrop-blur-xl' 
                : 'bg-white/95 border-gray-200/60 backdrop-blur-xl'
            }`}>
              <SelectItem value="light" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Sun className="h-4 w-4 text-yellow-500" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Moon className="h-4 w-4 text-blue-400" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="auto" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Monitor className="h-4 w-4 text-purple-400" />
                  Auto
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Font Size</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Adjust text size for better readability</p>
          </div>
          <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange("appearance", "fontSize", value)}>
            <SelectTrigger className={`w-36 h-10 px-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-slate-700/60 border-slate-600/60 hover:bg-slate-700/80 hover:border-slate-500/60 text-white shadow-lg' 
                : 'bg-white/90 border-gray-300/60 hover:bg-white hover:border-gray-400/60 text-gray-900 shadow-md'
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`rounded-xl border-2 shadow-xl ${
              isDark 
                ? 'bg-slate-800/95 border-slate-600/60 backdrop-blur-xl' 
                : 'bg-white/95 border-gray-200/60 backdrop-blur-xl'
            }`}>
              <SelectItem value="small" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-xs">Aa</span>
                  Small
                </div>
              </SelectItem>
              <SelectItem value="medium" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-sm">Aa</span>
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="large" className={`rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700/60 focus:bg-slate-700/60' 
                  : 'hover:bg-gray-100/80 focus:bg-gray-100/80'
              }`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-base">Aa</span>
                  Large
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>


      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-all duration-200 ${
            settings.emailNotifications ? 'bg-green-500/10 border border-green-500/20' : ''
          }`}
        >
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Email Notifications
              {settings.emailNotifications && <span className="ml-2 text-xs text-green-500">● Active</span>}
            </Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Receive updates via email</p>
          </div>
          <Switch 
            checked={settings.emailNotifications} 
            onCheckedChange={(checked) => {
              console.log(`📧 Email notifications: ${checked}`);
              handleSettingChange("notifications", "emailNotifications", checked);
            }}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Push Notifications</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Get real-time alerts</p>
          </div>
          <Switch 
            checked={settings.pushNotifications} 
            onCheckedChange={(checked) => handleSettingChange("notifications", "pushNotifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Study Reminders</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Daily study session reminders</p>
          </div>
          <Switch 
            checked={settings.studyReminders} 
            onCheckedChange={(checked) => handleSettingChange("notifications", "studyReminders", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Achievement Alerts</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Celebrate your milestones</p>
          </div>
          <Switch 
            checked={settings.achievementAlerts} 
            onCheckedChange={(checked) => handleSettingChange("notifications", "achievementAlerts", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Weekly Reports</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Receive weekly progress summaries</p>
          </div>
          <Switch 
            checked={settings.weeklyReports} 
            onCheckedChange={(checked) => handleSettingChange("notifications", "weeklyReports", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Data Collection</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Help improve the app with usage data</p>
          </div>
          <Switch 
            checked={settings.dataCollection} 
            onCheckedChange={(checked) => handleSettingChange("privacy", "dataCollection", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Analytics</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Share anonymous usage statistics</p>
          </div>
          <Switch 
            checked={settings.analytics} 
            onCheckedChange={(checked) => handleSettingChange("privacy", "analytics", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Public Profile</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Allow others to see your progress</p>
          </div>
          <Switch 
            checked={settings.publicProfile} 
            onCheckedChange={(checked) => handleSettingChange("privacy", "publicProfile", checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Security</h4>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Key className="h-4 w-4" />
            Change Password
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Lock className="h-4 w-4" />
            Two-Factor Auth
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Data Management</h4>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 text-red-400 hover:text-red-300 ${isDark ? 'border-red-500/30 hover:bg-red-500/10 bg-gray-700' : 'border-red-300 hover:bg-red-50'}`}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Auto Save</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Automatically save your progress</p>
          </div>
          <Switch 
            checked={settings.autoSave} 
            onCheckedChange={(checked) => handleSettingChange("data", "autoSave", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Storage Used</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your data usage</p>
          </div>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>2.4 GB / 10 GB</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Data Export</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Download className="h-4 w-4" />
            Export Quiz History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Download className="h-4 w-4" />
            Export Flashcards
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Download className="h-4 w-4" />
            Export Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${isDark ? 'text-white border-gray-500 hover:bg-gray-600 hover:text-white bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            <Download className="h-4 w-4" />
            Export All Data
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreferenceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Study Timer Duration</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Default Pomodoro session length</p>
          </div>
          <Select value={settings.studyTimer.toString()} onValueChange={(value) => handleSettingChange("preferences", "studyTimer", parseInt(value))}>
            <SelectTrigger className={`w-24 ${isDark ? 'text-white bg-slate-700 border-slate-600' : 'text-gray-900 bg-white border-gray-300'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
              <SelectItem value="15" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>15 min</SelectItem>
              <SelectItem value="25" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>25 min</SelectItem>
              <SelectItem value="45" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>45 min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Break Duration</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rest time between sessions</p>
          </div>
          <Select value={settings.breakTimer.toString()} onValueChange={(value) => handleSettingChange("preferences", "breakTimer", parseInt(value))}>
            <SelectTrigger className={`w-24 ${isDark ? 'text-white bg-slate-700 border-slate-600' : 'text-gray-900 bg-white border-gray-300'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
              <SelectItem value="5" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>5 min</SelectItem>
              <SelectItem value="10" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>10 min</SelectItem>
              <SelectItem value="15" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>15 min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Sound Effects</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enable audio notifications</p>
          </div>
          <Switch 
            checked={settings.soundEnabled} 
            onCheckedChange={(checked) => handleSettingChange("preferences", "soundEnabled", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Language</Label>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred language</p>
          </div>
          <Select value={settings.language} onValueChange={(value) => handleSettingChange("preferences", "language", value)}>
            <SelectTrigger className={`w-32 ${isDark ? 'text-white bg-slate-700 border-slate-600' : 'text-gray-900 bg-white border-gray-300'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
              <SelectItem value="en" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>English</SelectItem>
              <SelectItem value="es" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>Español</SelectItem>
              <SelectItem value="fr" className={`${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}>Français</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "appearance":
        return renderAppearanceSettings();
      case "notifications":
        return renderNotificationSettings();
      case "privacy":
        return renderPrivacySettings();
      case "data":
        return renderDataSettings();
      case "preferences":
        return renderPreferenceSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h1>
          </div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Customize your learning experience</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className={`${
              isDark 
                ? 'bg-slate-800/40 border-slate-700/60' 
                : 'bg-white/80 border-gray-200/60'
            }`}>
              <CardHeader>
                <CardTitle className={`text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SETTINGS_SECTIONS.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      activeSection === section.id
                        ? "bg-gradient-to-r " + section.color + " text-white shadow-lg"
                        : "text-gray-300 hover:text-gray-100 hover:bg-slate-700/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {section.icon}
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className={`${
              isDark 
                ? 'bg-slate-800/40 border-slate-700/60' 
                : 'bg-white/80 border-gray-200/60'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.title}
                    </CardTitle>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>

                </div>
              </CardHeader>
              <CardContent>
                {renderSectionContent()}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 