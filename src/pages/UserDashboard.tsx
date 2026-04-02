import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import PatternCard from '@/components/PatternCard';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image, CheckCircle, XCircle, Bell, User, FolderOpen, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISAN_PROVINCES } from '@/lib/provinces';
import { toast } from 'sonner';
import UserGuide from '@/pages/UserGuide';

const sidebarItems = [
  { label: 'แดชบอร์ด', path: '/dashboard/user', icon: FolderOpen },
  { label: 'อัปโหลดลาย', path: '/dashboard/user/upload', icon: Upload },
  { label: 'ลายของฉัน', path: '/dashboard/user/my-patterns', icon: Image },
  { label: 'การแจ้งเตือน', path: '/dashboard/user/notifications', icon: Bell },
  { label: 'โปรไฟล์', path: '/dashboard/user/profile', icon: User },
  { label: 'คู่มือการใช้งาน', path: '/dashboard/user/guide', icon: BookOpen },
];

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentPatterns, setRecentPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('silk_patterns').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const patterns = data || [];
      setRecentPatterns(patterns.slice(0, 6));
      setStats({
        total: patterns.length,
        pending: patterns.filter(p => p.status === 'pending').length,
        approved: patterns.filter(p => p.status === 'approved').length,
        rejected: patterns.filter(p => p.status === 'rejected').length,
      });
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">แดชบอร์ดผู้ใช้</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="อัปโหลดทั้งหมด" value={stats.total} icon={Upload} color="navy" />
        <StatCard title="รอตรวจสอบ" value={stats.pending} icon={Image} color="gold" />
        <StatCard title="ผ่านแล้ว" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard title="ไม่ผ่าน" value={stats.rejected} icon={XCircle} color="red" />
      </div>
      {recentPatterns.length > 0 && (
        <>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">ลายผ้าล่าสุด</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPatterns.map(p => <PatternCard key={p.id} {...p} linkPrefix="/dashboard/user/my-patterns" />)}
          </div>
        </>
      )}
    </div>
  );
};

const UploadPattern = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;
    const newFilesArr = Array.from(newFiles);
    setSelectedFiles(prev => [...prev, ...newFilesArr]);
    const newPreviews = newFilesArr.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
    // Reset input so same file can be added again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedFiles.length === 0) { toast.error('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป'); return; }

    setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from('silk-images').upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from('silk-images').getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from('silk_patterns').insert({
        user_id: user.id,
        name,
        province: province || null,
        notes: notes || null,
        images: imageUrls,
      });
      if (error) throw error;

      // Notify all professors
      const { data: profRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
      if (profRoles && profRoles.length > 0) {
        const notifications = profRoles.map(r => ({
          user_id: r.user_id,
          title: 'มีลายผ้าใหม่รอตรวจสอบ',
          message: `ผู้ใช้ได้อัปโหลดลาย "${name}" เข้ามาในระบบ กรุณาเข้าตรวจสอบ`,
        }));
        await supabase.from('notifications').insert(notifications);
      }

      // Notify all admins
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (adminRoles && adminRoles.length > 0) {
        const adminNotifs = adminRoles.map(r => ({
          user_id: r.user_id,
          title: 'มีการอัปโหลดลายผ้าใหม่',
          message: `ผู้ใช้ได้อัปโหลดลาย "${name}" เข้ามาในระบบ`,
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }

      toast.success('อัปโหลดลายผ้าสำเร็จ!');
      setName(''); setProvince(''); setNotes(''); setSelectedFiles([]); setPreviews([]);
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">อัปโหลดลายผ้า</h1>
      <div className="bg-card rounded-lg shadow-card p-6 max-w-xl">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label>รูปภาพลายผ้า (เลือกได้หลายรูป)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`preview ${i}`} className="w-full aspect-square object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">เลือกแล้ว {selectedFiles.length} รูป</p>
            )}
          </div>
          <div>
            <Label>ชื่อลาย</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>จังหวัด (ถ้าทราบ)</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger><SelectValue placeholder="เลือกจังหวัด" /></SelectTrigger>
              <SelectContent>
                {ISAN_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>หมายเหตุ</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลดลายผ้า'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const MyPatterns = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('silk_patterns').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setPatterns(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">ลายของฉัน</h1>
      {patterns.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีลายผ้าที่อัปโหลด</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map(p => <PatternCard key={p.id} {...p} linkPrefix="/pattern" />)}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
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

const Profile = () => {
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
        <div>
          <Label className="text-muted-foreground">ชื่อ</Label>
          <p className="font-medium text-foreground">{profile.first_name} {profile.last_name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">ชื่อผู้ใช้</Label>
          <p className="font-medium text-foreground">{profile.username}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">อีเมล</Label>
          <p className="font-medium text-foreground">{profile.email}</p>
        </div>
        <div>
          <Label>คำอธิบายตัวเอง</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">กำลังโหลด...</div>;
  if (!user || role !== 'user') return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={sidebarItems} title="User Dashboard" />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="upload" element={<UploadPattern />} />
          <Route path="my-patterns" element={<MyPatterns />} />
          <Route path="my-patterns/:id" element={<MyPatterns />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="guide" element={<UserGuide />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;
