import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, Image, Clock, CheckCircle, XCircle, Bell, UserPlus, Shield, Flag, ArrowLeft, AlertTriangle, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const sidebarItems = [
  { label: 'แดชบอร์ด', path: '/dashboard/admin', icon: Shield },
  { label: 'จัดการผู้ใช้', path: '/dashboard/admin/users', icon: Users },
  { label: 'จัดการผู้เชี่ยวชาญ', path: '/dashboard/admin/professors', icon: GraduationCap },
  { label: 'จัดการลายผ้า', path: '/dashboard/admin/patterns', icon: Image },
  { label: 'ลายผ้าที่ถูกรายงาน', path: '/dashboard/admin/reported', icon: Flag },
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
      const [{ data: roles }, { data: patterns }] = await Promise.all([
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
      allPatterns.forEach(p => { const prov = p.province || 'ไม่ระบุ'; provinceMap[prov] = (provinceMap[prov] || 0) + 1; });
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
    <div className="animate-fade-in">
      <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        <StatCard title="ผู้ใช้ทั้งหมด" value={stats.users || 0} icon={Users} color="navy" />
        <StatCard title="ผู้เชี่ยวชาญ" value={stats.professors || 0} icon={GraduationCap} color="gold" />
        <StatCard title="ลายผ้าทั้งหมด" value={stats.totalPatterns || 0} icon={Image} color="navy" />
        <StatCard title="รอตรวจสอบ" value={stats.pending || 0} icon={Clock} color="gold" />
        <StatCard title="อนุมัติแล้ว" value={stats.approved || 0} icon={CheckCircle} color="green" />
        <StatCard title="ปฏิเสธ" value={stats.rejected || 0} icon={XCircle} color="red" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {provinceData.length > 0 && (
          <div className="bg-card p-6 rounded-xl shadow-card">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">จำนวนลายผ้าแยกตามจังหวัด</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={provinceData}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="count" fill="hsl(220, 60%, 22%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {statusData.some(s => s.value > 0) && (
          <div className="bg-card p-6 rounded-xl shadow-card">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">สถานะลายผ้าไหม</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const fetchUsers = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'user');
    if (!roles) return;
    const { data } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id)).order('created_at', { ascending: false });
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
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">จัดการผู้ใช้</h1>
      </div>
      <div className="bg-card rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted"><tr><th className="text-left p-3 font-heading">ชื่อ</th><th className="text-left p-3 font-heading">Username</th><th className="text-left p-3 font-heading hidden sm:table-cell">อีเมล</th><th className="text-left p-3 font-heading">สถานะ</th><th className="text-left p-3 font-heading">จัดการ</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-3 text-foreground">{u.first_name} {u.last_name}</td>
                <td className="p-3 text-foreground">{u.username}</td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{u.status === 'active' ? 'ใช้งาน' : 'ระงับ'}</span></td>
                <td className="p-3"><div className="flex gap-2 flex-wrap"><Button size="sm" variant="outline" onClick={() => handleSuspend(u.user_id, u.status)}>{u.status === 'suspended' ? 'เปิดใช้งาน' : 'ระงับ'}</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(u.user_id)}>ลบ</Button></div></td>
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
  const navigate = useNavigate();
  const [profs, setProfs] = useState<any[]>([]);
  const fetchProfs = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
    if (!roles) return;
    const { data } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id)).order('created_at', { ascending: false });
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
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">จัดการผู้เชี่ยวชาญ</h1>
      </div>
      <div className="bg-card rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted"><tr><th className="text-left p-3 font-heading">ชื่อ</th><th className="text-left p-3 font-heading">Username</th><th className="text-left p-3 font-heading hidden sm:table-cell">อีเมล</th><th className="text-left p-3 font-heading">สถานะ</th><th className="text-left p-3 font-heading">จัดการ</th></tr></thead>
          <tbody>
            {profs.map(u => (
              <tr key={u.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-3 text-foreground">{u.first_name} {u.last_name}</td>
                <td className="p-3 text-foreground">{u.username}</td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : u.status === 'pending' ? 'bg-secondary/30 text-secondary-foreground' : 'bg-red-100 text-red-700'}`}>{u.status === 'active' ? 'ใช้งาน' : u.status === 'pending' ? 'รออนุมัติ' : 'ระงับ'}</span></td>
                <td className="p-3"><div className="flex gap-2 flex-wrap"><Button size="sm" variant="outline" onClick={() => handleSuspend(u.user_id, u.status)}>{u.status === 'suspended' ? 'เปิด' : 'ระงับ'}</Button><Button size="sm" variant="outline" onClick={() => handleChangeRole(u.user_id)}>เปลี่ยนเป็น User</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(u.user_id)}>ลบ</Button></div></td>
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
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<any[]>([]);
  const fetchPatterns = async () => {
    const { data } = await supabase.from('silk_patterns').select('*').order('created_at', { ascending: false });
    setPatterns(data || []);
  };
  useEffect(() => { fetchPatterns(); }, []);
  const handleSuspend = async (id: string, current: string) => {
    if (current === 'suspended') {
      await supabase.from('silk_patterns').update({ status: 'approved' as any }).eq('id', id);
    } else {
      await supabase.from('silk_patterns').update({ status: 'suspended' as any }).eq('id', id);
    }
    toast.success('อัปเดตสถานะแล้ว');
    fetchPatterns();
  };

  const statusLabel = (s: string) => {
    if (s === 'approved') return 'อนุมัติ';
    if (s === 'pending') return 'รอตรวจ';
    if (s === 'suspended') return 'ระงับ';
    return 'ปฏิเสธ';
  };
  const statusClass = (s: string) => {
    if (s === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (s === 'pending') return 'bg-secondary/30 text-secondary-foreground';
    if (s === 'suspended') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">จัดการลายผ้า</h1>
      </div>
      <div className="bg-card rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted"><tr><th className="text-left p-3 font-heading">ชื่อลาย</th><th className="text-left p-3 font-heading">จังหวัด</th><th className="text-left p-3 font-heading">สถานะ</th><th className="text-left p-3 font-heading">วันที่</th><th className="text-left p-3 font-heading">จัดการ</th></tr></thead>
          <tbody>
            {patterns.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="p-3 text-foreground">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.province || '-'}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(p.status)}`}>{statusLabel(p.status)}</span></td>
                <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString('th-TH')}</td>
                <td className="p-3"><Button size="sm" variant="outline" onClick={() => handleSuspend(p.id, p.status)}>{p.status === 'suspended' ? 'คืนสถานะ' : 'ระงับ'}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {patterns.length === 0 && <p className="p-6 text-center text-muted-foreground">ไม่มีลายผ้า</p>}
      </div>
    </div>
  );
};

const ReportedPatterns = () => {
  const navigate = useNavigate();
  const [reportedPatterns, setReportedPatterns] = useState<any[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [patternDetail, setPatternDetail] = useState<any>(null);
  const [uploader, setUploader] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);

  const fetchReported = async () => {
    const { data: allReports } = await supabase.from('pattern_reports').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (!allReports?.length) { setReportedPatterns([]); return; }
    const patternIds = [...new Set(allReports.map(r => r.pattern_id))];
    const { data: patterns } = await supabase.from('silk_patterns').select('*').in('id', patternIds);
    const grouped = patternIds.map(pid => ({
      pattern: (patterns || []).find(p => p.id === pid),
      reportCount: allReports.filter(r => r.pattern_id === pid).length,
      patternId: pid,
    })).filter(g => g.pattern);
    setReportedPatterns(grouped);
  };

  useEffect(() => { fetchReported(); }, []);

  const selectPattern = async (item: any) => {
    setSelectedPattern(item);
    setAdminResponse('');
    setPatternDetail(item.pattern);

    const { data: reps } = await supabase.from('pattern_reports').select('*').eq('pattern_id', item.patternId).eq('status', 'pending').order('created_at', { ascending: true });
    
    // Fetch reporter profiles and roles
    const enriched = await Promise.all((reps || []).map(async (r: any) => {
      const [{ data: profile }, { data: role }] = await Promise.all([
        supabase.from('profiles').select('username, first_name, last_name').eq('user_id', r.reporter_id).single(),
        supabase.from('user_roles').select('role').eq('user_id', r.reporter_id).single(),
      ]);
      return { ...r, profile, role: role?.role };
    }));
    setReports(enriched);

    if (item.pattern.user_id) {
      const { data } = await supabase.from('profiles').select('first_name, last_name').eq('user_id', item.pattern.user_id).single();
      setUploader(data);
    }
    if (item.pattern.reviewer_id) {
      const { data } = await supabase.from('profiles').select('first_name, last_name').eq('user_id', item.pattern.reviewer_id).single();
      setReviewer(data);
    }
  };

  const handleAction = async (action: 'suspend' | 'valid') => {
    if (!selectedPattern || !adminResponse.trim()) {
      toast.error('กรุณากรอกผลการตรวจสอบ');
      return;
    }
    setLoading(true);

    // Update all reports for this pattern
    await supabase.from('pattern_reports').update({ status: 'reviewed', admin_response: adminResponse }).eq('pattern_id', selectedPattern.patternId);

    if (action === 'suspend') {
      await supabase.from('silk_patterns').update({ status: 'suspended' as any }).eq('id', selectedPattern.patternId);
    }

    // Notify all reporters
    const reporterIds = [...new Set(reports.map(r => r.reporter_id))];
    const notifs = reporterIds.map(uid => ({
      user_id: uid,
      title: action === 'suspend' ? `ลายผ้า "${patternDetail.name}" ได้ถูกระงับแล้ว` : `ลายผ้า "${patternDetail.name}" ได้รับการตรวจสอบว่าถูกต้อง`,
      message: action === 'suspend'
        ? `ลายผ้า "${patternDetail.name}" ได้ถูกระงับแล้ว ขอบคุณสำหรับการรายงาน`
        : `ลายผ้า "${patternDetail.name}" ได้รับการตรวจสอบว่าถูกต้องแล้ว ขอบคุณสำหรับการรายงาน`,
    }));
    await supabase.from('notifications').insert(notifs);

    toast.success(action === 'suspend' ? 'ระงับลายผ้าแล้ว' : 'ยืนยันลายผ้าถูกต้องแล้ว');
    setSelectedPattern(null);
    fetchReported();
    setLoading(false);
  };

  if (selectedPattern && patternDetail) {
    const roleLabel = (r: string) => r === 'professor' ? 'ผู้เชี่ยวชาญ' : r === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้งาน';
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={() => setSelectedPattern(null)} className="mb-4 gap-2"><ArrowLeft size={16} /> กลับ</Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">รายละเอียดลายผ้าที่ถูกรายงาน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {patternDetail.images?.[0] && <img src={patternDetail.images[0]} alt={patternDetail.name} className="w-full rounded-xl shadow-card aspect-[4/3] object-cover mb-4" />}
            <div className="bg-card p-5 rounded-xl shadow-card space-y-3">
              <h2 className="font-heading text-lg font-bold text-card-foreground">{patternDetail.name}</h2>
              {patternDetail.province && <p className="flex items-center gap-2 text-sm"><MapPin size={16} className="text-secondary" /> {patternDetail.province}</p>}
              <p className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-secondary" /> วันที่อัปโหลด: {new Date(patternDetail.created_at).toLocaleDateString('th-TH')}</p>
              {uploader && <p className="flex items-center gap-2 text-sm"><User size={16} className="text-secondary" /> อัปโหลดโดย: {uploader.first_name} {uploader.last_name}</p>}
              {reviewer && <p className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-emerald-600" /> ตรวจสอบโดย: {reviewer.first_name} {reviewer.last_name}</p>}
              {patternDetail.reviewed_at && <p className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-emerald-600" /> วันที่อนุมัติ: {new Date(patternDetail.reviewed_at).toLocaleDateString('th-TH')}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card p-5 rounded-xl shadow-card">
              <h3 className="font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-destructive" /> สาเหตุการรายงาน ({reports.length} รายการ)</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {reports.map((r, i) => (
                  <div key={r.id} className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{r.profile?.username || 'ไม่ทราบ'}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/15 text-secondary">{roleLabel(r.role || 'user')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('th-TH')}</span>
                    </div>
                    <p className="text-sm text-foreground">{r.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card">
              <Label className="font-heading font-semibold">แจ้งผลการตรวจสอบ</Label>
              <Textarea value={adminResponse} onChange={e => setAdminResponse(e.target.value)} rows={4} placeholder="กรอกผลการตรวจสอบ..." className="mt-2" />
              <div className="flex gap-3 mt-4">
                <Button onClick={() => handleAction('suspend')} disabled={loading} variant="destructive" className="flex-1">
                  <XCircle size={16} /> ระงับลายผ้า
                </Button>
                <Button onClick={() => handleAction('valid')} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
                  <CheckCircle size={16} /> ลายผ้านี้ถูกต้อง
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">ลายผ้าที่ถูกรายงาน</h1>
      </div>
      {reportedPatterns.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-8 text-center">
          <Flag size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">ไม่มีลายผ้าที่ถูกรายงาน</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportedPatterns.map(item => (
            <div key={item.patternId} className="bg-card rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-elevated transition-all hover:-translate-y-1" onClick={() => selectPattern(item)}>
              <div className="aspect-[4/3] bg-muted">{item.pattern.images?.[0] && <img src={item.pattern.images[0]} alt={item.pattern.name} className="w-full h-full object-cover" />}</div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-card-foreground">{item.pattern.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">{item.pattern.province || 'ไม่ระบุ'}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive"><Flag size={12} /> {item.reportCount} รายงาน</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ApproveProfessors = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState<any[]>([]);
  const fetchPending = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
    if (!roles) return;
    const { data } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id)).eq('status', 'pending');
    setPending(data || []);
  };
  useEffect(() => { fetchPending(); }, []);
  const handleAction = async (userId: string, action: 'active' | 'rejected') => {
    await supabase.from('profiles').update({ status: action }).eq('user_id', userId);
    await supabase.from('notifications').insert({ user_id: userId, title: action === 'active' ? 'บัญชีได้รับการอนุมัติ' : 'บัญชีถูกปฏิเสธ', message: action === 'active' ? 'บัญชีผู้เชี่ยวชาญของคุณได้รับการอนุมัติแล้ว' : 'บัญชีผู้เชี่ยวชาญของคุณถูกปฏิเสธ' });
    toast.success(action === 'active' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว');
    fetchPending();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">อนุมัติผู้เชี่ยวชาญ</h1>
      </div>
      {pending.length === 0 ? <p className="text-muted-foreground">ไม่มีคำขอที่รออนุมัติ</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pending.map(p => (
            <div key={p.id} className="bg-card rounded-xl shadow-card p-6 space-y-3">
              <h3 className="font-heading font-semibold text-card-foreground">{p.first_name} {p.last_name}</h3>
              <p className="text-sm text-muted-foreground">อีเมล: {p.email}</p>
              {p.experience && <p className="text-sm text-foreground"><strong>ประสบการณ์:</strong> {p.experience}</p>}
              {p.verification_image_url && <div><p className="text-sm font-medium text-foreground mb-1">รูปยืนยัน:</p><img src={p.verification_image_url} alt="หลักฐาน" className="w-full max-w-xs rounded-lg" /></div>}
              {p.resume_url && <div><p className="text-sm font-medium text-foreground mb-1">ประวัติการทำงาน (PDF):</p><a href={p.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">ดูเอกสาร PDF</a></div>}
              {p.portfolio_link && <div><p className="text-sm font-medium text-foreground mb-1">ลิงค์ผลงาน:</p><a href={p.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">{p.portfolio_link}</a></div>}
              <div className="flex gap-3"><Button onClick={() => handleAction(p.user_id, 'active')} className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">อนุมัติ</Button><Button variant="destructive" onClick={() => handleAction(p.user_id, 'rejected')}>ปฏิเสธ</Button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', rePassword: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.rePassword) { toast.error('รหัสผ่านไม่ตรงกัน'); return; }
    if (form.password.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setLoading(true);
    try {
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
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">เพิ่ม Admin</h1>
      </div>
      <div className="bg-card rounded-xl shadow-card p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Username</Label><Input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="mt-1" /></div>
          <div><Label>อีเมล</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
          <div><Label>รหัสผ่าน</Label><Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1" /></div>
          <div><Label>ยืนยันรหัสผ่าน</Label><Input type="password" required value={form.rePassword} onChange={e => setForm({ ...form, rePassword: e.target.value })} className="mt-1" /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'กำลังเพิ่ม...' : 'เพิ่ม Admin'}</Button>
        </form>
      </div>
    </div>
  );
};

const AdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []));
  }, [user]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/admin')} className="shrink-0"><ArrowLeft size={18} /></Button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">การแจ้งเตือน</h1>
      </div>
      {notifications.length === 0 ? <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p> : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-card p-4 rounded-xl shadow-card transition-all hover:shadow-elevated ${!n.is_read ? 'border-l-4 border-secondary' : ''}`}>
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
      <main className="flex-1 p-4 pt-18 md:pt-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="professors" element={<ManageProfessors />} />
          <Route path="patterns" element={<ManagePatterns />} />
          <Route path="reported" element={<ReportedPatterns />} />
          <Route path="approve-professors" element={<ApproveProfessors />} />
          <Route path="add-admin" element={<AddAdmin />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
