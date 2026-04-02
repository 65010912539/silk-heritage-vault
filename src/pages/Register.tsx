import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '', rePassword: '', email: '', role: 'user' as 'user' | 'professor',
    experience: '', portfolioLink: '',
  });
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const passwordValid = form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวอักษรและตัวเลข'); return; }
    if (form.password !== form.rePassword) { toast.error('รหัสผ่านไม่ตรงกัน'); return; }
    if (form.role === 'professor' && !form.experience) { toast.error('กรุณากรอกประสบการณ์'); return; }

    setLoading(true);
    try {
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', form.username).maybeSingle();
      if (existing) { toast.error('ชื่อผู้ใช้นี้ถูกใช้แล้ว'); setLoading(false); return; }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('ไม่สามารถสร้างบัญชีได้');

      const userId = authData.user.id;

      // Upload verification image if professor
      let verificationUrl = '';
      if (form.role === 'professor' && verificationFile) {
        const ext = verificationFile.name.split('.').pop();
        const path = `${userId}/verification.${ext}`;
        const { error: uploadError } = await supabase.storage.from('verification-images').upload(path, verificationFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('verification-images').getPublicUrl(path);
        verificationUrl = urlData.publicUrl;
      }

      // Upload resume PDF if professor
      let resumeUrl = '';
      if (form.role === 'professor' && resumeFile) {
        const path = `${userId}/resume.pdf`;
        const { error: uploadError } = await supabase.storage.from('resume-documents').upload(path, resumeFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('resume-documents').getPublicUrl(path);
        resumeUrl = urlData.publicUrl;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: userId,
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.username,
        email: form.email,
        experience: form.experience,
        verification_image_url: verificationUrl,
        resume_url: resumeUrl,
        portfolio_link: form.portfolioLink,
        status: form.role === 'professor' ? 'pending' : 'active',
      });
      if (profileError) throw profileError;

      // Create role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: form.role,
      });
      if (roleError) throw roleError;

      // Create welcome notification
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'ยินดีต้อนรับ',
        message: form.role === 'professor'
          ? 'ยินดีต้อนรับสู่ ThaiSilk! บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ'
          : 'ยินดีต้อนรับสู่ ThaiSilk! คุณสามารถเริ่มอัปโหลดลายผ้าได้เลย',
      });

      // Notify all admins about new registration
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (adminRoles && adminRoles.length > 0) {
        const adminNotifs = adminRoles.map(r => ({
          user_id: r.user_id,
          title: form.role === 'professor' ? 'มีผู้สมัครผู้เชี่ยวชาญใหม่' : 'มีผู้สมัครสมาชิกใหม่',
          message: `${form.firstName} ${form.lastName} (${form.username}) ได้สมัคร${form.role === 'professor' ? 'ผู้เชี่ยวชาญ' : 'สมาชิก'}เข้ามาในระบบ`,
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }

      if (form.role === 'professor') {
        await supabase.auth.signOut();
        toast.success('สมัครสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ');
        navigate('/login');
      } else {
        toast.success('สมัครสมาชิกสำเร็จ!');
        navigate('/dashboard/user');
      }
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
        <div className="bg-card rounded-lg shadow-elevated p-8 w-full max-w-lg">
          <h1 className="font-heading text-2xl font-bold text-center text-foreground mb-6">สมัครสมาชิก</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ชื่อจริง</Label>
                <Input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label>นามสกุล</Label>
                <Input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>ชื่อผู้ใช้ (Username)</Label>
              <Input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>

            <div>
              <Label>อีเมล</Label>
              <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <Label>รหัสผ่าน (8 ตัวขึ้นไป ต้องมีตัวอักษรและตัวเลข)</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && !passwordValid && (
                <p className="text-xs text-destructive mt-1">ต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวอักษรและตัวเลข</p>
              )}
            </div>

            <div>
              <Label>ยืนยันรหัสผ่าน</Label>
              <Input type="password" required value={form.rePassword} onChange={e => setForm({ ...form, rePassword: e.target.value })} />
              {form.rePassword && form.password !== form.rePassword && (
                <p className="text-xs text-destructive mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>

            <div>
              <Label>เลือกประเภทบัญชี</Label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'user' })}
                  className={`flex-1 py-3 rounded-lg border-2 font-heading font-semibold transition-colors ${
                    form.role === 'user' ? 'border-secondary bg-secondary/10 text-secondary-foreground' : 'border-border text-muted-foreground hover:border-secondary/50'
                  }`}
                >
                  ผู้ใช้งาน
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'professor' })}
                  className={`flex-1 py-3 rounded-lg border-2 font-heading font-semibold transition-colors ${
                    form.role === 'professor' ? 'border-secondary bg-secondary/10 text-secondary-foreground' : 'border-border text-muted-foreground hover:border-secondary/50'
                  }`}
                >
                  ผู้เชี่ยวชาญ
                </button>
              </div>
            </div>

            {form.role === 'professor' && (
              <>
                <div>
                  <Label>ประสบการณ์เกี่ยวกับผ้าไหม / ผลงานวิจัย</Label>
                  <Textarea required value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>อัปโหลดรูปเพื่อยืนยัน</Label>
                  <Input type="file" accept="image/*" onChange={e => setVerificationFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>ประวัติการทำงาน (PDF เท่านั้น)</Label>
                  <Input type="file" accept=".pdf,application/pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>ลิงค์ผลงาน</Label>
                  <Input type="url" placeholder="https://..." value={form.portfolioLink} onChange={e => setForm({ ...form, portfolioLink: e.target.value })} />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            มีบัญชีอยู่แล้ว? <Link to="/login" className="text-secondary font-medium hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
