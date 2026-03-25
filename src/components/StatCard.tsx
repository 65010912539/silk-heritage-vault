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
  <div className="bg-card rounded-lg p-5 shadow-card flex items-center gap-4">
    <div className={`${colorMap[color]} p-3 rounded-lg`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-heading font-bold text-card-foreground">{value}</p>
    </div>
  </div>
);

export default StatCard;
