import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Phone,
  Smartphone,
  User,
  PackageSearch,
} from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/kb/status-badge";
import { repairs, repairStages, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/repairs/track")({
  head: () => ({
    meta: [
      { title: "Track repair — KBestoreTZ" },
      {
        name: "description",
        content: "Track the live status, notes, parts and quotation for your device repair.",
      },
      { property: "og:title", content: "Track repair — KBestoreTZ" },
      {
        property: "og:description",
        content: "Enter your tracking number to see full repair progress.",
      },
    ],
  }),
  component: RepairsTrackPage,
});

function RepairsTrackPage() {
  const [input, setInput] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [quoteDecision, setQuoteDecision] = useState<Record<string, "approved" | "declined">>({});

  const repair = searched
    ? repairs.find((r) => r.ticket.toLowerCase() === searched.toLowerCase())
    : undefined;

  function handleTrack() {
    setSearched(input.trim());
  }

  function decide(ticket: string, decision: "approved" | "declined") {
    setQuoteDecision((prev) => ({ ...prev, [ticket]: decision }));
    toast(decision === "approved" ? "Quotation approved" : "Quotation declined", {
      description:
        decision === "approved"
          ? "We'll start the repair right away."
          : "Please arrange to collect your device.",
    });
  }

  const currentStageIndex = repair ? repairStages.indexOf(repair.stage) : -1;

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-accent">Track your repair</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Where's my device?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your tracking number to see live status. Try a sample: <span className="font-medium text-foreground">KB-RP-48219</span>
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label="Tracking number"
            placeholder="e.g. KB-RP-48219"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button onClick={handleTrack} className="bg-accent text-accent-foreground hover:bg-accent/90 sm:w-40">
            <Search className="mr-1.5 h-4 w-4" /> Track
          </Button>
        </div>

        {searched && !repair ? (
          <Card className="mt-10 flex flex-col items-center gap-3 p-10 text-center shadow-card">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold">No repair found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              We couldn't find a repair with tracking number "{searched}". Double-check the number or book a new repair.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link to="/repairs/book">Book a repair</Link>
            </Button>
          </Card>
        ) : null}

        {repair ? (
          <div className="mt-10 space-y-6">
            <Card className="p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow text-muted-foreground">{repair.ticket}</p>
                  <h2 className="mt-1 font-display text-xl font-semibold">{repair.device}</h2>
                </div>
                <StatusBadge label={repair.stage} />
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{repair.customer}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{repair.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Smartphone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Problem</p>
                    <p className="font-medium">{repair.problem}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">Quotation</h3>
                  <p className="text-sm text-muted-foreground">
                    {repair.quote > 0 ? "Review and approve before repair continues." : "Awaiting diagnosis before a quote is issued."}
                  </p>
                </div>
                {repair.quote > 0 ? (
                  <p className="font-display text-2xl font-bold text-accent">{formatTZS(repair.quote)}</p>
                ) : null}
              </div>
              {repair.quote > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {quoteDecision[repair.ticket] ? (
                    <StatusBadge
                      label={quoteDecision[repair.ticket] === "approved" ? "Quotation approved" : "Quotation declined"}
                      tone={quoteDecision[repair.ticket] === "approved" ? "success" : "danger"}
                    />
                  ) : (
                    <>
                      <Button onClick={() => decide(repair.ticket, "approved")} className="bg-success text-white hover:bg-success/90">
                        Approve quotation
                      </Button>
                      <Button onClick={() => decide(repair.ticket, "declined")} variant="outline">
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              ) : null}
            </Card>

            <Card className="p-5 shadow-card sm:p-6">
              <h3 className="font-display text-lg font-semibold">Repair progress</h3>
              <ol className="mt-5 space-y-0">
                {repairStages.map((stage, index) => {
                  const state =
                    index < currentStageIndex ? "done" : index === currentStageIndex ? "current" : "upcoming";
                  return (
                    <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
                      {index < repairStages.length - 1 ? (
                        <span
                          className={
                            "absolute left-[11px] top-6 h-full w-px " +
                            (state === "done" ? "bg-success" : "bg-border")
                          }
                        />
                      ) : null}
                      <span className="relative z-10">
                        {state === "done" ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : state === "current" ? (
                          <Clock className="h-6 w-6 text-accent" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </span>
                      <div>
                        <p className={"font-medium " + (state === "upcoming" ? "text-muted-foreground" : "")}>
                          {stage}
                        </p>
                        {state === "current" ? (
                          <p className="text-xs text-accent">In progress</p>
                        ) : state === "done" ? (
                          <p className="text-xs text-muted-foreground">Completed</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>

            <Card className="p-5 shadow-card sm:p-6">
              <h3 className="font-display text-lg font-semibold">Technician notes</h3>
              <ul className="mt-4 space-y-3">
                {repair.notes.map((note, i) => (
                  <li key={i} className="rounded-lg bg-secondary/50 p-3 text-sm">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{note.author}</span>
                      <span>{note.at}</span>
                    </div>
                    <p className="mt-1">{note.text}</p>
                  </li>
                ))}
                {repair.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : null}
              </ul>
            </Card>

            <Card className="p-5 shadow-card sm:p-6">
              <h3 className="font-display text-lg font-semibold">Parts used</h3>
              {repair.parts.length > 0 ? (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repair.parts.map((part) => (
                      <TableRow key={part.name}>
                        <TableCell>{part.name}</TableCell>
                        <TableCell className="text-right">{part.qty}</TableCell>
                        <TableCell className="text-right">{formatTZS(part.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No parts recorded yet.</p>
              )}
            </Card>

            <Card className="flex items-center justify-between p-5 shadow-card sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">Estimated completion</p>
                <p className="font-display text-lg font-semibold">
                  {repair.stage === "Completed" || repair.stage === "Collected" ? "Ready for collection" : "Within 24–48 hours"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Technician: {repair.technician}</p>
            </Card>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
