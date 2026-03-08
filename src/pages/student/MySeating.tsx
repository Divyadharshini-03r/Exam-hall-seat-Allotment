import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface Allocation {
  id: string;
  seat_number: string;
  exams: { name: string; subject: string; exam_date: string; start_time: string; end_time: string } | null;
  exam_halls: { name: string; building: string | null; floor: string | null } | null;
}

const MySeating = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchSeating = async () => {
    if (!rollNumber.trim()) {
      toast.error('Enter your register number');
      return;
    }
    setLoading(true);
    setSearched(true);

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('roll_number', rollNumber.trim())
      .maybeSingle();

    if (!student) {
      setAllocations([]);
      setLoading(false);
      toast.error('No student found with this register number');
      return;
    }

    const { data } = await supabase
      .from('seating_allocations')
      .select('*, exams(name, subject, exam_date, start_time, end_time), exam_halls(name, building, floor)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    setAllocations((data as any) ?? []);
    setLoading(false);
  };

  return (
    <DashboardLayout title="My Seating">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search Your Seat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Enter your register number (e.g. CS2023001)"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchSeating()}
              />
            </div>
            <Button onClick={searchSeating} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />{loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hall</TableHead>
                  <TableHead>Seat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.exams?.name ?? '-'}</TableCell>
                    <TableCell>{a.exams?.subject ?? '-'}</TableCell>
                    <TableCell>{a.exams?.exam_date ?? '-'}</TableCell>
                    <TableCell>{a.exams?.start_time} - {a.exams?.end_time}</TableCell>
                    <TableCell>
                      {a.exam_halls?.name}
                      {a.exam_halls?.building && <span className="text-muted-foreground text-xs ml-1">({a.exam_halls.building})</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold">{a.seat_number}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && allocations.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No seating allocations found for this register number</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default MySeating;
