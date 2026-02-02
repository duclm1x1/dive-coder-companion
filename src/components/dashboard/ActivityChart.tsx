import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartProps {
  title: string;
  data?: { time: string; value: number }[];
}

export function ActivityChart({ title, data }: ActivityChartProps) {
  const chartData = useMemo(() => {
    if (data) return data;
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      value: Math.floor(Math.random() * 80 + 20),
    }));
  }, [data]);

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187 100% 42%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(187 100% 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 32% 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(222 47% 11%)" }}
              itemStyle={{ color: "hsl(187 100% 42%)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(187 100% 42%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
