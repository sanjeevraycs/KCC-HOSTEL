-- Safe Migration: Only creates what's missing
-- This won't fail if policies/tables already exist

-- Step 1: Ensure all floors exist (safe - uses ON CONFLICT)
INSERT INTO public.floors (floor_number, total_rooms)
VALUES (1, 10), (2, 10), (3, 10), (4, 10), (5, 10), (6, 10), (7, 10), (8, 10)
ON CONFLICT (floor_number) DO NOTHING;

-- Step 2: Create all rooms if they don't exist (safe - uses ON CONFLICT)
DO $$
DECLARE
  floor_rec RECORD;
  room_num INTEGER;
  room_number_str TEXT;
  bed_type_val TEXT;
  capacity_val INTEGER;
BEGIN
  -- Loop through all floors
  FOR floor_rec IN SELECT id, floor_number FROM public.floors LOOP
    -- Create 10 rooms for each floor
    FOR room_num IN 1..10 LOOP
      -- Generate room number (e.g., 101, 102, ..., 810)
      room_number_str := floor_rec.floor_number || LPAD(room_num::TEXT, 2, '0');
      
      -- Determine bed type and capacity
      IF room_num % 3 = 0 THEN
        bed_type_val := 'triple';
        capacity_val := 3;
      ELSE
        bed_type_val := 'double';
        capacity_val := 2;
      END IF;
      
      -- Insert room if it doesn't exist
      INSERT INTO public.rooms (room_number, floor_id, floor_number, bed_type, capacity)
      VALUES (room_number_str, floor_rec.id, floor_rec.floor_number, bed_type_val, capacity_val)
      ON CONFLICT (room_number, floor_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Update existing students to link them with rooms
UPDATE public.students s
SET room_id = r.id
FROM public.rooms r
WHERE s.room_number = r.room_number
  AND s.floor_number = r.floor_number
  AND s.room_id IS NULL;

-- Step 4: Create trigger function (DROP IF EXISTS makes it safe)
CREATE OR REPLACE FUNCTION public.update_student_room_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If room_number and floor_number are provided, find and set room_id
  IF NEW.room_number IS NOT NULL AND NEW.floor_number IS NOT NULL THEN
    SELECT id INTO NEW.room_id
    FROM public.rooms
    WHERE room_number = NEW.room_number
      AND floor_number = NEW.floor_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger (DROP IF EXISTS makes it safe)
DROP TRIGGER IF EXISTS update_student_room_id_trigger ON public.students;
CREATE TRIGGER update_student_room_id_trigger
  BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_room_id();

-- Step 6: Create helpful view (OR REPLACE makes it safe)
CREATE OR REPLACE VIEW public.student_allocation_summary AS
SELECT 
  f.floor_number,
  r.room_number,
  r.capacity,
  COUNT(s.id) as occupied,
  r.capacity - COUNT(s.id) as available
FROM public.floors f
JOIN public.rooms r ON f.id = r.floor_id
LEFT JOIN public.students s ON r.id = s.room_id
GROUP BY f.floor_number, r.room_number, r.capacity
ORDER BY f.floor_number, r.room_number;

-- Step 7: Show results
SELECT 
  'Floors Created' as item,
  COUNT(*)::text as count
FROM public.floors
UNION ALL
SELECT 
  'Rooms Created' as item,
  COUNT(*)::text as count
FROM public.rooms
UNION ALL
SELECT 
  'Total Students' as item,
  COUNT(*)::text as count
FROM public.students
UNION ALL
SELECT 
  'Students Linked to Rooms' as item,
  COUNT(*)::text as count
FROM public.students
WHERE room_id IS NOT NULL
UNION ALL
SELECT 
  'Students NOT Linked' as item,
  COUNT(*)::text as count
FROM public.students
WHERE room_id IS NULL;