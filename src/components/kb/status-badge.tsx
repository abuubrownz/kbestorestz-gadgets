import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const toneMap: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-accent/10 text-accent border-accent/25",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
};

const labelTone: Record<string, Tone> = {
  Pending: "warning",
  Processing: "info",
  Shipped: "info",
  Delivered: "success",
  Submitted: "neutral",
  Received: "neutral",
  Diagnosis: "info",
  Quotation: "warning",
  Approved: "info",
  Repairing: "info",
  Testing: "warning",
  Completed: "success",
  Collected: "success",
  Critical: "danger",
  Express: "warning",
  Standard: "neutral",
  "Low stock": "danger",
  "In stock": "success",
};

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? labelTone[label] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneMap[resolved],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}