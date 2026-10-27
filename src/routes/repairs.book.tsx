import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  X,
  PartyPopper,
} from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { DemoConfirmNotice } from "@/components/kb/demo-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { deviceTypes, problemTypes, locations } from "@/lib/data";

export const Route = createFileRoute("/repairs/book")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Book a repair — KBestoreTZ" },
      {
        name: "description",
        content:
          "Book a device repair in five steps: choose your device, describe the problem, upload photos, pick an appointment and confirm.",
      },
      { property: "og:title", content: "Book a repair — KBestoreTZ" },
      {
        property: "og:description",
        content: "Fast, guided repair booking with instant tracking number.",
      },
    ],
  }),
  component: RepairsBookPage,
});

const steps = [
  "Device",
  "Problem",
  "Photos",
  "Appointment",
  "Review",
] as const;

const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];

type Photo = { id: string; url: string; name: string };

function generateTicket() {
  return `KB-RP-${Math.floor(10000 + Math.random() * 89999)}`;
}

function RepairsBookPage() {
  const [step, setStep] = useState(0);
  const [deviceId, setDeviceId] = useState("");
  const [model, setModel] = useState("");
  const [problemId, setProblemId] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"Standard" | "Express">("Standard");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);

  const device = deviceTypes.find((d) => d.id === deviceId);
  const problem = problemTypes.find((p) => p.id === problemId);

  const errors = useMemo(() => {
    const e: Record<number, string> = {};
    if (!deviceId || !model.trim()) e[0] = "Select a device type and enter the model.";
    if (!problemId || !description.trim()) e[1] = "Select a problem and describe the issue.";
    if (photos.length === 0) e[2] = "Upload at least one photo of the damage.";
    if (!branch || !date || !time) e[3] = "Choose a branch, date and time slot.";
    if (!name.trim() || !phone.trim() || !email.trim()) e[4] = "Fill in your name, phone and email.";
    return e;
  }, [deviceId, model, problemId, description, photos, branch, date, time, name, phone, email]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: Photo[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPhotos((prev) => [...prev, ...next]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function goNext() {
    if (errors[step]) return;
    if (step === steps.length - 1) {
      setTicket(generateTicket());
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  if (ticket) {
    return (
      <PublicShell>
        <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
            <PartyPopper className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            Booking preview (not saved)
          </h1>
          <p className="mt-2 text-muted-foreground">
            This was a demo booking, so no repair request was recorded and this number cannot be tracked yet.
          </p>
          <Card className="mt-6 w-full p-6 shadow-card">
            <p className="eyebrow text-muted-foreground">Tracking number</p>
            <p className="mt-1 font-display text-3xl font-bold text-accent">{ticket}</p>
          </Card>
          <div className="mt-4 w-full">
            <DemoConfirmNotice what="booking" />
          </div>
          <Card className="mt-4 w-full p-6 text-left shadow-card">
            <h2 className="font-display text-base font-semibold">What happens next</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Our front desk confirms your appointment at {branch || "your branch"}.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> A technician runs a free diagnosis on arrival.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> You'll receive a quotation to approve before any paid work begins.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Track every stage live using your tracking number.
              </li>
            </ul>
          </Card>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/repairs/track">Track this repair</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-accent">Book a repair</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Let's get your device fixed
        </h1>

        <ol className="mt-8 flex items-center gap-1 sm:gap-2" aria-label="Booking steps">
          {steps.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
              <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                    index < step && "border-success bg-success text-white",
                    index === step && "border-accent bg-accent text-accent-foreground",
                    index > step && "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {index < step ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="hidden text-xs font-medium sm:block">{label}</span>
              </div>
              {index < steps.length - 1 ? (
                <div className={cn("h-px flex-1", index < step ? "bg-success" : "bg-border")} />
              ) : null}
            </li>
          ))}
        </ol>

        <Card className="mt-8 p-5 shadow-card sm:p-8">
          {step === 0 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">What device needs repair?</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {deviceTypes.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeviceId(d.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      deviceId === d.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
                    )}
                  >
                    <p className="font-display font-semibold">{d.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d.hint}</p>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <Label htmlFor="model">Device model</Label>
                <Input
                  id="model"
                  className="mt-1.5"
                  placeholder="e.g. iPhone 13 Pro, MacBook Air M2"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">What's the problem?</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {problemTypes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProblemId(p.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      problemId === p.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
                    )}
                  >
                    <p className="font-display font-semibold">{p.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.hint}</p>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <Label htmlFor="description">Describe the issue</Label>
                <Textarea
                  id="description"
                  className="mt-1.5"
                  rows={4}
                  placeholder="Add any extra detail that will help our technicians..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">Upload photos of the damage</h2>
              <label
                htmlFor="photo-upload"
                className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload or drag images here</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              {photos.length > 0 ? (
                <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                      <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={`Remove ${photo.name}`}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">Choose an appointment</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger id="branch" className="mt-1.5">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.city} value={l.city}>
                          {l.city} — {l.detail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="mt-1.5"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label>Time slot</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        time === slot ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent/40",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <Label>Priority</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as "Standard" | "Express")}
                  className="mt-1.5 grid gap-3 sm:grid-cols-2"
                >
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4", priority === "Standard" ? "border-accent bg-accent/5" : "border-border")}>
                    <RadioGroupItem value="Standard" id="priority-standard" />
                    <div>
                      <p className="font-medium">Standard</p>
                      <p className="text-xs text-muted-foreground">Regular queue turnaround</p>
                    </div>
                  </label>
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4", priority === "Express" ? "border-accent bg-accent/5" : "border-border")}>
                    <RadioGroupItem value="Express" id="priority-express" />
                    <div>
                      <p className="font-medium">Express</p>
                      <p className="text-xs text-muted-foreground">Priority handling, extra fee</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">Review & confirm</h2>
              <div className="mt-5 space-y-3 rounded-xl bg-secondary/50 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-medium">{device?.label} · {model || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Problem</span><span className="font-medium">{problem?.label ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photos</span><span className="font-medium">{photos.length} attached</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Appointment</span><span className="font-medium">{branch || "—"} · {date || "—"} · {time || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-medium">{priority}</span></div>
              </div>
              <Separator className="my-5" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          {errors[step] ? (
            <p className="mt-4 text-sm text-destructive" role="alert">{errors[step]}</p>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="button" onClick={goNext} disabled={Boolean(errors[step])} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {step === steps.length - 1 ? "Confirm booking" : "Next"}
              {step !== steps.length - 1 ? <ChevronRight className="ml-1 h-4 w-4" /> : null}
            </Button>
          </div>
        </Card>
      </section>
    </PublicShell>
  );
}
