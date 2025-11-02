import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Room {
  id: string;
  roomNumber: string;
  floorNumber: number;
  bedType: string;
  capacity: number;
  studentCount?: number;
}

export function useRooms(floorNumber?: number) {
  return useQuery({
    queryKey: ['rooms', floorNumber],
    queryFn: async () => {
      let query = supabase
        .from('rooms')
        .select('*, students(count)')
        .order('room_number');

      if (floorNumber) {
        query = query.eq('floor_number', floorNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(room => ({
        id: room.id,
        roomNumber: room.room_number,
        floorNumber: room.floor_number,
        bedType: room.bed_type,
        capacity: room.capacity,
        studentCount: Array.isArray(room.students) 
          ? room.students.length 
          : (room.students as any)?.count || 0,
      })) as Room[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
