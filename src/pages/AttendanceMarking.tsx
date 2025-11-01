import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { mockRooms } from '@/data/mockData';
import { useAttendance } from '@/hooks/useAttendance';
import { User, Bed, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AttendanceMarking() {
  const navigate = useNavigate();
  const { floorNumber, roomNumber } = useParams<{ floorNumber: string; roomNumber: string }>();
  const floor = parseInt(floorNumber || '1');
  const { absentStudents, toggleStudentAttendance, submitAttendance, resetCurrentAttendance } =
    useAttendance();
  const [notes, setNotes] = useState('');

  const room = mockRooms.find(
    (r) => r.floorNumber === floor && r.roomNumber === roomNumber
  );

  if (!room) {
    return (
      <MainLayout title="Room Not Found">
        <div className="container px-4 py-6">
          <p>Room not found</p>
        </div>
      </MainLayout>
    );
  }

  const floorRooms = mockRooms.filter((r) => r.floorNumber === floor);
  const currentRoomIndex = floorRooms.findIndex((r) => r.roomNumber === roomNumber);

  const navigateRoom = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentRoomIndex - 1 : currentRoomIndex + 1;
    if (newIndex >= 0 && newIndex < floorRooms.length) {
      const newRoom = floorRooms[newIndex];
      resetCurrentAttendance();
      navigate(`/attendance/${floor}/${newRoom.roomNumber}`);
    }
  };

  const handleSubmit = () => {
    submitAttendance(room.roomNumber, room.floorNumber);
    toast.success('Attendance marked successfully!', {
      description: `Room ${room.roomNumber} - ${absentStudents.size} absent, ${
        room.students.length - absentStudents.size
      } present`,
    });
    
    // Navigate to next room or back to floor
    if (currentRoomIndex < floorRooms.length - 1) {
      navigateRoom('next');
    } else {
      navigate(`/floor/${floor}`);
    }
  };

  return (
    <MainLayout title={`Room ${room.roomNumber}`}>
      <div className="container space-y-6 px-4 py-6">
        {/* Room Info */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Room {room.roomNumber}</h2>
              <span className="text-sm text-muted-foreground">
                Floor {room.floorNumber}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{room.bedType} room</span>
              <span>•</span>
              <span>{room.capacity} beds</span>
              <span>•</span>
              <span>{room.students.length} students</span>
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
          {room.students.map((student) => {
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

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigateRoom('prev')}
            disabled={currentRoomIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateRoom('next')}
            disabled={currentRoomIndex === floorRooms.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="w-full touch-target" size="lg">
          Submit Attendance
        </Button>

        {/* Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Summary:</span>
            <div className="flex gap-4">
              <span className="text-accent">
                Present: {room.students.length - absentStudents.size}
              </span>
              <span className="text-warning">Absent: {absentStudents.size}</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
