import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Calendar, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PatternDetail = () => {
  const { id } = useParams();
  const [pattern, setPattern] = useState<any>(null);
  const [uploader, setUploader] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from('silk_patterns').select('*').eq('id', id).single().then(({ data }) => {
      setPattern(data);
      if (data?.user_id) {
        supabase.from('profiles').select('first_name, last_name, username').eq('user_id', data.user_id).single().then(({ data: u }) => setUploader(u));
      }
      if (data?.reviewer_id) {
        supabase.from('profiles').select('first_name, last_name, username').eq('user_id', data.reviewer_id).single().then(({ data: r }) => setReviewer(r));
      }
    });
  }, [id]);

  if (!pattern) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">กำลังโหลด...</p></div>
      <Footer />
    </div>
  );

  const images = pattern.images || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-6">{pattern.name}</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {images.length > 0 ? (
                <div className="relative">
                  <img src={images[currentImg]} alt={`${pattern.name} ${currentImg + 1}`} className="w-full rounded-lg shadow-card aspect-[4/3] object-cover" />
                  {images.length > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100" onClick={() => setCurrentImg(p => p === 0 ? images.length - 1 : p - 1)}>
                        <ChevronLeft size={20} />
                      </Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100" onClick={() => setCurrentImg(p => p === images.length - 1 ? 0 : p + 1)}>
                        <ChevronRight size={20} />
                      </Button>
                      <div className="flex justify-center gap-2 mt-3">
                        {images.map((_: string, i: number) => (
                          <button key={i} onClick={() => setCurrentImg(i)} className={`w-3 h-3 rounded-full transition-colors ${i === currentImg ? 'bg-secondary' : 'bg-muted-foreground/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">ไม่มีรูปภาพ</div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-4">
                {pattern.province && (
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin size={18} className="text-secondary" />
                    <span>จังหวัด: {pattern.province}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar size={18} className="text-secondary" />
                  <span>วันที่อัปโหลด: {new Date(pattern.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                {uploader && (
                  <div className="flex items-center gap-2 text-foreground">
                    <User size={18} className="text-secondary" />
                    <span>อัปโหลดโดย: {uploader.first_name} {uploader.last_name}</span>
                  </div>
                )}
                {pattern.status === 'approved' && reviewer && (
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle size={18} className="text-emerald-600" />
                    <span>ตรวจสอบโดย: {reviewer.first_name} {reviewer.last_name}</span>
                  </div>
                )}
                {pattern.status === 'approved' && pattern.reviewed_at && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar size={18} className="text-emerald-600" />
                    <span>วันที่อนุมัติ: {new Date(pattern.reviewed_at).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {pattern.notes && (
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">หมายเหตุ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.notes}</p>
                  </div>
                )}
                {pattern.reviewer_notes && (
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">รายละเอียดจากผู้เชี่ยวชาญ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.reviewer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PatternDetail;
