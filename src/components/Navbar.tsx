import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardPath = role === 'admin' ? '/dashboard/admin' : role === 'professor' ? '/dashboard/professor' : '/dashboard/user';

  return (
    <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="font-heading text-2xl font-bold text-secondary">
          Thai<span className="text-primary-foreground">Silk</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-primary-foreground/80 hover:text-secondary transition-colors font-medium">หน้าแรก</Link>
          <Link to="/library" className="text-primary-foreground/80 hover:text-secondary transition-colors font-medium">คลังลายผ้า</Link>
          <Link to="/about" className="text-primary-foreground/80 hover:text-secondary transition-colors font-medium">เกี่ยวกับเรา</Link>
          {user ? (
            <Link to={dashboardPath}>
              <Button variant="secondary" size="sm">แดชบอร์ด</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-secondary hover:bg-primary/50">เข้าสู่ระบบ</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm">สมัครสมาชิก</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary/20 p-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-secondary py-2">หน้าแรก</Link>
          <Link to="/library" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-secondary py-2">คลังลายผ้า</Link>
          <Link to="/about" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-secondary py-2">เกี่ยวกับเรา</Link>
          {user ? (
            <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-secondary py-2">แดชบอร์ด</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-secondary py-2">เข้าสู่ระบบ</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="text-secondary py-2">สมัครสมาชิก</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
