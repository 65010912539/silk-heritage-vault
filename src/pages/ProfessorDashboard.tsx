import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardCheck, CheckCircle, XCircle, Image, Bell, User, Clock, ListChecks, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Calendar } from 'lucide-react';
import ProfessorGuide from '@/pages/ProfessorGuide';

const sidebarItems = [
  { label: 'แดชบอร์ด', path: '/dashboard/professor', icon: ClipboardCheck },
  { label: 'รอตรวจสอบ', path: '/dashboard/professor/pending', icon: Clock },
  { label: 'ตรวจแล้ว', path: '/dashboard/professor/reviewed', icon: ListChecks },
  { label: 'การแจ้งเตือน', path: '/dashboard/professor/notifications', icon: Bell },
  { label: 'โปรไฟล์', path: '/dashboard/professor/profile', icon: User },
  { label: 'คู่มือการใช้งาน', path: '/dashboard/professor/guide', icon: BookOpen },
];

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, myApproved: 0, myRejected: 0, myTotal: 0 });
  const [pendingPatterns, setPendingPatterns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [{ data: allPatterns }, { data: myPatterns }] = await Promise.all([
        supabase.from('silk_patterns').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('silk_patterns').select('*').eq('reviewer_id', user.id),
      ]);
      const pending = allPatterns || [];
      const mine = myPatterns || [];
      setStats({
        pending: pending.length,
        myApproved: mine.filter(p => p.status === 'approved').length,
        myRejected: mine.filter(p => p.status === 'rejected').length,
        myTotal: mine.length,
      });
      setPendingPatterns(pending.slice(0, 6));
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">แดชบอร์ดผู้เชี่ยวชาญ</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="รอตรวจสอบ" value={stats.pending} icon={Clock} color="gold" />
        <StatCard title="ฉันอนุมัติแล้ว" value={stats.myApproved} icon={CheckCircle} color="green" />
        <StatCard title="ฉันปฏิเสธ" value={stats.myRejected} icon={XCircle} color="red" />
        <StatCard title="ฉันตรวจทั้งหมด" value={stats.myTotal} icon={Image} color="navy" />
      </div>

      {pendingPatterns.length > 0 && (
        <>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">ลายที่รอตรวจสอบ</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPatterns.map(p => (
              <div key={p.id} className="bg-card rounded-lg shadow-card overflow-hidden cursor-pointer hover:shadow-elevated transition-all" onClick={() => navigate(`/dashboard/professor/review/${p.id}`)}>
                <div className="aspect-[4/3] bg-muted">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-card-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.province || 'ไม่ระบุจังหวัด'}</p>
                  <Button size="sm" className="mt-2 w-full">ตรวจสอบ</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ReviewPattern = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [uploader, setUploader] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('silk_patterns').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      .then(({ data }) => setPatterns(data || []));
  }, []);

  const selectPattern = async (p: any) => {
    setSelected(p);
    setReviewNotes('');
    const { data } = await supabase.from('profiles').select('first_name, last_name').eq('user_id', p.user_id).single();
    setUploader(data);
  };

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selected || !user) return;
    setLoading(true);
    await supabase.from('silk_patterns').update({
      status: action,
      reviewer_id: user.id,
      reviewer_notes: reviewNotes,
      reviewed_at: new Date().toISOString(),
    }).eq('id', selected.id);

    // Notify the uploader
    await supabase.from('notifications').insert({
      user_id: selected.user_id,
      title: action === 'approved' ? 'ลายผ้าได้รับการอนุมัติ' : 'ลายผ้าไม่ผ่านการตรวจสอบ',
      message: action === 'approved'
        ? `ลาย "${selected.name}" ได้รับการอนุมัติแล้ว`
        : `ลาย "${selected.name}" ไม่ผ่านการตรวจสอบ${reviewNotes ? ': ' + reviewNotes : ''}`,
    });

    // Notify all admins
    const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
    if (adminRoles && adminRoles.length > 0) {
      const adminNotifs = adminRoles.map(r => ({
        user_id: r.user_id,
        title: action === 'approved' ? 'ผู้เชี่ยวชาญอนุมัติลายผ้า' : 'ผู้เชี่ยวชาญปฏิเสธลายผ้า',
        message: `ลาย "${selected.name}" ถูก${action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โดยผู้เชี่ยวชาญ`,
      }));
      await supabase.from('notifications').insert(adminNotifs);
    }

    toast.success(action === 'approved' ? 'อนุมัติลายผ้าแล้ว' : 'ปฏิเสธลายผ้าแล้ว');
    setSelected(null);
    setPatterns(prev => prev.filter(p => p.id !== selected.id));
    setLoading(false);
  };

  if (selected) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4">← กลับ</Button>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">ตรวจสอบลายผ้า</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {selected.images?.map((img: string, i: number) => (
              <img key={i} src={img} alt={selected.name} className="w-full rounded-lg shadow-card" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg shadow-card space-y-3">
              <h2 className="font-heading text-xl font-bold text-card-foreground">{selected.name}</h2>
              {selected.province && <p className="flex items-center gap-2 text-foreground"><MapPin size={16} className="text-secondary" /> {selected.province}</p>}
              <p className="flex items-center gap-2 text-foreground"><Calendar size={16} className="text-secondary" /> {new Date(selected.created_at).toLocaleDateString('th-TH')}</p>
              {uploader && <p className="flex items-center gap-2 text-foreground"><User size={16} className="text-secondary" /> {uploader.first_name} {uploader.last_name}</p>}
              {selected.notes && <div><Label className="text-muted-foreground">คำอธิบาย</Label><p className="text-sm text-foreground">{selected.notes}</p></div>}
            </div>
            <div>
              <Label>รายละเอียดจากผู้เชี่ยวชาญ</Label>
              <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} placeholder="กรอกรายละเอียด (ถ้ามี)" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleAction('approved')} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
                <CheckCircle size={18} /> อนุมัติ
              </Button>
              <Button onClick={() => handleAction('rejected')} disabled={loading} variant="destructive" className="flex-1">
                <XCircle size={18} /> ปฏิเสธ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">รอตรวจสอบ</h1>
      {patterns.length === 0 ? (
        <p className="text-muted-foreground">ไม่มีลายผ้าที่รอตรวจสอบ</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map(p => (
            <div key={p.id} className="bg-card rounded-lg shadow-card overflow-hidden cursor-pointer hover:shadow-elevated transition-all" onClick={() => selectPattern(p)}>
              <div className="aspect-[4/3] bg-muted">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-card-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.province || 'ไม่ระบุจังหวัด'}</p>
                <Button size="sm" className="mt-2 w-full">ตรวจสอบ</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewedPatterns = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('silk_patterns').select('*').eq('reviewer_id', user.id).order('reviewed_at', { ascending: false })
      .then(({ data }) => setPatterns(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">ตรวจแล้ว</h1>
      {patterns.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีลายผ้าที่ตรวจแล้ว</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map(p => (
            <div key={p.id} className="bg-card rounded-lg shadow-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-card-foreground">{p.name}</h3>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {p.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">การแจ้งเตือน</h1>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-card p-4 rounded-lg shadow-card ${!n.is_read ? 'border-l-4 border-secondary' : ''}`}>
              <h3 className="font-heading font-semibold text-card-foreground">{n.title}</h3>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('th-TH')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfProfile = () => {
  const { profile, refreshProfile } = useAuth();
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ bio }).eq('user_id', profile.user_id);
    await refreshProfile();
    toast.success('บันทึกโปรไฟล์สำเร็จ');
    setSaving(false);
  };

  if (!profile) return null;
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">โปรไฟล์</h1>
      <div className="bg-card rounded-lg shadow-card p-6 max-w-xl space-y-4">
        <div><Label className="text-muted-foreground">ชื่อ</Label><p className="font-medium text-foreground">{profile.first_name} {profile.last_name}</p></div>
        <div><Label className="text-muted-foreground">ชื่อผู้ใช้</Label><p className="font-medium text-foreground">{profile.username}</p></div>
        <div><Label className="text-muted-foreground">อีเมล</Label><p className="font-medium text-foreground">{profile.email}</p></div>
        <div><Label>คำอธิบายตัวเอง</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} /></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
      </div>
    </div>
  );
};

const ProfessorDashboard = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">กำลังโหลด...</div>;
  if (!user || role !== 'professor') return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={sidebarItems} title="Professor Dashboard" />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="pending" element={<ReviewPattern />} />
          <Route path="review/:id" element={<ReviewPattern />} />
          <Route path="reviewed" element={<ReviewedPatterns />} />
          <Route path="notifications" element={<ProfNotifications />} />
          <Route path="profile" element={<ProfProfile />} />
          <Route path="guide" element={<ProfessorGuide />} />
        </Routes>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
