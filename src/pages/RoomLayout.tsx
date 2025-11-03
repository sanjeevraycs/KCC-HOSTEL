import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRooms } from '@/hooks/useRooms';

export default function RoomLayout() {
  const navigate = useNavigate();
  const { floorNumber } = useParams<{ floorNumber: string }>();
  const floor = parseInt(floorNumber || '1');

  const { data: rooms = [], isLoading } = useRooms(floor);

  const navigateFloor = (direction: 'prev' | 'next') => {
    const newFloor = direction === 'prev' ? floor - 1 : floor + 1;
    if (newFloor >= 1 && newFloor <= 8) {
      navigate(`/floor/${newFloor}`);
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

  return (
    <MainLayout title={`Floor ${floor}`}>
      <div className="container space-y-6 px-4 py-6">
        {/* Floor Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateFloor('prev')}
            disabled={floor === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold">Floor {floor}</h2>
            <p className="text-sm text-muted-foreground">{rooms.length} rooms</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateFloor('next')}
            disabled={floor === 8}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-2 gap-4">
          {rooms.map((room) => {
            // Calculate absent count: total students - present students
            const totalStudents = room.studentCount || 0;
            const presentStudents = room.presentCount || 0;
            const absentCount = totalStudents - presentStudents;
            // All present only if: there are students AND absent count is 0
            const allPresent = totalStudents > 0 && absentCount === 0;

            return (
              <Card
                key={room.id}
                className="cursor-pointer p-4 transition-smooth hover:border-primary"
                onClick={() => navigate(`/attendance/${floor}/${room.roomNumber}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{room.roomNumber}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {room.bedType}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {presentStudents}/{totalStudents}
                      </span>
                    </div>
                    {allPresent ? (
                      <span className="text-xs font-medium text-green-600">
                        All present
                      </span>
                    ) : absentCount > 0 ? (
                      <span className="text-xs font-medium text-red-600">
                        {absentCount} absent
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        No students
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/floors')}
        >
          Back to Floors
        </Button>
      </div>
    </MainLayout>
  );
}