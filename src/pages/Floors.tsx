import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFloors } from '@/hooks/useRooms';

export default function Floors() {
  const navigate = useNavigate();
  const { data: floors = [], isLoading } = useFloors();

  if (isLoading) {
    return (
      <MainLayout title="Select Floor">
        <div className="container flex items-center justify-center px-4 py-20">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Select Floor">
      <div className="container space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Select Floor</h2>
          <p className="text-muted-foreground">Choose a floor to view rooms</p>
        </div>

        {/* Floor Grid */}
        <div className="grid grid-cols-2 gap-4">
          {floors.map((floor) => (
            <Card
              key={floor.id}
              className="cursor-pointer p-4 transition-smooth hover:border-primary hover:shadow-md"
              onClick={() => navigate(`/floor/${floor.floor_number}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Floor {floor.floor_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {floor.total_rooms} rooms
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </div>
    </MainLayout>
  );
}