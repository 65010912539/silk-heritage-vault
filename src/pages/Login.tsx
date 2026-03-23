import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect when authenticated user with role is detected
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === 'admin') navigate('/dashboard/admin', { replace: true });
      else if (role === 'professor') navigate('/dashboard/professor', { replace: true });
      else navigate('/dashboard/user', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Look up email by username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, status, user_id')
        .eq('username', username)
        .maybeSingle();

      if (!profile) {
        toast.error('ไม่พบชื่อผู้ใช้นี้');
        setLoading(false);
        return;
      }

      // Check suspension
      if (profile.status === 'suspended') {
        toast.error('บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      // Check pending professor
      if (profile.status === 'pending') {
        toast.error('บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      if (profile.status === 'rejected') {
        toast.error('บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      // Sign in with email
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (authError) {
        toast.error('รหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      // Get role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .single();

      const role = roleData?.role;
      toast.success('เข้าสู่ระบบสำเร็จ!');

      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'professor') navigate('/dashboard/professor');
      else navigate('/dashboard/user');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-muted">
        <div className="bg-card rounded-lg shadow-elevated p-8 w-full max-w-md">
          <h1 className="font-heading text-2xl font-bold text-center text-foreground mb-6">เข้าสู่ระบบ</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>ชื่อผู้ใช้ (Username)</Label>
              <Input required value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
              <Label>รหัสผ่าน</Label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ยังไม่มีบัญชี? <Link to="/register" className="text-secondary font-medium hover:underline">สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
