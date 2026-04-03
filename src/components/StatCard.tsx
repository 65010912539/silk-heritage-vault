import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: 'navy' | 'gold' | 'green' | 'red';
}

const colorMap = {
  navy: 'bg-primary text-primary-foreground',
  gold: 'bg-secondary text-secondary-foreground',
  green: 'bg-emerald-500 text-primary-foreground',
  red: 'bg-destructive text-destructive-foreground',
};

const StatCard = ({ title, value, icon: Icon, color = 'navy' }: StatCardProps) => (
  <div className="bg-card rounded-lg p-4 md:p-5 shadow-card flex items-center gap-3 md:gap-4 hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
    <div className={`${colorMap[color]} p-2.5 md:p-3 rounded-lg shrink-0`}>
      <Icon size={20} className="md:w-6 md:h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-xs md:text-sm text-muted-foreground truncate">{title}</p>
      <p className="text-xl md:text-2xl font-heading font-bold text-card-foreground">{value}</p>
    </div>
  </div>
);

export default StatCard;
