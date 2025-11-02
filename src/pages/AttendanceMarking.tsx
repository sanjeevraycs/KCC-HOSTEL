import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Bed, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStudents } from '@/hooks/useStudents';
import { useSubmitAttendance } from '@/hooks/useAttendanceData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AttendanceMarking() {
  const navigate = useNavigate();
  const { floorNumber, roomNumber } = useParams<{ floorNumber: string; roomNumber: string }>();
  const floor = parseInt(floorNumber || '1');
  const [notes, setNotes] = useState('');
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set());

  const { data: students = [], isLoading } = useStudents(floor, roomNumber);
  const submitAttendanceMutation = useSubmitAttendance();

  const toggleStudentAttendance = (studentId: string) => {
    setAbsentStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      await submitAttendanceMutation.mutateAsync({
        absentStudentIds: Array.from(absentStudents),
        roomNumber: roomNumber || '',
        floorNumber: floor,
        notes: notes || undefined,
      });

      // Reset and navigate
      setAbsentStudents(new Set());
      setNotes('');
      navigate(`/floor/${floor}`);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to submit attendance:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Loading...">
        <div className="container flex items-center justify-center px-4 py-20">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!students.length) {
    return (
      <MainLayout title="Room Not Found">
        <div className="container px-4 py-6">
          <p>No students found for this room</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Room ${roomNumber}`}>
      <div className="container space-y-6 px-4 py-6">
        {/* Room Info */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Room {roomNumber}</h2>
              <span className="text-sm text-muted-foreground">
                Floor {floor}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{students.length} students</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="rounded-lg bg-accent/10 p-3">
          <p className="text-sm text-accent-foreground">
            Tap on absent students. All others will be marked present.
          </p>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Students</h3>
          {students.map((student) => {
            const isAbsent = absentStudents.has(student.id);

            return (
              <Card
                key={student.id}
                className={cn(
                  'cursor-pointer p-4 transition-smooth',
                  isAbsent
                    ? 'border-warning bg-warning/5'
                    : 'border-accent bg-accent/5'
                )}
                onClick={() => toggleStudentAttendance(student.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-secondary p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      <span>Bed {student.bedNumber}</span>
                    </div>
                    {!isAbsent && (
                      <div className="rounded-full bg-accent p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            placeholder="Add any observations or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full touch-target" 
          size="lg"
          disabled={submitAttendanceMutation.isPending}
        >
          {submitAttendanceMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
        </Button>

        {/* Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Summary:</span>
            <div className="flex gap-4">
              <span className="text-accent">
                Present: {students.length - absentStudents.size}
              </span>
              <span className="text-warning">Absent: {absentStudents.size}</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
