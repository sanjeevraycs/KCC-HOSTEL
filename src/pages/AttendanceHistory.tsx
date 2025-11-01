import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useAttendanceRecords } from '@/hooks/useAttendanceData';
import { useAllStudents } from '@/hooks/useStudents';
import { format } from 'date-fns';
import { CalendarIcon, Search, User, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students } = useAllStudents();
  const { data: records } = useAttendanceRecords(
    format(selectedDate, 'yyyy-MM-dd'),
    format(selectedDate, 'yyyy-MM-dd')
  );

  const studentMap = new Map(students?.map(s => [s.id, s]) ?? []);

  const filteredRecords = records?.filter(record => {
    const student = studentMap.get(record.studentId);
    if (!student) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.rollNumber.toLowerCase().includes(searchLower) ||
      student.roomNumber.includes(searchLower)
    );
  });

  return (
    <MainLayout title="Attendance History">
      <div className="container space-y-6 px-4 py-6">
        {/* Date Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll number, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Summary */}
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{students?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-accent">
                {(students?.length ?? 0) - (records?.length ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-warning">{records?.length ?? 0}</p>
            </div>
          </div>
        </Card>

        {/* Absent Students List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Absent Students ({filteredRecords?.length ?? 0})</h3>
          
          {filteredRecords && filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const student = studentMap.get(record.studentId);
              if (!student) return null;

              return (
                <Card key={record.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-warning/10 p-2">
                        <User className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Floor {student.floorNumber}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Bed className="h-4 w-4" />
                        <span>{student.roomNumber}</span>
                      </div>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {records ? 'All students present on this date!' : 'Loading attendance data...'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
