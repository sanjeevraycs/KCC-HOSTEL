import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types';

export function useStudents(floorNumber?: number, roomNumber?: string) {
  return useQuery({
    queryKey: ['students', floorNumber, roomNumber],
    queryFn: async () => {
      let query = supabase.from('students').select('*');

      if (floorNumber) {
        query = query.eq('floor_number', floorNumber);
      }
      if (roomNumber) {
        query = query.eq('room_number', roomNumber);
      }

      const { data, error } = await query.order('bed_number');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      // Map database records to Student type
      return (data || []).map(student => ({
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        photo: student.photo_url || undefined,
        roomNumber: student.room_number || '',
        floorNumber: student.floor_number || 0,
        bedNumber: student.bed_number || 0,
      })) as Student[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - shorter stale time for student data
  });
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('floor_number', { ascending: true })
        .order('room_number', { ascending: true })
        .order('bed_number', { ascending: true });

      if (error) {
        console.error('Error fetching all students:', error);
        throw error;
      }

      // Map database records to Student type
      return (data || []).map(student => ({
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        photo: student.photo_url || undefined,
        roomNumber: student.room_number || '',
        floorNumber: student.floor_number || 0,
        bedNumber: student.bed_number || 0,
      })) as Student[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook to get student count by room
export function useStudentCountByRoom(floorNumber?: number) {
  return useQuery({
    queryKey: ['student-count-by-room', floorNumber],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('room_number, floor_number, id');

      if (floorNumber) {
        query = query.eq('floor_number', floorNumber);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching student counts:', error);
        throw error;
      }

      // Group by room
      const counts: Record<string, number> = {};
      (data || []).forEach(student => {
        const key = `${student.floor_number}-${student.room_number}`;
        counts[key] = (counts[key] || 0) + 1;
      });

      return counts;
    },
    staleTime: 1 * 60 * 1000,
  });
}