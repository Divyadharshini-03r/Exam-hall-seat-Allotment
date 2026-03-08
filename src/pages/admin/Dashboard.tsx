import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Building2, FileText, Users, Grid3X3 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ halls: 0, exams: 0, students: 0, allocations: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [halls, exams, students, allocations] = await Promise.all([
        supabase.from('exam_halls').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('seating_allocations').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        halls: halls.count ?? 0,
        exams: exams.count ?? 0,
        students: students.count ?? 0,
        allocations: allocations.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Exam Halls', value: stats.halls, icon: Building2, color: 'text-primary' },
    { title: 'Exams', value: stats.exams, icon: FileText, color: 'text-secondary' },
    { title: 'Students', value: stats.students, icon: Users, color: 'text-accent' },
    { title: 'Allocations', value: stats.allocations, icon: Grid3X3, color: 'text-success' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
