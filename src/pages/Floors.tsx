import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { mockFloors } from '@/data/mockData';
import { Building2, Users } from 'lucide-react';
import { ProgressIndicator } from '@/components/ui/progress-indicator';

export default function Floors() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Floor Selection">
      <div className="container space-y-6 px-4 py-6">
        <div>
          <h2 className="text-xl font-bold">Select a Floor</h2>
          <p className="text-sm text-muted-foreground">Choose a floor to mark attendance</p>
        </div>

        <div className="space-y-4">
          {mockFloors.map((floor) => {
            const completionPercentage = (floor.completedRooms / floor.totalRooms) * 100;

            return (
              <Card
                key={floor.floorNumber}
                className="cursor-pointer p-4 transition-smooth hover:border-primary"
                onClick={() => navigate(`/floor/${floor.floorNumber}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Floor {floor.floorNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {floor.totalRooms} rooms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{floor.totalStudents}</span>
                    </div>
                  </div>

                  <ProgressIndicator
                    value={floor.completedRooms}
                    max={floor.totalRooms}
                    label="Completion"
                    showPercentage
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
