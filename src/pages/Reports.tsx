import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAttendanceRecords } from '@/hooks/useAttendanceData';
import { useAllStudents } from '@/hooks/useStudents';
import { generateAttendanceReport, generateDailySummary } from '@/utils/excelExport';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Reports() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: students } = useAllStudents();
  const { data: records } = useAttendanceRecords(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  );

  const handleGenerateReport = () => {
    if (!students || !records) {
      toast.error('Loading data, please wait...');
      return;
    }

    try {
      generateAttendanceReport(records, students, reportType, startDate, endDate);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleGenerateDailySummary = () => {
    if (!students || !records) {
      toast.error('Loading data, please wait...');
      return;
    }

    try {
      generateDailySummary(records, students, startDate);
      toast.success('Daily summary generated successfully!');
    } catch (error) {
      toast.error('Failed to generate daily summary');
    }
  };

  return (
    <MainLayout title="Reports">
      <div className="container space-y-6 px-4 py-6">
        <div>
          <h2 className="text-xl font-bold">Generate Reports</h2>
          <p className="text-sm text-muted-foreground">Download attendance reports in Excel format</p>
        </div>

        {/* Report Configuration */}
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGenerateReport} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Generate {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </Button>

            <Button onClick={handleGenerateDailySummary} variant="outline" className="w-full" size="lg">
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Generate Daily Summary
            </Button>
          </div>
        </Card>

        {/* Stats Preview */}
        {records && students && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Report Preview</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Records</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Range</p>
                <p className="text-sm font-medium">
                  {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
