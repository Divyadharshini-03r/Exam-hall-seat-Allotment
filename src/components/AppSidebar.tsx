import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Building2, FileText, Users, Grid3X3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { role, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/halls', icon: Building2, label: 'Exam Halls' },
    { to: '/exams', icon: FileText, label: 'Exams' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/allocations', icon: Grid3X3, label: 'Allocations' },
  ];

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-seating', icon: Grid3X3, label: 'My Seating' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sidebar-foreground font-bold text-lg tracking-tight">ExamSeat</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => {
          const active = location.pathname === link.to;
          return (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          <p className="text-xs text-sidebar-primary font-medium capitalize">{role}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
