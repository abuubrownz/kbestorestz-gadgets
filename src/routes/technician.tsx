import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Wrench,
  Search,
  Clock,
  PackageX,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { repairs as seedRepairs, repairStages, formatTZS, type Repair, type RepairStage } from "@/lib/data";

export const Route = createFileRoute("/technician")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Technician workspace — KBestoreTZ" },
      {
        name: "description",
        content: "Manage assigned repairs, update status, log notes and submit completion reports.",
      },
      { property: "og:title", content: "Technician workspace — KBestoreTZ" },
      {
        property: "og:description",
        content: "Technician dashboard for repair status, notes and parts tracking.",
      },
    ],
  }),
  component: TechnicianPage,
});

const nav = [
  { to: "/technician", label: "Technician", icon: Wrench },
  { to: "/admin", label: "Admin overview", icon: LayoutDashboard },
  { to: "/repairs/track", label: "Track repair", icon: Search },
];

const warrantyOptions = ["30 days", "60 days", "90 days", "6 months"];

function TechnicianPage() {
  const { hasRole } = useAuth();
  const visibleNav = nav.filter((item) => item.to !== "/admin" || hasRole("admin"));
  const [repairsList, setRepairsList] = useState<Repair[]>(seedRepairs);
  const [selectedTicket, setSelectedTicket] = useState(seedRepairs[0]?.ticket ?? "");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, RepairStage>>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [newPart, setNewPart] = useState({ name: "", qty: "1", cost: "" });
  const [workPerformed, setWorkPerformed] = useState("");
  const [tested, setTested] = useState({ functional: false, cosmetic: false, calibration: false });
  const [warranty, setWarranty] = useState("90 days");

  const selected = repairsList.find((r) => r.ticket === selectedTicket) ?? repairsList[0];

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [
      { label: "Assigned repairs", value: repairsList.length, icon: Wrench },
      {
        label: "Due today",
        value: repairsList.filter((r) => r.createdAt === today).length || 3,
        icon: Clock,
      },
      {
        label: "Awaiting parts",
        value: repairsList.filter((r) => r.parts.length === 0 && r.stage !== "Completed" && r.stage !== "Collected").length,
        icon: PackageX,
      },
      {
        label: "Completed this week",
        value: repairsList.filter((r) => r.stage === "Completed" || r.stage === "Collected").length,
        icon: CheckCircle2,
      },
    ];
  }, [repairsList]);

  function updateSelected(patch: Partial<Repair>) {
    if (!selected) return;
    setRepairsList((prev) => prev.map((r) => (r.ticket === selected.ticket ? { ...r, ...patch } : r)));
  }

  function saveStatus() {
    if (!selected) return;
    const draft = statusDrafts[selected.ticket];
    if (!draft || draft === selected.stage) return;
    updateSelected({ stage: draft });
    toast("Status updated", { description: `${selected.ticket} moved to ${draft}.` });
  }

  function addNote() {
    if (!selected || !noteDraft.trim()) return;
    const note = { at: "Just now", author: "You (Technician)", text: noteDraft.trim() };
    updateSelected({ notes: [...selected.notes, note] });
    setNoteDraft("");
    toast("Note added");
  }

  function addPart() {
    if (!selected || !newPart.name.trim() || !newPart.cost) return;
    const part = { name: newPart.name.trim(), qty: Number(newPart.qty) || 1, cost: Number(newPart.cost) || 0 };
    updateSelected({ parts: [...selected.parts, part] });
    setNewPart({ name: "", qty: "1", cost: "" });
    toast("Part added");
  }

  function removePart(index: number) {
    if (!selected) return;
    updateSelected({ parts: selected.parts.filter((_, i) => i !== index) });
  }

  function submitReport() {
    if (!workPerformed.trim()) {
      toast.error("Describe the work performed before submitting.");
      return;
    }
    toast("Completion report submitted", {
      description: `Warranty period: ${warranty}.`,
    });
  }

  return (
    <DashboardShell
      title="Technician workspace"
      subtitle="Manage your assigned repairs"
      workspace="Technician workspace"
      nav={visibleNav}
      allow={["technician", "admin"]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="flex items-center gap-3 p-4 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
              <kpi.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-display text-xl font-bold">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className={cn("shadow-card lg:sticky lg:top-20 lg:h-fit", selected ? "hidden lg:block" : "")}>
          <div className="border-b p-4">
            <h2 className="font-display text-sm font-semibold">Assigned repairs</h2>
          </div>
          <div className="max-h-[70vh] divide-y overflow-y-auto">
            {repairsList.map((repair) => (
              <button
                key={repair.ticket}
                onClick={() => setSelectedTicket(repair.ticket)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                  selected?.ticket === repair.ticket && "bg-accent/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{repair.customer}</p>
                  <StatusBadge label={repair.priority} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{repair.device}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{repair.ticket}</span>
                  <StatusBadge label={repair.stage} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <div className="space-y-4">
            <div className="lg:hidden">
              <Label htmlFor="ticket-select" className="text-xs text-muted-foreground">Selected repair</Label>
              <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                <SelectTrigger id="ticket-select" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repairsList.map((r) => (
                    <SelectItem key={r.ticket} value={r.ticket}>{r.ticket} — {r.customer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow text-muted-foreground">{selected.ticket}</p>
                  <h2 className="mt-1 font-display text-xl font-semibold">{selected.customer}</h2>
                  <p className="text-sm text-muted-foreground">{selected.phone}</p>
                </div>
                <StatusBadge label={selected.priority} />
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Device</p>
                  <p className="font-medium">{selected.device}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Problem</p>
                  <p className="font-medium">{selected.problem}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <h3 className="font-display text-base font-semibold">Update status</h3>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  value={statusDrafts[selected.ticket] ?? selected.stage}
                  onValueChange={(v) => setStatusDrafts((prev) => ({ ...prev, [selected.ticket]: v as RepairStage }))}
                >
                  <SelectTrigger className="sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repairStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveStatus} className="bg-accent text-accent-foreground hover:bg-accent/90 sm:w-32">
                  Save
                </Button>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <h3 className="font-display text-base font-semibold">Repair notes</h3>
              <ul className="mt-3 space-y-3">
                {selected.notes.map((note, i) => (
                  <li key={i} className="rounded-lg bg-secondary/50 p-3 text-sm">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{note.author}</span>
                      <span>{note.at}</span>
                    </div>
                    <p className="mt-1">{note.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Textarea
                  placeholder="Add a note about this repair..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={2}
                  className="sm:flex-1"
                />
                <Button onClick={addNote} variant="outline" className="sm:w-32">Add note</Button>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <h3 className="font-display text-base font-semibold">Parts used</h3>
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.parts.map((part, i) => (
                    <TableRow key={`${part.name}-${i}`}>
                      <TableCell>{part.name}</TableCell>
                      <TableCell className="text-right">{part.qty}</TableCell>
                      <TableCell className="text-right">{formatTZS(part.cost)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removePart(i)} aria-label={`Remove ${part.name}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="Part name"
                        value={newPart.name}
                        onChange={(e) => setNewPart((p) => ({ ...p, name: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        className="text-right"
                        value={newPart.qty}
                        onChange={(e) => setNewPart((p) => ({ ...p, qty: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="Cost"
                        className="text-right"
                        value={newPart.cost}
                        onChange={(e) => setNewPart((p) => ({ ...p, cost: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={addPart} aria-label="Add part">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            <Card className="p-5 shadow-card">
              <h3 className="font-display text-base font-semibold">Completion report</h3>
              <div className="mt-3 space-y-4">
                <div>
                  <Label htmlFor="work-performed">Work performed</Label>
                  <Textarea
                    id="work-performed"
                    className="mt-1.5"
                    rows={3}
                    placeholder="Summarize the repair work carried out..."
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={tested.functional}
                      onCheckedChange={(v) => setTested((t) => ({ ...t, functional: Boolean(v) }))}
                    />
                    Functional test passed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={tested.cosmetic}
                      onCheckedChange={(v) => setTested((t) => ({ ...t, cosmetic: Boolean(v) }))}
                    />
                    Cosmetic check passed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={tested.calibration}
                      onCheckedChange={(v) => setTested((t) => ({ ...t, calibration: Boolean(v) }))}
                    />
                    Calibration verified
                  </label>
                </div>
                <div className="max-w-xs">
                  <Label htmlFor="warranty">Warranty period</Label>
                  <Select value={warranty} onValueChange={setWarranty}>
                    <SelectTrigger id="warranty" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warrantyOptions.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={submitReport} className="bg-success text-white hover:bg-success/90">
                  Submit completion report
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
