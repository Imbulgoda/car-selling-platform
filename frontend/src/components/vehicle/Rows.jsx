export function SimpleRow({ label, value }) {
  return (
    <div className="text-[14px] text-[#0d3778]">
      <span className="font-semibold text-[#0d3778]">•</span>{" "}
      <span className="font-bold">{label} :</span>{" "}
      <span className="font-normal">{String(value)}</span>
    </div>
  );
}

export function BulletRow({ label, value }) {
  return (
    <div className="text-[14px] text-[#0d3778]">
      <span className="font-semibold text-[#0d3778]">•</span>{" "}
      <span className="font-bold">{label} :</span>{" "}
      <span className="font-normal">{String(value)}</span>
    </div>
  );
}

export function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-3 rounded-md border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
