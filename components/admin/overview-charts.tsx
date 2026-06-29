"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface GrowthPoint { date: string; users: number }
interface UsagePoint { date: string; messages: number; voice: number }
interface TierPoint { name: string; value: number }

const PALETTE = ["#7c3aed", "#2563eb", "#059669", "#d97706"];

export function UserGrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey="users" fill="#7c3aed" radius={[4, 4, 0, 0]} name="New users" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UsageChart({ data }: { data: UsagePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey="messages" fill="#7c3aed" radius={[4, 4, 0, 0]} name="AI messages" />
        <Bar dataKey="voice" fill="#2563eb" radius={[4, 4, 0, 0]} name="Voice min" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TierPieChart({ data }: { data: TierPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value">
          {data.map((_entry, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
