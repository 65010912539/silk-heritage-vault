import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, AtSign, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    ]).then(([{ data: p }, { data: r }]) => {
      setProfile(p);
      setRole(r?.role || '');
    });
  }, [userId]);

  if (!profile) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </div>
  );

  const roleLabel = role === 'professor' ? 'ผู้เชี่ยวชาญ' : role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-muted py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft size={16} /> ย้อนกลับ
          </Button>
          <div className="bg-card rounded-2xl shadow-elevated p-6 md:p-8 text-center animate-fade-in">
            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg mb-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
                  <User size={48} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">{profile.first_name} {profile.last_name}</h1>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary/15 text-secondary">{roleLabel}</span>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-foreground p-3 bg-muted rounded-lg">
                <AtSign size={16} className="text-secondary shrink-0" />
                <span>{profile.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground p-3 bg-muted rounded-lg">
                <Mail size={16} className="text-secondary shrink-0" />
                <span>{profile.email}</span>
              </div>
              {profile.bio && (
                <div className="flex items-start gap-3 text-sm text-foreground p-3 bg-muted rounded-lg">
                  <FileText size={16} className="text-secondary shrink-0 mt-0.5" />
                  <span>{profile.bio}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfile;
