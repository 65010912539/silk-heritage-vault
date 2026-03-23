import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

interface PatternCardProps {
  id: string;
  name: string;
  province: string | null;
  images: string[];
  created_at: string;
  status?: string;
  linkPrefix?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-secondary text-secondary-foreground',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'รอตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
};

const PatternCard = ({ id, name, province, images, created_at, status, linkPrefix = '/pattern' }: PatternCardProps) => (
  <Link to={`${linkPrefix}/${id}`} className="group block">
    <div className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 group-hover:-translate-y-1">
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        {images.length > 0 ? (
          <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">ไม่มีรูปภาพ</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-card-foreground mb-2 line-clamp-1">{name}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {province && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {province}</span>
          )}
          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(created_at).toLocaleDateString('th-TH')}</span>
        </div>
        {status && (
          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${statusColors[status] || ''}`}>
            {statusLabels[status] || status}
          </span>
        )}
      </div>
    </div>
  </Link>
);

export default PatternCard;
