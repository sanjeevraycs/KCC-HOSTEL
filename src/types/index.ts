export type BedType = 'single' | 'double' | 'triple';

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  photo?: string;
  roomNumber: string;
  floorNumber: number;
  bedNumber: number;
}

export interface Room {
  roomNumber: string;
  floorNumber: number;
  bedType: BedType;
  capacity: number;
  students: Student[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  markedAt: string;
  markedBy: string;
  notes?: string;
  roomNumber?: string;
  floorNumber?: number;
}

export interface Floor {
  floorNumber: number;
  totalRooms: number;
  totalStudents: number;
  completedRooms: number;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  completionPercentage: number;
}
