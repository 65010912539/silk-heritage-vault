import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatternCard from '@/components/PatternCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISAN_PROVINCES } from '@/lib/provinces';
import { Search } from 'lucide-react';

const Library = () => {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      let query = supabase
        .from('silk_patterns')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (search) query = query.ilike('name', `%${search}%`);
      if (province && province !== 'all') query = query.eq('province', province);

      const { data } = await query;
      setPatterns(data || []);
      setLoading(false);
    };
    fetchPatterns();
  }, [search, province]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">คลังลายผ้า</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหาชื่อลายผ้า..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="เลือกจังหวัด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกจังหวัด</SelectItem>
                {ISAN_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-20">กำลังโหลด...</p>
          ) : patterns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">ไม่พบลายผ้าในคลัง</p>
              <p className="text-muted-foreground text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเลือกจังหวัดอื่น</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {patterns.map(p => <PatternCard key={p.id} {...p} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Library;
