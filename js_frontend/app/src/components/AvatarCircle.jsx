const COLORS = [
  ["from-violet-400", "to-purple-600"],
  ["from-pink-400", "to-rose-600"],
  ["from-cyan-400", "to-blue-600"],
  ["from-emerald-400", "to-teal-600"],
  ["from-amber-400", "to-orange-600"],
  ["from-fuchsia-400", "to-pink-600"],
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function AvatarCircle({ name = "?", size = "md", className = "" }) {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const idx = hashString(name) % COLORS.length;
  const [from, to] = COLORS[idx];

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full bg-gradient-to-br ${from} ${to}
        flex items-center justify-center font-bold text-white
        ring-2 ring-white/10
        ${className}
      `}
    >
      {name[0]?.toUpperCase() || "?"}
    </div>
  );
}
