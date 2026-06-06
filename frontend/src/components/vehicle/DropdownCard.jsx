import { ChevronIcon } from "./Icons";

export default function DropdownCard({
  title,
  icon,
  open,
  onToggle,
  children,
}) {
  return (
    <div className="border-2 border-[#0b2b5a] rounded-2xl p-3 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[22px] font-semibold text-[#0b2b5a]">{title}</h2>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
