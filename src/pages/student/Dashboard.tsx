import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, GraduationCap, LogOut, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Allocation {
  id: string;
  seat_number: string;
  exams: { name: string; subject: string; exam_date: string; start_time: string; end_time: string } | null;
  exam_halls: { name: string; building: string | null; floor: string | null } | null;
  students: { roll_number: string; department: string } | null;
}

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState('');
  const [myAllocations, setMyAllocations] = useState<Allocation[]>([]);
  const [allAllocations, setAllAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);

  // Load all allocations on mount
  useEffect(() => {
    const loadAll = async () => {
      const { data } = await supabase
        .from('seating_allocations')
        .select('*, exams(name, subject, exam_date, start_time, end_time), exam_halls(name, building, floor), students(roll_number, department)')
        .order('created_at', { ascending: false });
      setAllAllocations((data as any) ?? []);
      setLoadingAll(false);
    };
    loadAll();
  }, []);

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
      setMyAllocations([]);
      setLoading(false);
      toast.error('No student found with this register number');
      return;
    }

    const { data } = await supabase
      .from('seating_allocations')
      .select('*, exams(name, subject, exam_date, start_time, end_time), exam_halls(name, building, floor), students(roll_number, department)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    setMyAllocations((data as any) ?? []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const AllocationTable = ({ data, showStudent = false, emptyMessage }: { data: Allocation[]; showStudent?: boolean; emptyMessage: string }) => (
    <Table>
      <TableHeader>
        <TableRow>
          {showStudent && <TableHead>Register No.</TableHead>}
          {showStudent && <TableHead>Department</TableHead>}
          <TableHead>Exam</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Hall</TableHead>
          <TableHead>Seat</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(a => (
          <TableRow key={a.id}>
            {showStudent && <TableCell className="font-medium">{a.students?.roll_number ?? '-'}</TableCell>}
            {showStudent && <TableCell>{a.students?.department ?? '-'}</TableCell>}
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
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={showStudent ? 8 : 6} className="text-center text-muted-foreground py-8">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ExamSeat</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Tabs defaultValue="my-seat">
          <TabsList>
            <TabsTrigger value="my-seat" className="gap-2">
              <Search className="h-4 w-4" /> Find My Seat
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Grid3X3 className="h-4 w-4" /> All Seating Allocations
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Search my seat */}
          <TabsContent value="my-seat" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Your Seat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter your register number (e.g. CS2023001)"
                      value={rollNumber}
                      onChange={e => setRollNumber(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchSeating()}
                      className="text-base"
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
                  <AllocationTable data={myAllocations} emptyMessage="No seating allocations found for this register number" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 2: All allocations (read-only) */}
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Seating Allocations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingAll ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <AllocationTable data={allAllocations} showStudent emptyMessage="No seating allocations have been made yet" />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
