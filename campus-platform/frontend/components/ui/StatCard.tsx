import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  sub?: string;
}

export default function StatCard({ title, value, icon: Icon, color = 'indigo', sub }: Props) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="glass-card flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
