import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Calendar, User, CheckCircle, ChevronLeft, ChevronRight, Info, Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const UserAvatar = ({ profile, size = 'sm' }: { profile: any; size?: 'sm' | 'md' }) => {
  const s = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div className={`${s} rounded-full overflow-hidden bg-muted shrink-0`}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
          <User size={size === 'sm' ? 14 : 20} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const PatternDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [pattern, setPattern] = useState<any>(null);
  const [uploader, setUploader] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('silk_patterns').select('*').eq('id', id).single().then(({ data }) => {
      setPattern(data);
      if (data?.user_id) {
        supabase.from('profiles').select('first_name, last_name, username, avatar_url, user_id').eq('user_id', data.user_id).single().then(({ data: u }) => setUploader(u));
      }
      if (data?.reviewer_id) {
        supabase.from('profiles').select('first_name, last_name, username, avatar_url, user_id').eq('user_id', data.reviewer_id).single().then(({ data: r }) => setReviewer(r));
      }
    });
  }, [id]);

  const handleReport = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }
    if (!reportReason.trim()) {
      toast.error('กรุณากรอกสาเหตุการรายงาน');
      return;
    }
    setReporting(true);
    try {
      await supabase.from('pattern_reports').insert({
        pattern_id: pattern.id,
        reporter_id: user.id,
        reason: reportReason.trim(),
      });

      // Notify all admins
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (adminRoles && adminRoles.length > 0) {
        const notifs = adminRoles.map(r => ({
          user_id: r.user_id,
          title: 'มีการรายงานลายผ้า',
          message: `ลาย "${pattern.name}" ถูกรายงานโดยผู้ใช้`,
        }));
        await supabase.from('notifications').insert(notifs);
      }

      toast.success('รายงานลายผ้าสำเร็จ');
      setReportOpen(false);
      setReportReason('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReporting(false);
    }
  };

  const handleReportClick = () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนรายงาน');
      navigate('/login');
      return;
    }
    if (role !== 'user' && role !== 'professor') {
      toast.error('เฉพาะผู้ใช้และผู้เชี่ยวชาญเท่านั้นที่สามารถรายงานได้');
      return;
    }
    setReportOpen(true);
  };

  if (!pattern) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </div>
  );

  const images = pattern.images || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-muted py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 hover:bg-background">
            <ArrowLeft size={16} /> ย้อนกลับ
          </Button>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6 animate-fade-in">{pattern.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="animate-fade-in">
              {images.length > 0 ? (
                <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                  <img src={images[currentImg]} alt={`${pattern.name} ${currentImg + 1}`} className="w-full aspect-[4/3] object-cover" />
                  {images.length > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 w-8 h-8 md:w-10 md:h-10" onClick={() => setCurrentImg(p => p === 0 ? images.length - 1 : p - 1)}>
                        <ChevronLeft size={18} />
                      </Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 w-8 h-8 md:w-10 md:h-10" onClick={() => setCurrentImg(p => p === images.length - 1 ? 0 : p + 1)}>
                        <ChevronRight size={18} />
                      </Button>
                      <div className="flex justify-center gap-2 absolute bottom-3 left-1/2 -translate-x-1/2">
                        {images.map((_: string, i: number) => (
                          <button key={i} onClick={() => setCurrentImg(i)} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${i === currentImg ? 'bg-secondary scale-125' : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-card rounded-2xl flex items-center justify-center text-muted-foreground shadow-card">ไม่มีรูปภาพ</div>
              )}
            </div>

            <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card space-y-4">
                {pattern.province && (
                  <div className="flex items-center gap-3 text-foreground text-sm md:text-base">
                    <MapPin size={18} className="text-secondary shrink-0" />
                    <span>จังหวัด: {pattern.province}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-foreground text-sm md:text-base">
                  <Calendar size={18} className="text-secondary shrink-0" />
                  <span>วันที่อัปโหลด: {new Date(pattern.created_at).toLocaleDateString('th-TH')}</span>
                </div>

                {uploader && (
                  <div className="flex items-center gap-3 text-foreground text-sm md:text-base">
                    <UserAvatar profile={uploader} />
                    <span>อัปโหลดโดย: {uploader.first_name} {uploader.last_name}</span>
                    <Link to={`/profile/${uploader.user_id}`} className="ml-auto shrink-0 w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center hover:bg-secondary/30 transition-colors" title="ดูโปรไฟล์">
                      <Info size={13} className="text-secondary" />
                    </Link>
                  </div>
                )}

                {pattern.status === 'approved' && reviewer && (
                  <div className="flex items-center gap-3 text-foreground text-sm md:text-base">
                    <UserAvatar profile={reviewer} />
                    <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-600" /> ตรวจสอบโดย: {reviewer.first_name} {reviewer.last_name}</span>
                    <Link to={`/profile/${reviewer.user_id}`} className="ml-auto shrink-0 w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center hover:bg-secondary/30 transition-colors" title="ดูโปรไฟล์">
                      <Info size={13} className="text-secondary" />
                    </Link>
                  </div>
                )}

                {pattern.status === 'approved' && pattern.reviewed_at && (
                  <div className="flex items-center gap-3 text-foreground text-sm md:text-base">
                    <Calendar size={18} className="text-emerald-600 shrink-0" />
                    <span>วันที่อนุมัติ: {new Date(pattern.reviewed_at).toLocaleDateString('th-TH')}</span>
                  </div>
                )}

                {pattern.notes && (
                  <div className="pt-3 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-1 text-sm md:text-base">หมายเหตุ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.notes}</p>
                  </div>
                )}
                {pattern.reviewer_notes && (
                  <div className="pt-3 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-1 text-sm md:text-base">รายละเอียดจากผู้เชี่ยวชาญ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.reviewer_notes}</p>
                  </div>
                )}
              </div>

              {/* Report button */}
              <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleReportClick}>
                <Flag size={16} /> รายงานลายผ้านี้
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2"><Flag size={18} className="text-destructive" /> รายงานลายผ้า</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">กรุณาระบุสาเหตุที่ต้องการรายงานลายผ้า "{pattern.name}"</p>
            <Textarea
              placeholder="สาเหตุการรายงาน..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setReportOpen(false)}>ยกเลิก</Button>
              <Button variant="destructive" className="flex-1" onClick={handleReport} disabled={reporting}>
                {reporting ? 'กำลังส่ง...' : 'ยืนยันการรายงาน'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PatternDetail;
