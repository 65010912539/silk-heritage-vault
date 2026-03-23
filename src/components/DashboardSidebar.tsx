import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  title: string;
}

const DashboardSidebar = ({ items, title }: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="font-heading text-lg font-bold text-sidebar-primary">{title}</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 space-y-2 border-t border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors">
          <Home size={18} /> หน้าหลัก
        </Link>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive">
          <LogOut size={18} /> ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
