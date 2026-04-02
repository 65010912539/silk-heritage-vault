import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, Image, Clock, CheckCircle, XCircle, Bell, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const sidebarItems = [
  { label: 'แดชบอร์ด', path: '/dashboard/admin', icon: Shield },
  { label: 'จัดการผู้ใช้', path: '/dashboard/admin/users', icon: Users },
  { label: 'จัดการผู้เชี่ยวชาญ', path: '/dashboard/admin/professors', icon: GraduationCap },
  { label: 'จัดการลายผ้า', path: '/dashboard/admin/patterns', icon: Image },
  { label: 'อนุมัติผู้เชี่ยวชาญ', path: '/dashboard/admin/approve-professors', icon: CheckCircle },
  { label: 'เพิ่ม Admin', path: '/dashboard/admin/add-admin', icon: UserPlus },
  { label: 'การแจ้งเตือน', path: '/dashboard/admin/notifications', icon: Bell },
];

const PIE_COLORS = ['hsl(45, 90%, 55%)', 'hsl(142, 71%, 45%)', 'hsl(0, 72%, 51%)'];

const Overview = () => {
  const [stats, setStats] = useState<any>({});
  const [provinceData, setProvinceData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: profiles }, { data: roles }, { data: patterns }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('*'),
        supabase.from('silk_patterns').select('*'),
      ]);

      const users = (roles || []).filter(r => r.role === 'user').length;
      const professors = (roles || []).filter(r => r.role === 'professor').length;
      const allPatterns = patterns || [];

      setStats({
        users, professors,
        totalPatterns: allPatterns.length,
        pending: allPatterns.filter(p => p.status === 'pending').length,
        approved: allPatterns.filter(p => p.status === 'approved').length,
        rejected: allPatterns.filter(p => p.status === 'rejected').length,
      });

      const provinceMap: Record<string, number> = {};
      allPatterns.forEach(p => {
        const prov = p.province || 'ไม่ระบุ';
        provinceMap[prov] = (provinceMap[prov] || 0) + 1;
      });
      setProvinceData(Object.entries(provinceMap).map(([name, count]) => ({ name, count })));

      setStatusData([
        { name: 'รอตรวจสอบ', value: allPatterns.filter(p => p.status === 'pending').length },
        { name: 'อนุมัติ', value: allPatterns.filter(p => p.status === 'approved').length },
        { name: 'ปฏิเสธ', value: allPatterns.filter(p => p.status === 'rejected').length },
      ]);
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="ผู้ใช้ทั้งหมด" value={stats.users || 0} icon={Users} color="navy" />
        <StatCard title="ผู้เชี่ยวชาญ" value={stats.professors || 0} icon={GraduationCap} color="gold" />
        <StatCard title="ลายผ้าทั้งหมด" value={stats.totalPatterns || 0} icon={Image} color="navy" />
        <StatCard title="รอตรวจสอบ" value={stats.pending || 0} icon={Clock} color="gold" />
        <StatCard title="อนุมัติแล้ว" value={stats.approved || 0} icon={CheckCircle} color="green" />
        <StatCard title="ปฏิเสธ" value={stats.rejected || 0} icon={XCircle} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {provinceData.length > 0 && (
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">จำนวนลายผ้าแยกตามจังหวัด</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={provinceData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220, 60%, 22%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {statusData.some(s => s.value > 0) && (
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">สถานะลายผ้าไหม</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'user');
    if (!roles) return;
    const userIds = roles.map(r => r.user_id);
    const { data } = await supabase.from('profiles').select('*').in('user_id', userIds).order('created_at', { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSuspend = async (userId: string, current: string) => {
    const newStatus = current === 'suspended' ? 'active' : 'suspended';
    await supabase.from('profiles').update({ status: newStatus }).eq('user_id', userId);
    toast.success(newStatus === 'suspended' ? 'ระงับบัญชีแล้ว' : 'เปิดใช้งานบัญชีแล้ว');
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('ต้องการลบผู้ใช้นี้?')) return;
    await supabase.from('profiles').delete().eq('user_id', userId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    toast.success('ลบผู้ใช้แล้ว');
    fetchUsers();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">จัดการผู้ใช้</h1>
      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-heading">ชื่อ</th>
              <th className="text-left p-3 font-heading">Username</th>
              <th className="text-left p-3 font-heading">อีเมล</th>
              <th className="text-left p-3 font-heading">สถานะ</th>
              <th className="text-left p-3 font-heading">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 text-foreground">{u.first_name} {u.last_name}</td>
                <td className="p-3 text-foreground">{u.username}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status === 'active' ? 'ใช้งาน' : 'ระงับ'}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSuspend(u.user_id, u.status)}>
                    {u.status === 'suspended' ? 'เปิดใช้งาน' : 'ระงับ'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u.user_id)}>ลบ</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-muted-foreground">ไม่มีผู้ใช้</p>}
      </div>
    </div>
  );
};

