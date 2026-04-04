interface TrafficLightsProps {
  size?: "sm" | "md";
}

export function TrafficLights({ size = "md" }: TrafficLightsProps) {
  const dotClass = size === "sm" ? "w-2.5 h-2.5" : "size-3";
  return (
    <div className="flex gap-[6px]">
      <div
        className={`${dotClass} rounded-full bg-traffic-red border border-traffic-red-border/50`}
      />
      <div
        className={`${dotClass} rounded-full bg-traffic-yellow border border-traffic-yellow-border/50`}
      />
      <div
        className={`${dotClass} rounded-full bg-traffic-green border border-traffic-green-border/50`}
      />
    </div>
  );
}
