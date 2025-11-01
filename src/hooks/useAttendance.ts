import { create } from 'zustand';
import { AttendanceRecord } from '@/types';

interface AttendanceState {
  records: AttendanceRecord[];
  currentDate: string;
  absentStudents: Set<string>;
  toggleStudentAttendance: (studentId: string) => void;
  submitAttendance: (roomNumber: string, floorNumber: number) => void;
  resetCurrentAttendance: () => void;
  getTodayAttendance: () => AttendanceRecord[];
}

export const useAttendance = create<AttendanceState>((set, get) => ({
  records: [],
  currentDate: new Date().toISOString().split('T')[0],
  absentStudents: new Set(),

  toggleStudentAttendance: (studentId: string) => {
    set((state) => {
      const newAbsentStudents = new Set(state.absentStudents);
      if (newAbsentStudents.has(studentId)) {
        newAbsentStudents.delete(studentId);
      } else {
        newAbsentStudents.add(studentId);
      }
      return { absentStudents: newAbsentStudents };
    });
  },

  submitAttendance: (roomNumber: string, floorNumber: number) => {
    const { absentStudents, currentDate } = get();
    const timestamp = new Date().toISOString();

    const newRecords: AttendanceRecord[] = Array.from(absentStudents).map((studentId) => ({
      id: `ATT-${Date.now()}-${studentId}`,
      studentId,
      date: currentDate,
      status: 'absent',
      markedAt: timestamp,
      markedBy: 'warden1',
      notes: `Floor ${floorNumber}, Room ${roomNumber}`,
    }));

    set((state) => ({
      records: [...state.records, ...newRecords],
      absentStudents: new Set(),
    }));
  },

  resetCurrentAttendance: () => {
    set({ absentStudents: new Set() });
  },

  getTodayAttendance: () => {
    const { records, currentDate } = get();
    return records.filter((record) => record.date === currentDate);
  },
}));