const ManageProfessors = () => {
  const [profs, setProfs] = useState<any[]>([]);

  const fetchProfs = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
    if (!roles) return;
    const ids = roles.map(r => r.user_id);
    const { data } = await supabase.from('profiles').select('*').in('user_id', ids).order('created_at', { ascending: false });
    setProfs(data || []);
  };

  useEffect(() => { fetchProfs(); }, []);

  const handleSuspend = async (userId: string, current: string) => {
    const newStatus = current === 'suspended' ? 'active' : 'suspended';
    await supabase.from('profiles').update({ status: newStatus }).eq('user_id', userId);
    toast.success(newStatus === 'suspended' ? 'ระงับบัญชีแล้ว' : 'เปิดใช้งานบัญชีแล้ว');
    fetchProfs();
  };

  const handleChangeRole = async (userId: string) => {
    await supabase.from('user_roles').update({ role: 'user' }).eq('user_id', userId);
    toast.success('เปลี่ยน role เป็นผู้ใช้แล้ว');
    fetchProfs();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('ต้องการลบผู้เชี่ยวชาญนี้?')) return;
    await supabase.from('profiles').delete().eq('user_id', userId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    toast.success('ลบแล้ว');
    fetchProfs();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">จัดการผู้เชี่ยวชาญ</h1>
      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-heading">ชื่อ</th>
              <th className="text-left p-3 font-heading">Username</th>
              <th className="text-left p-3 font-heading">อีเมล</th>
              <th className="text-left p-3 font-heading">สถานะ</th>
              <th className="text-left p-3 font-heading">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {profs.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 text-foreground">{u.first_name} {u.last_name}</td>
                <td className="p-3 text-foreground">{u.username}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : u.status === 'pending' ? 'bg-secondary/30 text-secondary-foreground' : 'bg-red-100 text-red-700'}`}>
                    {u.status === 'active' ? 'ใช้งาน' : u.status === 'pending' ? 'รออนุมัติ' : 'ระงับ'}
                  </span>
                </td>
                <td className="p-3 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleSuspend(u.user_id, u.status)}>
                    {u.status === 'suspended' ? 'เปิด' : 'ระงับ'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleChangeRole(u.user_id)}>เปลี่ยนเป็น User</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u.user_id)}>ลบ</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {profs.length === 0 && <p className="p-6 text-center text-muted-foreground">ไม่มีผู้เชี่ยวชาญ</p>}
      </div>
    </div>
  );
};

const ManagePatterns = () => {
  const [patterns, setPatterns] = useState<any[]>([]);

  const fetchPatterns = async () => {
    const { data } = await supabase.from('silk_patterns').select('*').order('created_at', { ascending: false });
    setPatterns(data || []);
  };

  useEffect(() => { fetchPatterns(); }, []);

  const handleSuspend = async (id: string, current: string) => {
    const newStatus = current === 'rejected' ? 'approved' : 'rejected';
    await supabase.from('silk_patterns').update({ status: newStatus as any }).eq('id', id);
    toast.success('อัปเดตสถานะแล้ว');
    fetchPatterns();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">จัดการลายผ้า</h1>
      <div className="bg-card rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-heading">ชื่อลาย</th>
              <th className="text-left p-3 font-heading">จังหวัด</th>
              <th className="text-left p-3 font-heading">สถานะ</th>
              <th className="text-left p-3 font-heading">วันที่</th>
              <th className="text-left p-3 font-heading">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 text-foreground">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.province || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending' ? 'bg-secondary/30 text-secondary-foreground' : 'bg-red-100 text-red-700'}`}>
                    {p.status === 'approved' ? 'อนุมัติ' : p.status === 'pending' ? 'รอตรวจ' : 'ปฏิเสธ'}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString('th-TH')}</td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => handleSuspend(p.id, p.status)}>
                    {p.status === 'rejected' ? 'คืนสถานะ' : 'ระงับ'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patterns.length === 0 && <p className="p-6 text-center text-muted-foreground">ไม่มีลายผ้า</p>}
      </div>
    </div>
  );
};

