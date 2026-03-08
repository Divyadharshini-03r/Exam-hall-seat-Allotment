import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Trash2, Plus, Pencil, Check, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Exam { id: string; name: string; subject: string; }
interface Hall { id: string; name: string; capacity: number; }
interface Student { id: string; roll_number: string; department: string; }
interface Allocation {
  id: string;
  seat_number: string;
  exam_id: string;
  hall_id: string;
  student_id: string;
  exams: { name: string } | null;
  exam_halls: { name: string } | null;
  students: { roll_number: string } | null;
}

const Allocations = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [allocating, setAllocating] = useState(false);

  // Manual allocation
  const [manualRoll, setManualRoll] = useState('');
  const [manualSeat, setManualSeat] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSeat, setEditSeat] = useState('');
  const [editHall, setEditHall] = useState('');

  // Search
  const [searchRoll, setSearchRoll] = useState('');

  useEffect(() => {
    const load = async () => {
      const [e, h, s] = await Promise.all([
        supabase.from('exams').select('id, name, subject'),
        supabase.from('exam_halls').select('id, name, capacity'),
        supabase.from('students').select('id, roll_number, department'),
      ]);
      setExams(e.data ?? []);
      setHalls(h.data ?? []);
      setStudents(s.data ?? []);
    };
    load();
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    const { data } = await supabase
      .from('seating_allocations')
      .select('*, exams(name), exam_halls(name), students(roll_number)')
      .order('seat_number');
    setAllocations((data as any) ?? []);
  };

  const autoAllocate = async () => {
    if (!selectedExam || !selectedHall) {
      toast.error('Select an exam and hall');
      return;
    }
    setAllocating(true);

    const hall = halls.find(h => h.id === selectedHall);
    if (!hall) { setAllocating(false); return; }

    const { data: existing } = await supabase
      .from('seating_allocations')
      .select('student_id')
      .eq('exam_id', selectedExam);

    const allocatedIds = new Set((existing ?? []).map(a => a.student_id));
    const unallocated = students.filter(s => !allocatedIds.has(s.id));

    if (unallocated.length === 0) {
      toast.info('All students already allocated');
      setAllocating(false);
      return;
    }

    const { data: existingSeats } = await supabase
      .from('seating_allocations')
      .select('seat_number')
      .eq('exam_id', selectedExam)
      .eq('hall_id', selectedHall);

    const usedSeats = (existingSeats ?? []).map(s => parseInt(s.seat_number));
    const maxSeat = usedSeats.length > 0 ? Math.max(...usedSeats) : 0;
    const slotsAvailable = hall.capacity - usedSeats.length;
    const toAllocate = unallocated.slice(0, slotsAvailable);

    if (toAllocate.length === 0) {
      toast.error('Hall is full');
      setAllocating(false);
      return;
    }

    const rows = toAllocate.map((student, i) => ({
      exam_id: selectedExam,
      hall_id: selectedHall,
      student_id: student.id,
      seat_number: String(maxSeat + i + 1),
    }));

    const { error } = await supabase.from('seating_allocations').insert(rows);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Allocated ${rows.length} seats`);
      fetchAllocations();
    }
    setAllocating(false);
  };

  const manualAllocate = async () => {
    if (!selectedExam || !selectedHall || !manualRoll || !manualSeat) {
      toast.error('Fill in exam, hall, register number, and seat number');
      return;
    }
    const student = students.find(s => s.roll_number.toLowerCase() === manualRoll.toLowerCase());
    if (!student) {
      toast.error('Student with this register number not found');
      return;
    }

    const { error } = await supabase.from('seating_allocations').insert({
      exam_id: selectedExam,
      hall_id: selectedHall,
      student_id: student.id,
      seat_number: manualSeat,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Seat ${manualSeat} allocated to ${manualRoll}`);
      setManualRoll('');
      setManualSeat('');
      fetchAllocations();
    }
  };

  const startEdit = (a: Allocation) => {
    setEditingId(a.id);
    setEditSeat(a.seat_number);
    setEditHall(a.hall_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSeat('');
    setEditHall('');
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from('seating_allocations').update({
      seat_number: editSeat,
      hall_id: editHall,
    }).eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Allocation updated');
      cancelEdit();
      fetchAllocations();
    }
  };

  const deleteAllocation = async (id: string) => {
    const { error } = await supabase.from('seating_allocations').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Allocation deleted');
    fetchAllocations();
  };

  const clearAllocations = async () => {
    if (!selectedExam) return;
    const { error } = await supabase.from('seating_allocations').delete().eq('exam_id', selectedExam);
    if (error) { toast.error(error.message); return; }
    toast.success('Allocations cleared');
    fetchAllocations();
  };

  const filtered = allocations.filter(a => {
    const matchExam = selectedExam ? a.exam_id === selectedExam : true;
    const matchSearch = searchRoll
      ? a.students?.roll_number?.toLowerCase().includes(searchRoll.toLowerCase())
      : true;
    return matchExam && matchSearch;
  });

  return (
    <DashboardLayout title="Seating Allocations">
      {/* Auto / Manual Allocation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Allocate Seats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} - {e.subject}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hall</Label>
              <Select value={selectedHall} onValueChange={setSelectedHall}>
                <SelectTrigger><SelectValue placeholder="Select hall" /></SelectTrigger>
                <SelectContent>
                  {halls.map(h => <SelectItem key={h.id} value={h.id}>{h.name} (Cap: {h.capacity})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Manual allocation by register number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-t pt-4">
            <div className="space-y-2">
              <Label>Register Number</Label>
              <Input placeholder="e.g. CS2023001" value={manualRoll} onChange={e => setManualRoll(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Seat Number</Label>
              <Input placeholder="e.g. 1" value={manualSeat} onChange={e => setManualSeat(e.target.value)} />
            </div>
            <Button onClick={manualAllocate} disabled={!selectedExam || !selectedHall}>
              <Plus className="h-4 w-4 mr-2" />Assign Seat
            </Button>
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button onClick={autoAllocate} disabled={allocating || !selectedExam || !selectedHall}>
              <Wand2 className="h-4 w-4 mr-2" />{allocating ? 'Allocating...' : 'Auto Allocate All'}
            </Button>
            <Button variant="destructive" onClick={clearAllocations} disabled={!selectedExam}>
              <Trash2 className="h-4 w-4 mr-2" />Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Allocation List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by register number..."
                className="pl-9"
                value={searchRoll}
                onChange={e => setSearchRoll(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seat #</TableHead>
                <TableHead>Register No.</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Hall</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-bold">
                    {editingId === a.id ? (
                      <Input className="w-20" value={editSeat} onChange={e => setEditSeat(e.target.value)} />
                    ) : a.seat_number}
                  </TableCell>
                  <TableCell>{a.students?.roll_number ?? '-'}</TableCell>
                  <TableCell>{a.exams?.name ?? '-'}</TableCell>
                  <TableCell>
                    {editingId === a.id ? (
                      <Select value={editHall} onValueChange={setEditHall}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {halls.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : a.exam_halls?.name ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === a.id ? (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => saveEdit(a.id)}><Check className="h-4 w-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(a)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteAllocation(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No allocations found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Allocations;
