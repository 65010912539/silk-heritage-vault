import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PatternCard from '@/components/PatternCard';
import { Search } from 'lucide-react';

const Index = () => {
  const [approvedPatterns, setApprovedPatterns] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('silk_patterns')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setApprovedPatterns(data || []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30Z\' fill=\'none\' stroke=\'%23D4A843\' stroke-width=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-secondary mb-6 animate-fade-in">
            Thai<span className="text-primary-foreground">Silk</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            ระบบบันทึกลายผ้าไหมไทยภาคอีสาน
          </p>
          <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            อนุรักษ์มรดกทางวัฒนธรรม ด้วยเทคโนโลยีดิจิทัล
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/library">
              <Button variant="secondary" size="lg" className="font-heading font-semibold">
                <Search size={18} /> สำรวจคลังลายผ้า
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="font-heading font-semibold border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                เริ่มต้นใช้งาน
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase */}
      {approvedPatterns.length > 0 && (
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-4">ลายผ้าที่ผ่านการตรวจสอบ</h2>
            <p className="text-center text-muted-foreground mb-12">ตัวอย่างลายผ้าไหมจากคลังข้อมูลของเรา</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedPatterns.map((p) => (
                <PatternCard key={p.id} {...p} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/library">
                <Button variant="secondary" size="lg">ดูทั้งหมด</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
