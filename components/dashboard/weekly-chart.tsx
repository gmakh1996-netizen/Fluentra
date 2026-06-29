"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: { day: string; minutes: number }[];
}

const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);

export function WeeklyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.5)", radius: 6 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
                <p className="font-semibold">{label}</p>
                <p className="text-muted-foreground">{payload[0]?.value} min</p>
              </div>
            );
          }}
        />
        <Bar dataKey="minutes" radius={[6, 6, 4, 4]}>
          {data.map((entry) => (
            <Cell
              key={entry.day}
              fill={entry.day === today ? "#4f46e5" : "var(--color-bar, #c7d2fe)"}
              opacity={entry.day === today ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
