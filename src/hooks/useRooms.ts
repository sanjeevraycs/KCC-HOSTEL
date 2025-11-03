import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Room {
  id: string;
  roomNumber: string;
  floorNumber: number;
  bedType: string;
  capacity: number;
  studentCount?: number;
  presentCount?: number;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useRooms(floorNumber?: number) {
  return useQuery({
    queryKey: ['rooms', floorNumber],
    queryFn: async () => {
      console.log('🏠 Fetching rooms for floor:', floorNumber);
      
      // Get rooms
      let roomQuery = supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (floorNumber) {
        roomQuery = roomQuery.eq('floor_number', floorNumber);
      }

      const { data: rooms, error: roomError } = await roomQuery;
      if (roomError) throw roomError;

      console.log('✅ Found', rooms?.length, 'rooms');

      // Get all students
      let studentQuery = supabase
        .from('students')
        .select('id, room_number, floor_number');

      if (floorNumber) {
        studentQuery = studentQuery.eq('floor_number', floorNumber);
      }

      const { data: students, error: studentError } = await studentQuery;
      if (studentError) throw studentError;

      console.log('✅ Found', students?.length, 'students');

      // Get today's absent students
      const today = getTodayDate();
      console.log('📅 Checking attendance for date:', today);
      
      const { data: absentRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('student_id, room_number, floor_number')
        .eq('date', today)
        .eq('status', 'absent');

      if (attendanceError) throw attendanceError;

      console.log('📊 Found', absentRecords?.length, 'absent records for today');
      console.log('Absent records:', absentRecords);

      const absentStudentIds = new Set((absentRecords || []).map(r => r.student_id));
      console.log('Absent student IDs:', Array.from(absentStudentIds));

      // Count students per room
      const roomStudentCounts = new Map<string, { total: number; present: number }>();
      
      (students || []).forEach(student => {
        const key = `${student.floor_number}-${student.room_number}`;
        if (!roomStudentCounts.has(key)) {
          roomStudentCounts.set(key, { total: 0, present: 0 });
        }
        const counts = roomStudentCounts.get(key)!;
        counts.total++;
        // Count as present if NOT in absent list
        if (!absentStudentIds.has(student.id)) {
          counts.present++;
        }
      });

      console.log('Room counts:', Object.fromEntries(roomStudentCounts));

      const mappedRooms = (rooms || []).map(room => {
        const key = `${room.floor_number}-${room.room_number}`;
        const counts = roomStudentCounts.get(key) || { total: 0, present: 0 };
        
        console.log(`Room ${room.room_number}:`, counts);
        
        return {
          id: room.id,
          roomNumber: room.room_number,
          floorNumber: room.floor_number,
          bedType: room.bed_type,
          capacity: room.capacity,
          studentCount: counts.total,
          presentCount: counts.present,
        };
      }) as Room[];

      console.log('✅ Mapped rooms:', mappedRooms);
      
      return mappedRooms;
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

export function useFloors() {
  return useQuery({
    queryKey: ['floors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .order('floor_number');

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}