import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockStudents } from '@/data/mockData';
import { useAttendance } from '@/hooks/useAttendance';
import { Users, UserCheck, UserX, ClipboardCheck } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getTodayAttendance } = useAttendance();
  const todayAttendance = getTodayAttendance();

  const stats = {
    totalStudents: mockStudents.length,
    absentToday: todayAttendance.length,
    presentToday: mockStudents.length - todayAttendance.length,
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: UserX,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <MainLayout title="HostelTrack">
      <div className="container space-y-6 px-4 py-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold">Welcome Back!</h2>
          <p className="text-muted-foreground">Track attendance across 8 floors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Quick Actions</h3>
          <Button
            onClick={() => navigate('/floors')}
            className="w-full touch-target"
            size="lg"
          >
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Start Attendance
          </Button>
        </div>

        {/* Floor Grid */}
        <div className="space-y-3">
          <h3 className="font-semibold">Select Floor</h3>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((floor) => (
              <Card
                key={floor}
                className="cursor-pointer p-4 transition-smooth hover:border-primary"
                onClick={() => navigate(`/floor/${floor}`)}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">Floor {floor}</p>
                  <p className="text-sm text-muted-foreground">10 rooms</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
