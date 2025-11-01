import * as XLSX from 'xlsx';
import { AttendanceRecord, Student } from '@/types';
import { format } from 'date-fns';

export interface AttendanceReportData {
  date: string;
  studentName: string;
  rollNumber: string;
  floor: number;
  room: string;
  status: string;
  markedAt: string;
}

export function generateAttendanceReport(
  records: AttendanceRecord[],
  students: Student[],
  reportType: 'daily' | 'weekly' | 'monthly',
  startDate?: Date,
  endDate?: Date
): void {
  // Map student IDs to student details
  const studentMap = new Map(students.map(s => [s.id, s]));

  // Prepare report data
  const reportData: AttendanceReportData[] = records
    .map(record => {
      const student = studentMap.get(record.studentId);
      if (!student) return null;

      return {
        date: record.date,
        studentName: student.name,
        rollNumber: student.rollNumber,
        floor: student.floorNumber,
        room: student.roomNumber,
        status: record.status.toUpperCase(),
        markedAt: format(new Date(record.markedAt), 'dd/MM/yyyy HH:mm'),
      };
    })
    .filter((item): item is AttendanceReportData => item !== null);

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(reportData, {
    header: ['date', 'studentName', 'rollNumber', 'floor', 'room', 'status', 'markedAt'],
  });

  // Set column headers
  XLSX.utils.sheet_add_aoa(ws, [
    ['Date', 'Student Name', 'Roll Number', 'Floor', 'Room', 'Status', 'Marked At']
  ], { origin: 'A1' });

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 25 }, // Student Name
    { wch: 15 }, // Roll Number
    { wch: 8 },  // Floor
    { wch: 10 }, // Room
    { wch: 10 }, // Status
    { wch: 18 }, // Marked At
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

  // Generate filename
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `HostelTrack_${reportType}_${dateStr}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
}

export function generateDailySummary(
  records: AttendanceRecord[],
  students: Student[],
  date: Date
): void {
  const dateStr = format(date, 'yyyy-MM-dd');
  const absentRecords = records.filter(r => r.date === dateStr && r.status === 'absent');
  
  const studentMap = new Map(students.map(s => [s.id, s]));
  
  // Summary data
  const summaryData = [
    { metric: 'Total Students', value: students.length },
    { metric: 'Present', value: students.length - absentRecords.length },
    { metric: 'Absent', value: absentRecords.length },
    { metric: 'Attendance %', value: `${((students.length - absentRecords.length) / students.length * 100).toFixed(2)}%` },
  ];

  // Absent students data
  const absentData = absentRecords
    .map(record => {
      const student = studentMap.get(record.studentId);
      if (!student) return null;
      return {
        rollNumber: student.rollNumber,
        name: student.name,
        floor: student.floorNumber,
        room: student.roomNumber,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Absent students sheet
  if (absentData.length > 0) {
    const absentWs = XLSX.utils.json_to_sheet(absentData);
    XLSX.utils.book_append_sheet(wb, absentWs, 'Absent Students');
  }

  const filename = `Daily_Summary_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