const ApproveProfessors = () => {
  const [pending, setPending] = useState<any[]>([]);

  const fetchPending = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
    if (!roles) return;
    const ids = roles.map(r => r.user_id);
    const { data } = await supabase.from('profiles').select('*').in('user_id', ids).eq('status', 'pending');
    setPending(data || []);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (userId: string, action: 'active' | 'rejected') => {
    await supabase.from('profiles').update({ status: action }).eq('user_id', userId);
    await supabase.from('notifications').insert({
      user_id: userId,
      title: action === 'active' ? 'บัญชีได้รับการอนุมัติ' : 'บัญชีถูกปฏิเสธ',
      message: action === 'active' ? 'บัญชีผู้เชี่ยวชาญของคุณได้รับการอนุมัติแล้ว สามารถเข้าสู่ระบบได้เลย' : 'บัญชีผู้เชี่ยวชาญของคุณถูกปฏิเสธ',
    });
    toast.success(action === 'active' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว');
    fetchPending();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">อนุมัติผู้เชี่ยวชาญ</h1>
      {pending.length === 0 ? (
        <p className="text-muted-foreground">ไม่มีคำขอที่รออนุมัติ</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pending.map(p => (
            <div key={p.id} className="bg-card rounded-lg shadow-card p-6 space-y-3">
              <h3 className="font-heading font-semibold text-card-foreground">{p.first_name} {p.last_name}</h3>
              <p className="text-sm text-muted-foreground">อีเมล: {p.email}</p>
              {p.experience && <p className="text-sm text-foreground"><strong>ประสบการณ์:</strong> {p.experience}</p>}
              {p.verification_image_url && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">รูปยืนยัน:</p>
                  <img src={p.verification_image_url} alt="หลักฐาน" className="w-full max-w-xs rounded-lg" />
                </div>
              )}
              {p.resume_url && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">ประวัติการทำงาน (PDF):</p>
                  <a href={p.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">ดูเอกสาร PDF</a>
                </div>
              )}
              {p.portfolio_link && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">ลิงค์ผลงาน:</p>
                  <a href={p.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">{p.portfolio_link}</a>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => handleAction(p.user_id, 'active')} className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">อนุมัติ</Button>
                <Button variant="destructive" onClick={() => handleAction(p.user_id, 'rejected')}>ปฏิเสธ</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddAdmin = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', rePassword: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.rePassword) { toast.error('รหัสผ่านไม่ตรงกัน'); return; }
    if (form.password.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('ไม่พบ session');

      const res = await supabase.functions.invoke('create-admin', {
        body: { username: form.username, email: form.email, password: form.password },
      });

      if (res.error) throw new Error(res.error.message || 'เกิดข้อผิดพลาด');
      if (res.data?.error) throw new Error(res.data.error);

      toast.success('เพิ่ม Admin สำเร็จ!');
      setForm({ username: '', password: '', rePassword: '', email: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">เพิ่ม Admin</h1>
      <div className="bg-card rounded-lg shadow-card p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Username</Label><Input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>อีเมล</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>รหัสผ่าน</Label><Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>ยืนยันรหัสผ่าน</Label><Input type="password" required value={form.rePassword} onChange={e => setForm({ ...form, rePassword: e.target.value })} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'กำลังเพิ่ม...' : 'เพิ่ม Admin'}</Button>
        </form>
      </div>
    </div>
  );
};

const AdminNotifications = () => {
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

const AdminDashboard = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">กำลังโหลด...</div>;
  if (!user || role !== 'admin') return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={sidebarItems} title="Admin Dashboard" />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="professors" element={<ManageProfessors />} />
          <Route path="patterns" element={<ManagePatterns />} />
          <Route path="approve-professors" element={<ApproveProfessors />} />
          <Route path="add-admin" element={<AddAdmin />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
