import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Calendar, User } from 'lucide-react';

const PatternDetail = () => {
  const { id } = useParams();
  const [pattern, setPattern] = useState<any>(null);
  const [uploader, setUploader] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from('silk_patterns').select('*').eq('id', id).single().then(({ data }) => {
      setPattern(data);
      if (data?.user_id) {
        supabase.from('profiles').select('first_name, last_name').eq('user_id', data.user_id).single().then(({ data: u }) => setUploader(u));
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-6">{pattern.name}</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {pattern.images?.map((img: string, i: number) => (
                <img key={i} src={img} alt={`${pattern.name} ${i + 1}`} className="w-full rounded-lg shadow-card" />
              ))}
              {(!pattern.images || pattern.images.length === 0) && (
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
                {pattern.notes && (
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">หมายเหตุ</h3>
                    <p className="text-muted-foreground text-sm">{pattern.notes}</p>
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
