import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MiniSparklineProps {
  data: { value: number }[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

export function MiniSparkline({
  data,
  width = 80,
  height = 24,
  color = "currentColor",
  showArea = true,
  className,
}: MiniSparklineProps) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return { line: "", area: "" };

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const padding = 2;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const points = values.map((value, index) => ({
      x: padding + (index / (values.length - 1)) * innerWidth,
      y: padding + innerHeight - ((value - min) / range) * innerHeight,
    }));

    // Create smooth curve using cardinal spline
    const line = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      
      const prev = points[i - 1];
      const cp1x = prev.x + (point.x - prev.x) / 3;
      const cp2x = prev.x + (point.x - prev.x) * 2 / 3;
      
      return `${acc} C ${cp1x},${prev.y} ${cp2x},${point.y} ${point.x},${point.y}`;
    }, "");

    const area = `${line} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { line, area };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div 
        className={cn("flex items-center justify-center text-muted-foreground", className)}
        style={{ width, height }}
      >
        <span className="text-[10px]">No data</span>
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn("overflow-visible", className)}
    >
      {showArea && (
        <path
          d={pathData.area}
          fill={color}
          opacity={0.15}
        />
      )}
      <path
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
