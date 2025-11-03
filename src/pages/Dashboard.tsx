import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, ClipboardCheck, Building2, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useTodayAttendance } from '@/hooks/useAttendanceData';
import { useAllStudents } from '@/hooks/useStudents';
import { useRealtimeAttendance } from '@/hooks/useRealtimeAttendance';
import ChatBot from '@/components/ChatBot';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: todayAttendance = [] } = useTodayAttendance();
  const { data: allStudents = [] } = useAllStudents();

  useRealtimeAttendance();

  const stats = {
    totalStudents: allStudents.length,
    absentToday: todayAttendance.filter(a => a.status === 'absent').length,
    presentToday: allStudents.length - todayAttendance.filter(a => a.status === 'absent').length,
  };

  const attendanceRate = stats.totalStudents > 0 
    ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1)
    : '0';

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      description: 'Registered',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      description: 'In hostel',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: UserX,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      description: 'Away',
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      description: 'Overall',
    },
  ];

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <MainLayout title="KCC Hostel">
      <div className="flex h-screen">

        {/* LEFT SIDE MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="container space-y-8 px-4 py-6">

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{today}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome To KCC Hostel</h1>
              <p className="text-lg text-muted-foreground">Mark Attendance Daily</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={stat.title} 
                    className="relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
                    <div className="relative p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                        <div className={`rounded-2xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Start Marking Attendance</h3>
                    <p className="text-sm text-white/80">Begin today's attendance tracking</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/floors')}
                  className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Quick Floor Access</h3>
                  <p className="text-sm text-muted-foreground">Jump directly to any floor</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/floors')} className="gap-2">
                  <Building2 className="h-4 w-4" />
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((floor) => (
                  <Card
                    key={floor}
                    className="group cursor-pointer border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105"
                    onClick={() => navigate(`/floor/${floor}`)}
                  >
                    <div className="p-5 text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Floor {floor}</p>
                        <p className="text-xs text-muted-foreground">10 rooms</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary" onClick={() => navigate('/history')}>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Attendance History</h4>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">View past attendance records and analytics</p>
                </div>
              </Card>

              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary" onClick={() => navigate('/reports')}>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Reports & Analytics</h4>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Generate detailed attendance reports</p>
                </div>
              </Card>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE CHAT PANEL */}
        <ChatBot students={allStudents} />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </MainLayout>
  );
}
