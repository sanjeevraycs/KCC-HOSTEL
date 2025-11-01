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

      if (error) throw error;
      return data as unknown as Student[];
    },
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
        .order('room_number', { ascending: true });

      if (error) throw error;
      return data as unknown as Student[];
    },
  });
}
