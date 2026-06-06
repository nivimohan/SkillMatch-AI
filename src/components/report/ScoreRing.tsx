import { Card, CardContent } from "@/components/ui/card";

interface Props {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

export function ScoreRing({ value, size = 180, stroke = 14, label, sublabel }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  const color = v >= 75 ? "var(--color-success)" : v >= 50 ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-4xl font-bold">{v}</div>
          {label && <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>}
          {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

export function ReportCard({ title, icon: Icon, children, action }: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-card">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="grid size-9 place-items-center rounded-lg gradient-brand text-primary-foreground shadow-elegant">
                <Icon className="size-4" />
              </div>
            )}
            <h3 className="font-display text-lg font-semibold">{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
