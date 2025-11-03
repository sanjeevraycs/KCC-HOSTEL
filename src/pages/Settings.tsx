import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Mail, Upload, Trash2, Users, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import StudentUpload from '@/components/settings/StudentUpload';
import ManageStudents from '@/components/settings/ManageStudents';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // ADD THIS LINE
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  // UPDATED: Clear all students and refresh cache
  const handleClearAllStudents = async () => {
    setClearing(true);
    try {
      // Delete all students from database
      const { error } = await supabase
        .from('students')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      // IMPORTANT: Refresh the cache so UI updates immediately
      await queryClient.invalidateQueries({ queryKey: ['all-students'] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });

      toast({
        title: 'Success',
        description: 'All student data has been cleared',
      });
      
      setShowClearDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear student data',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <MainLayout title="Settings">
      <div className="container space-y-6 px-4 py-6">
        {/* User Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-2xl text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Warden Account</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Student Data Management */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">Student Data Management</h3>
            </div>
          </div>
          <Separator />

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="inline mr-2 h-4 w-4" />
              Upload Data
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="inline mr-2 h-4 w-4" />
              Manage Students
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-4">
            {activeTab === 'upload' ? (
              <StudentUpload />
            ) : (
              <ManageStudents />
            )}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 space-y-4 border-destructive/50">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Danger Zone</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This action will permanently delete all student records from the database. This cannot be undone.
            </p>
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Student Data
            </Button>
          </div>
        </Card>

        {/* App Information */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">About HostelTrack</h3>
          <Separator />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>Hostel Attendance Management System</p>
            <p>Track student attendance across 8 floors efficiently</p>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Account</h3>
          <Separator />
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </Card>
      </div>

      {/* Confirmation Dialog for Clear All */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all student records from the database. 
              All attendance history will remain but won't be linked to any students.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllStudents}
              disabled={clearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearing ? 'Clearing...' : 'Yes, clear all data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}