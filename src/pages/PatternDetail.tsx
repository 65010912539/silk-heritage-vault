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
      <div className="flex-1 bg-background py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6 animate-fade-in">{pattern.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="animate-fade-in">
              {images.length > 0 ? (
                <div className="relative">
                  <img src={images[currentImg]} alt={`${pattern.name} ${currentImg + 1}`} className="w-full rounded-xl shadow-card aspect-[4/3] object-cover" />
                  {images.length > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 w-8 h-8 md:w-10 md:h-10" onClick={() => setCurrentImg(p => p === 0 ? images.length - 1 : p - 1)}>
                        <ChevronLeft size={18} />
                      </Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 w-8 h-8 md:w-10 md:h-10" onClick={() => setCurrentImg(p => p === images.length - 1 ? 0 : p + 1)}>
                        <ChevronRight size={18} />
                      </Button>
                      <div className="flex justify-center gap-2 mt-3">
                        {images.map((_: string, i: number) => (
                          <button key={i} onClick={() => setCurrentImg(i)} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${i === currentImg ? 'bg-secondary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center text-muted-foreground">ไม่มีรูปภาพ</div>
              )}
            </div>
            <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="bg-card p-5 md:p-6 rounded-xl shadow-card space-y-3 md:space-y-4">
                {pattern.province && (
                  <div className="flex items-center gap-2 text-foreground text-sm md:text-base">
                    <MapPin size={18} className="text-secondary shrink-0" />
                    <span>จังหวัด: {pattern.province}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-foreground text-sm md:text-base">
                  <Calendar size={18} className="text-secondary shrink-0" />
                  <span>วันที่อัปโหลด: {new Date(pattern.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                {uploader && (
                  <div className="flex items-center gap-2 text-foreground text-sm md:text-base">
                    <User size={18} className="text-secondary shrink-0" />
                    <span>อัปโหลดโดย: {uploader.first_name} {uploader.last_name}</span>
                  </div>
                )}
                {pattern.status === 'approved' && reviewer && (
                  <div className="flex items-center gap-2 text-foreground text-sm md:text-base">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                    <span>ตรวจสอบโดย: {reviewer.first_name} {reviewer.last_name}</span>
                  </div>
                )}
                {pattern.status === 'approved' && pattern.reviewed_at && (
                  <div className="flex items-center gap-2 text-foreground text-sm md:text-base">
                    <Calendar size={18} className="text-emerald-600 shrink-0" />
                    <span>วันที่อนุมัติ: {new Date(pattern.reviewed_at).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {pattern.notes && (
                  <div className="pt-2 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-1 text-sm md:text-base">หมายเหตุ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.notes}</p>
                  </div>
                )}
                {pattern.reviewer_notes && (
                  <div className="pt-2 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-1 text-sm md:text-base">รายละเอียดจากผู้เชี่ยวชาญ</h3>
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
