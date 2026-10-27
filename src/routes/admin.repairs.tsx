import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { repairs as seedRepairs, repairStages, technicians, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/admin/repairs")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Repair Management | KBestoreTZ Admin" },
      { name: "description", content: "Track and manage repair tickets, technician assignments and stage progress." },
      { property: "og:title", content: "Repair Management | KBestoreTZ Admin" },
      { property: "og:description", content: "Track and manage repair tickets, technician assignments and stage progress." },
    ],
  }),
  component: AdminRepairs,
});

function AdminRepairs() {
  const [rows, setRows] = useState(seedRepairs);
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (stageFilter === "all" ? rows : rows.filter((r) => r.stage === stageFilter)),
    [rows, stageFilter],
  );

  const kpis = [
    { label: "Open tickets", value: rows.filter((r) => r.stage !== "Completed" && r.stage !== "Collected").length },
    { label: "Critical priority", value: rows.filter((r) => r.priority === "Critical").length },
    { label: "Completed this week", value: rows.filter((r) => r.stage === "Completed" || r.stage === "Collected").length },
    { label: "Total quoted value", value: formatTZS(rows.reduce((s, r) => s + r.quote, 0)) },
  ];

  function updateRow(ticket: string, patch: Partial<(typeof rows)[number]>) {
    setRows((prev) => prev.map((r) => (r.ticket === ticket ? { ...r, ...patch } : r)));
  }

  return (
    <DashboardShell title="Repairs" subtitle="Ticket queue and technician assignment" workspace="Admin console" nav={adminNav}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardContent className="pt-6">
              <p className="eyebrow text-muted-foreground">{k.label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={stageFilter === "all" ? "default" : "outline"}
          onClick={() => setStageFilter("all")}
        >
          All
        </Button>
        {repairStages.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={stageFilter === s ? "default" : "outline"}
            onClick={() => setStageFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="overflow-x-auto pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.ticket}>
                    <TableCell className="font-mono text-xs">{r.ticket}</TableCell>
                    <TableCell className="font-medium">{r.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{r.device}</TableCell>
                    <TableCell>
                      <Select value={r.stage} onValueChange={(v) => {
                        updateRow(r.ticket, { stage: v as typeof r.stage });
                        toast.success(`${r.ticket} moved to ${v}`);
                      }}>
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {repairStages.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.technician} onValueChange={(v) => {
                        updateRow(r.ticket, { technician: v });
                        toast.success(`${r.ticket} assigned to ${v}`);
                      }}>
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((t) => (
                            <SelectItem key={t.name} value={t.name}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={r.priority} />
                    </TableCell>
                    <TableCell>{r.quote ? formatTZS(r.quote) : "Pending"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No repairs in this stage.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Technician workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicians.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.speciality}</p>
                  </div>
                  <span className={cn("text-xs font-semibold", t.load > 70 && "text-warning-foreground")}>{t.load}%</span>
                </div>
                <Progress value={t.load} />
                <p className="mt-1 text-xs text-muted-foreground">{t.active} active · {t.completed} completed</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
