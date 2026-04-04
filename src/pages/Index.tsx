import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PatternCard from '@/components/PatternCard';
import { Search, ChevronDown } from 'lucide-react';

const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const Index = () => {
  const [approvedPatterns, setApprovedPatterns] = useState<any[]>([]);
  const showcase = useInView();

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
      <section className="gradient-hero py-20 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30Z\' fill=\'none\' stroke=\'%23D4A843\' stroke-width=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-secondary mb-4 md:mb-6 animate-fade-in">
            Thai<span className="text-primary-foreground">Silk</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/80 mb-3 md:mb-4 max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            ระบบบันทึกลายผ้าไหมไทยภาคอีสาน
          </p>
          <p className="text-sm md:text-base text-primary-foreground/60 mb-6 md:mb-8 max-w-xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            อนุรักษ์มรดกทางวัฒนธรรม ด้วยเทคโนโลยีดิจิทัล
          </p>
          <div className="flex gap-3 md:gap-4 justify-center flex-wrap opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <Link to="/library">
              <Button variant="secondary" size="lg" className="font-heading font-semibold shadow-lg hover:shadow-xl transition-shadow">
                <Search size={18} /> สำรวจคลังลายผ้า
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="font-heading font-semibold border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all">
                เริ่มต้นใช้งาน
              </Button>
            </Link>
          </div>
        </div>
        {approvedPatterns.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={28} className="text-primary-foreground/40" />
          </div>
        )}
      </section>

      {/* Showcase */}
      {approvedPatterns.length > 0 && (
        <section ref={showcase.ref} className="py-16 md:py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className={`font-heading text-2xl md:text-3xl font-bold text-center text-foreground mb-3 md:mb-4 transition-all duration-700 ${showcase.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              ลายผ้าที่ผ่านการตรวจสอบ
            </h2>
            <p className={`text-center text-muted-foreground mb-8 md:mb-12 transition-all duration-700 delay-100 ${showcase.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              ตัวอย่างลายผ้าไหมจากคลังข้อมูลของเรา
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {approvedPatterns.map((p, i) => (
                <div key={p.id} className={`transition-all duration-500 ${showcase.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${200 + i * 100}ms` }}>
                  <PatternCard {...p} />
                </div>
              ))}
            </div>
            <div className={`text-center mt-8 md:mt-10 transition-all duration-700 delay-500 ${showcase.inView ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/library">
                <Button variant="secondary" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">ดูทั้งหมด</Button>
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
