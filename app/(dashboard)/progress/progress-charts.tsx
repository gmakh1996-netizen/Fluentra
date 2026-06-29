"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; messages: number; voice: number }[];
}

export function ProgressCharts({ data }: Props) {
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
        <Bar dataKey="voice"    fill="#2563eb" radius={[4, 4, 0, 0]} name="Voice min" />
      </BarChart>
    </ResponsiveContainer>
  );
}
