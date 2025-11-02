-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_date ON public.attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_students_room ON public.students(room_id);
CREATE INDEX IF NOT EXISTS idx_students_floor_room ON public.students(floor_number, room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON public.rooms(floor_number);

-- Enable realtime for attendance_records table
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;