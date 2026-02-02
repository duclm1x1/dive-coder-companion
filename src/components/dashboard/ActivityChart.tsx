import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartProps {
  title: string;
  data?: { time: string; value: number }[];
}

export function ActivityChart({ title, data }: ActivityChartProps) {
  const chartData = useMemo(() => {
    if (data) return data;
    // Generate mock data if none provided
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      value: Math.floor(Math.random() * 80 + 20),
    }));
  }, [data]);

  return (
    <div className="p-5 rounded-xl glass border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 10%)",
                border: "1px solid hsl(220 14% 20%)",
                borderRadius: "8px",
                boxShadow: "0 0 20px hsl(160 84% 39% / 0.2)",
              }}
              labelStyle={{ color: "hsl(210 40% 96%)" }}
              itemStyle={{ color: "hsl(160 84% 39%)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(160 84% 39%)"
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
