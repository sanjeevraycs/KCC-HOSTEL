import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Bed, ChevronLeft, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudents } from '@/hooks/useStudents';
import { useSubmitAttendance, useTodayAttendance } from '@/hooks/useAttendanceData';
import { useRooms } from '@/hooks/useRooms';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AttendanceMarking() {
  const navigate = useNavigate();
  const { floorNumber, roomNumber } = useParams<{ floorNumber: string; roomNumber: string }>();
  const floor = parseInt(floorNumber || '1');
  const [notes, setNotes] = useState('');
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set());

  const { data: students = [], isLoading } = useStudents(floor, roomNumber);
  const { data: todayAttendance = [] } = useTodayAttendance();
  const { data: allRooms = [] } = useRooms(floor);
  const submitAttendanceMutation = useSubmitAttendance();

  // Load previously marked absent students for this room when component mounts or data changes
  useEffect(() => {
    if (todayAttendance.length > 0 && students.length > 0) {
      const absentStudentIds = todayAttendance
        .filter(record => 
          record.status === 'absent' && 
          record.roomNumber === roomNumber &&
          record.floorNumber === floor
        )
        .map(record => record.studentId);
      
      setAbsentStudents(new Set(absentStudentIds));
      
      // Load notes from the first absent record
      const recordWithNotes = todayAttendance.find(r => 
        r.roomNumber === roomNumber && 
        r.floorNumber === floor && 
        r.notes
      );
      if (recordWithNotes?.notes) {
        setNotes(recordWithNotes.notes);
      }
    } else {
      // Reset if no attendance data
      setAbsentStudents(new Set());
      setNotes('');
    }
  }, [todayAttendance, students, roomNumber, floor]);

  // Find current room index and adjacent rooms
  const { currentIndex, previousRoom, nextRoom } = useMemo(() => {
    const sortedRooms = [...allRooms].sort((a, b) => 
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );
    const index = sortedRooms.findIndex(r => r.roomNumber === roomNumber);
    
    return {
      currentIndex: index,
      previousRoom: index > 0 ? sortedRooms[index - 1] : null,
      nextRoom: index < sortedRooms.length - 1 ? sortedRooms[index + 1] : null,
    };
  }, [allRooms, roomNumber]);

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
      console.log('Submitting attendance:', {
        absentStudentIds: Array.from(absentStudents),
        roomNumber,
        floorNumber: floor,
        notes
      });

      await submitAttendanceMutation.mutateAsync({
        absentStudentIds: Array.from(absentStudents),
        roomNumber: roomNumber || '',
        floorNumber: floor,
        notes: notes || undefined,
      });

      console.log('Attendance submitted successfully');

      // Show success toast and stay on the same page
      toast({
        title: "Attendance Submitted",
        description: `Attendance for Room ${roomNumber} has been saved successfully.`,
        variant: "default",
      });

      // No navigation - user stays on the same page
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigateToRoom = (targetRoom: string) => {
    navigate(`/attendance/${floor}/${targetRoom}`);
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
          <Button 
            onClick={() => navigate(`/floor/${floor}`)} 
            className="mt-4"
          >
            Back to Floor
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Room ${roomNumber}`}>
      <div className="container space-y-6 px-4 py-6">
        {/* Back to Floor Button */}
        <Button
          variant="outline"
          onClick={() => navigate(`/floor/${floor}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Floor {floor}
        </Button>

        {/* Room Info with Navigation */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => previousRoom && navigateToRoom(previousRoom.roomNumber)}
                disabled={!previousRoom}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {previousRoom ? `Room ${previousRoom.roomNumber}` : 'Previous'}
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold">Room {roomNumber}</h2>
                <span className="text-sm text-muted-foreground">Floor {floor}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => nextRoom && navigateToRoom(nextRoom.roomNumber)}
                disabled={!nextRoom}
                className="gap-1"
              >
                {nextRoom ? `Room ${nextRoom.roomNumber}` : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
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