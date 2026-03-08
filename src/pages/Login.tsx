import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, AlertCircle, ShieldCheck, BookOpen, ArrowLeft } from 'lucide-react';

type SelectedRole = 'admin' | 'student' | null;

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ExamSeat</h1>
        </div>

        {/* Step 1: Role selection */}
        {!selectedRole ? (
          <Card className="shadow-lg border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Choose your role to sign in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole('admin')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                  </div>
                  <span className="font-semibold">Admin</span>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight">Manage exams & seats</span>
                </button>

                <button
                  onClick={() => setSelectedRole('student')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <span className="font-semibold">Student</span>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight">View your seating</span>
                </button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-5">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>

        /* Step 2: Login form */
        ) : (
          <Card className="shadow-lg border-border/50 animate-in fade-in-0 slide-in-from-right-4 duration-300">
            <CardHeader className="text-center relative">
              <button
                onClick={() => { setSelectedRole(null); setError(''); }}
                className="absolute left-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex justify-center mb-2">
                <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                  selectedRole === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {selectedRole === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                </span>
              </div>
              <CardTitle className="text-xl">Sign in as {selectedRole}</CardTitle>
              <CardDescription>Enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;