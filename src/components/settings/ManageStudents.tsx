import { useState } from 'react';
import { useAllStudents } from '@/hooks/useStudents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types';

export default function ManageStudents() {
  const { data: students = [], isLoading, refetch } = useAllStudents();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    rollNumber: '',
    floorNumber: 1,
    roomNumber: '',
    bedNumber: 1,
  });

  // Form state for adding new student
  const [addForm, setAddForm] = useState({
    name: '',
    rollNumber: '',
    floorNumber: 1,
    roomNumber: '',
    bedNumber: 1,
  });

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roomNumber.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setEditForm({
      name: student.name,
      rollNumber: student.rollNumber,
      floorNumber: student.floorNumber,
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
    });
  };

  const handleAddStudent = async () => {
    setAdding(true);
    try {
      const { error } = await supabase
        .from('students')
        .insert({
          name: addForm.name,
          roll_number: addForm.rollNumber,
          floor_number: addForm.floorNumber,
          room_number: addForm.roomNumber,
          bed_number: addForm.bedNumber,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student added successfully',
      });

      // Reset form
      setAddForm({
        name: '',
        rollNumber: '',
        floorNumber: 1,
        roomNumber: '',
        bedNumber: 1,
      });

      refetch();
      setShowAddDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add student',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editStudent) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: editForm.name,
          roll_number: editForm.rollNumber,
          floor_number: editForm.floorNumber,
          room_number: editForm.roomNumber,
          bed_number: editForm.bedNumber,
        })
        .eq('id', editStudent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student information updated successfully',
      });

      refetch();
      setEditStudent(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudent) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', deleteStudent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${deleteStudent.name} has been deleted`,
      });

      refetch();
      setDeleteStudent(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Student Button */}
      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Student Manually
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll number, or room..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Total Students: {students.length}</span>
        {searchQuery && (
          <span>Filtered: {filteredStudents.length}</span>
        )}
      </div>

      <div className="space-y-2">
        {currentStudents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchQuery ? 'No students found matching your search' : 'No students found'}
          </Card>
        ) : (
          currentStudents.map((student) => (
            <Card key={student.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{student.name}</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Roll: {student.rollNumber}</span>
                    <span>Floor {student.floorNumber}</span>
                    <span>Room {student.roomNumber}</span>
                    <span>Bed {student.bedNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(student)}
                    className="h-9 w-9"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteStudent(student)}
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student details to add them to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-roll">Roll Number *</Label>
              <Input
                id="add-roll"
                value={addForm.rollNumber}
                onChange={(e) => setAddForm({ ...addForm, rollNumber: e.target.value })}
                placeholder="Roll number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-floor">Floor *</Label>
                <Input
                  id="add-floor"
                  type="number"
                  min="1"
                  max="8"
                  value={addForm.floorNumber}
                  onChange={(e) => setAddForm({ ...addForm, floorNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-room">Room *</Label>
                <Input
                  id="add-room"
                  value={addForm.roomNumber}
                  onChange={(e) => setAddForm({ ...addForm, roomNumber: e.target.value })}
                  placeholder="Room number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-bed">Bed Number *</Label>
              <Input
                id="add-bed"
                type="number"
                min="1"
                value={addForm.bedNumber}
                onChange={(e) => setAddForm({ ...addForm, bedNumber: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={adding || !addForm.name || !addForm.rollNumber || !addForm.roomNumber}
            >
              {adding ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-roll">Roll Number</Label>
              <Input
                id="edit-roll"
                value={editForm.rollNumber}
                onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                placeholder="Roll number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  type="number"
                  min="1"
                  max="8"
                  value={editForm.floorNumber}
                  onChange={(e) => setEditForm({ ...editForm, floorNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room">Room</Label>
                <Input
                  id="edit-room"
                  value={editForm.roomNumber}
                  onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  placeholder="Room number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bed">Bed Number</Label>
              <Input
                id="edit-bed"
                type="number"
                min="1"
                value={editForm.bedNumber}
                onChange={(e) => setEditForm({ ...editForm, bedNumber: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditStudent(null)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStudent}
              disabled={updating || !editForm.name || !editForm.rollNumber || !editForm.roomNumber}
            >
              {updating ? 'Updating...' : 'Update Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteStudent?.name}</strong>?
              This will also remove all their attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}