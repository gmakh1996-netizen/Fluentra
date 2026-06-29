"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  Sparkles,
  Mic,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const weekly = [
  { day: "Mon", xp: 120, minutes: 18 },
  { day: "Tue", xp: 210, minutes: 32 },
  { day: "Wed", xp: 90, minutes: 12 },
  { day: "Thu", xp: 320, minutes: 41 },
  { day: "Fri", xp: 260, minutes: 28 },
  { day: "Sat", xp: 410, minutes: 55 },
  { day: "Sun", xp: 180, minutes: 22 },
];

const chartConfig = {
  xp: { label: "XP earned", color: "var(--chart-1)" },
  minutes: { label: "Minutes", color: "var(--chart-3)" },
} satisfies ChartConfig;

const learners = [
  { name: "Mariam K.", lang: "English", level: "B2", tier: "Pro", streak: 24 },
  { name: "Luca R.", lang: "Japanese", level: "A2", tier: "Ultimate", streak: 71 },
  { name: "Sofia M.", lang: "French", level: "C1", tier: "Free", streak: 5 },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <Reveal>
          <Badge variant="gradient" className="mb-3">
            <Sparkles /> Design System
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Fluentra <span className="text-gradient">design language</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Tokens, typography, motion and the full component library — the foundation every
            marketing and dashboard surface is built on.
          </p>
        </Reveal>
        <ModeToggle />
      </header>

      <div className="mt-16 space-y-20">
        {/* Colors */}
        <Section title="Colors" description="Brand palette and semantic surface tokens.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "Primary", className: "bg-primary text-primary-foreground" },
              { name: "Accent", className: "bg-accent text-accent-foreground" },
              { name: "Cyan", className: "bg-brand-cyan text-white" },
              { name: "Brand", className: "bg-brand-gradient text-white" },
              { name: "Success", className: "bg-success text-success-foreground" },
              { name: "Warning", className: "bg-warning text-warning-foreground" },
              { name: "Info", className: "bg-info text-info-foreground" },
              { name: "Destructive", className: "bg-destructive text-destructive-foreground" },
            ].map((c) => (
              <div
                key={c.name}
                className={`flex h-20 items-end rounded-lg p-3 text-sm font-medium shadow-sm ${c.className}`}
              >
                {c.name}
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" description="Plus Jakarta Sans for display, Inter for UI/body.">
          <div className="space-y-3">
            <p className="font-display text-5xl font-bold tracking-tight">Speak the world</p>
            <p className="font-display text-3xl font-semibold">Heading · Plus Jakarta Sans</p>
            <p className="text-lg">Body large — Inter, the workhorse UI typeface.</p>
            <p className="text-sm text-muted-foreground">
              Muted small text for captions, hints and metadata.
            </p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="Variants and sizes, including the premium gradient CTA.">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gradient">
              <Sparkles /> Start learning free
            </Button>
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Delete</Button>
            <Button disabled>
              <Spinner /> Loading
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl" variant="gradient">
              Extra large
            </Button>
            <Button size="icon" variant="outline" aria-label="Record">
              <Mic />
            </Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="gradient">Pro</Badge>
            <Badge variant="secondary">A1</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Completed</Badge>
            <Badge variant="warning">Limited</Badge>
            <Badge variant="info">New</Badge>
            <Badge variant="destructive">Expired</Badge>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs & forms">
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invalid">Invalid state</Label>
              <Input id="invalid" aria-invalid defaultValue="not-an-email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Message</Label>
              <Textarea id="bio" placeholder="Tell the AI tutor your goal…" />
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <RevealGroup className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "AI Tutor", body: "Converse naturally and get instant corrections." },
              { title: "Pronunciation", body: "Per-phoneme scoring with native comparison." },
              { title: "Progress", body: "XP, streaks and adaptive daily missions." },
            ].map((f) => (
              <Reveal key={f.title} preset="fade-up">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{f.title}</CardTitle>
                    <CardAction>
                      <Badge variant="secondary">New</Badge>
                    </CardAction>
                    <CardDescription>{f.body}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" size="sm">
                      Learn more
                    </Button>
                  </CardFooter>
                </Card>
              </Reveal>
            ))}
          </RevealGroup>
        </Section>

        {/* Alerts */}
        <Section title="Alerts">
          <div className="grid gap-3">
            <Alert variant="info">
              <Info />
              <AlertTitle>New languages added</AlertTitle>
              <AlertDescription>Georgian and Turkish are now available.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <CheckCircle2 />
              <AlertTitle>Lesson complete</AlertTitle>
              <AlertDescription>You earned 120 XP and kept your 24-day streak.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>Daily limit approaching</AlertTitle>
              <AlertDescription>2 of 10 free AI messages remaining today.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Microphone blocked</AlertTitle>
              <AlertDescription>Enable mic access to use voice practice.</AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* Avatars + loaders */}
        <Section title="Avatars, loaders & toasts">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex -space-x-3">
              <Avatar className="ring-2 ring-card">
                <AvatarImage src="https://i.pravatar.cc/80?img=1" alt="" />
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <Avatar className="ring-2 ring-card">
                <AvatarFallback className="bg-brand-gradient text-white">LR</AvatarFallback>
              </Avatar>
              <Avatar className="ring-2 ring-card">
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center gap-3">
              <Spinner label="Loading" />
              <Spinner className="size-6 animate-spin-slow text-primary" />
            </div>
            <div className="w-48 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Button
              variant="outline"
              onClick={() => toast.success("Vocabulary saved", { description: "Added “fluent” to your deck." })}
            >
              Show toast
            </Button>
          </div>
        </Section>

        {/* Overlays: dialog, tooltip, dropdown */}
        <Section title="Overlays & menus">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade to Pro</DialogTitle>
                  <DialogDescription>
                    Unlock unlimited AI chat, voice conversation and the writing coach.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Maybe later</Button>
                  </DialogClose>
                  <Button variant="gradient">Upgrade</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Streak freeze available</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Message</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Copy</DropdownMenuItem>
                <DropdownMenuItem>Translate</DropdownMenuItem>
                <DropdownMenuItem>Explain grammar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs (navigation)">
          <Tabs defaultValue="casual" className="max-w-md">
            <TabsList className="w-full">
              <TabsTrigger value="casual">Casual</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
            </TabsList>
            <TabsContent value="casual" className="text-sm text-muted-foreground">
              Relaxed everyday conversation tuned to your CEFR level.
            </TabsContent>
            <TabsContent value="business" className="text-sm text-muted-foreground">
              Meetings, emails and professional vocabulary.
            </TabsContent>
            <TabsContent value="travel" className="text-sm text-muted-foreground">
              Airports, hotels, directions and dining.
            </TabsContent>
          </Tabs>
        </Section>

        {/* Charts */}
        <Section title="Charts" description="Recharts wired to the chart token palette.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly XP</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-56 w-full">
                  <AreaChart data={weekly} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <defs>
                      <linearGradient id="fillXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-xp)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-xp)" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="xp"
                      type="natural"
                      stroke="var(--color-xp)"
                      fill="url(#fillXp)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Minutes practiced</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-56 w-full">
                  <BarChart data={weekly} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="minutes" fill="var(--color-minutes)" radius={6} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Table */}
        <Section title="Data table">
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.map((l) => (
                  <TableRow key={l.name}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell>{l.lang}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={l.tier === "Free" ? "outline" : "gradient"}>{l.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {l.streak}🔥
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>

        <Separator />
        <p className="pb-8 text-center text-sm text-muted-foreground">
          Fluentra design system · built with shadcn/ui, Tailwind v4 & Framer Motion
        </p>
      </div>
    </main>
  );
}
