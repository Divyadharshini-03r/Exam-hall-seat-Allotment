import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Users, Building2, ClipboardList } from 'lucide-react';
import examHallBg from '@/assets/exam-hall-bg.jpg';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${examHallBg})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ExamSeat</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex items-center px-6 lg:px-12">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Smart Exam Seating,{' '}
                <span className="text-primary">Simplified</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-lg leading-relaxed">
                Automate exam hall allocation, manage students effortlessly, and eliminate seating conflicts — all in one platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                <Building2 className="h-4 w-4 text-primary" />
                Hall Management
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Student Allocation
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                <ClipboardList className="h-4 w-4 text-primary" />
                Exam Scheduling
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 lg:px-12 py-6">
          <p className="text-white/40 text-sm">© 2026 ExamSeat. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
