import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord } from '@/types';
import { toast } from 'sonner';

// Get today's date in YYYY-MM-DD format in local timezone
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useAttendanceRecords(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance-records', startDate, endDate],
    queryFn: async () => {
      console.log('📊 Fetching attendance records:', { startDate, endDate });
      
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

      if (error) {
        console.error('❌ Error fetching attendance records:', error);
        throw error;
      }
      
      console.log('✅ Fetched', data?.length, 'attendance records');
      console.log('Raw records:', data);
      
      // Map database fields to TypeScript types
      const mapped = (data || []).map(record => ({
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
      
      console.log('Mapped records:', mapped);
      console.log('Absent records:', mapped.filter(r => r.status === 'absent').length);
      
      return mapped;
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

      const date = getTodayDate();

      console.log('🔄 Submitting attendance:', {
        date,
        roomNumber,
        floorNumber,
        absentCount: absentStudentIds.length,
        absentIds: absentStudentIds
      });

      console.log('🗑️ Deleting existing records for this room...');
      
      const { error: deleteError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('date', date)
        .eq('room_number', roomNumber)
        .eq('floor_number', floorNumber);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Deleted existing records');

      if (absentStudentIds.length > 0) {
        console.log('➕ Inserting', absentStudentIds.length, 'absent records...');
        
        const records = absentStudentIds.map((studentId) => ({
          student_id: studentId,
          date,
          status: 'absent',
          marked_by: userData.user.id,
          room_number: roomNumber,
          floor_number: floorNumber,
          notes: notes || null,
        }));

        const { error: insertError, data: insertedData } = await supabase
          .from('attendance_records')
          .insert(records)
          .select();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw insertError;
        }

        console.log('✅ Inserted', insertedData?.length, 'records');
      } else {
        console.log('ℹ️ No absent students - all present');
      }

      return { success: true, date };
    },
    onSuccess: async (data) => {
      console.log('🔄 Invalidating queries...');
      
      await queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      await queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      await queryClient.refetchQueries({ queryKey: ['attendance-records'] });
      await queryClient.refetchQueries({ queryKey: ['today-attendance'] });
      await queryClient.refetchQueries({ queryKey: ['rooms'] });
      
      console.log('✅ Queries refreshed');
      toast.success('Attendance submitted successfully!');
    },
    onError: (error: Error) => {
      console.error('❌ Submission error:', error);
      toast.error(`Failed to submit: ${error.message}`);
    },
  });
}

export function useTodayAttendance() {
  const today = getTodayDate();
  
  return useQuery({
    queryKey: ['today-attendance', today],
    queryFn: async () => {
      console.log('📊 Fetching today\'s attendance for date:', today);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today);

      if (error) {
        console.error('❌ Error fetching today\'s attendance:', error);
        throw error;
      }
      
      console.log('✅ Found', data?.length, 'records for today');
      console.log('Today\'s raw data:', data);
      
      const mapped = (data || []).map(record => ({
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
      
      console.log('Today\'s mapped data:', mapped);
      
      return mapped;
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}