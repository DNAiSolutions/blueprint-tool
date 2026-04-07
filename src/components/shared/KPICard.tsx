import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export function KPICard({ label, value, subtitle, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="rounded-lg bg-card p-4 card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="ai-label">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[28px] font-bold leading-none tracking-tight">{value}</span>
        {trend && (
          <span className={cn(
            'text-xs font-medium mb-1',
            trend.positive ? 'text-success' : 'text-destructive'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
