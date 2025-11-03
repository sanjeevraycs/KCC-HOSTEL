import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeAttendance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime attendance subscription...');
    
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        (payload) => {
          console.log('Attendance change received:', payload);
          
          // Invalidate ALL attendance-related queries immediately
          queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
          queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          
          // Force refetch
          queryClient.refetchQueries({ queryKey: ['attendance-records'] });
          queryClient.refetchQueries({ queryKey: ['today-attendance'] });
          queryClient.refetchQueries({ queryKey: ['rooms'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}