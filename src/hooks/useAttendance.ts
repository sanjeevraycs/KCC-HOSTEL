import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useMarkAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      status: 'present' | 'absent';
      date: string;
      notes?: string;
      floorNumber?: number;
      roomNumber?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('attendance_records')
        .insert({
          student_id: data.studentId,
          status: data.status,
          date: data.date,
          marked_by: user.id,
          notes: data.notes,
          floor_number: data.floorNumber,
          room_number: data.roomNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // IMPORTANT: Refresh all attendance-related data
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });
}