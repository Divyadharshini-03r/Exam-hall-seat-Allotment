
-- Drop the restrictive student SELECT policy on seating_allocations
DROP POLICY IF EXISTS "Students can view own allocations" ON public.seating_allocations;

-- Allow all authenticated users to view all allocations (read-only)
CREATE POLICY "Authenticated users can view all allocations"
ON public.seating_allocations
FOR SELECT
TO authenticated
USING (true);

-- Also allow students to view all students (needed for showing roll numbers in allocations)
DROP POLICY IF EXISTS "Students can view own record" ON public.students;

CREATE POLICY "Authenticated users can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (true);
