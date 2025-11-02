import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord } from '@/types';
import { toast } from 'sonner';

export function useAttendanceRecords(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance-records', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database fields to TypeScript types
      return (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id,
        date: record.date,
        status: record.status as 'present' | 'absent',
        markedAt: record.marked_at,
        markedBy: record.marked_by,
        notes: record.notes || undefined,
        roomNumber: record.room_number || undefined,
        floorNumber: record.floor_number || undefined,
      })) as AttendanceRecord[];
    },
  });
}

export function useSubmitAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      absentStudentIds,
      roomNumber,
      floorNumber,
      notes,
    }: {
      absentStudentIds: string[];
      roomNumber: string;
      floorNumber: number;
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const date = new Date().toISOString().split('T')[0];

      const records = absentStudentIds.map((studentId) => ({
        student_id: studentId,
        date,
        status: 'absent',
        marked_by: userData.user.id,
        room_number: roomNumber,
        floor_number: floorNumber,
        notes,
      }));

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(records, {
          onConflict: 'student_id,date',
        });

      if (error) throw error;
      return data;
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['today-attendance'] });
      
      const previousData = queryClient.getQueryData(['today-attendance']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['today-attendance'], (old: any) => {
        const date = new Date().toISOString().split('T')[0];
        const newRecords = variables.absentStudentIds.map((studentId) => ({
          id: `temp-${studentId}`,
          studentId,
          date,
          status: 'absent' as const,
          markedAt: new Date().toISOString(),
          markedBy: 'current-user',
          notes: variables.notes,
          roomNumber: variables.roomNumber,
          floorNumber: variables.floorNumber,
        }));
        return [...(old || []), ...newRecords];
      });

      return { previousData };
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['today-attendance'], context.previousData);
      }
      toast.error(`Failed to submit attendance: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
      toast.success('Attendance submitted successfully!');
    },
  });
}

export function useTodayAttendance() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-attendance', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today);

      if (error) throw error;
      
      // Map database fields to TypeScript types
      return (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id,
        date: record.date,
        status: record.status as 'present' | 'absent',
        markedAt: record.marked_at,
        markedBy: record.marked_by,
        notes: record.notes || undefined,
        roomNumber: record.room_number || undefined,
        floorNumber: record.floor_number || undefined,
      })) as AttendanceRecord[];
    },
  });
}
