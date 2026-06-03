const configs = {
  low:    { label: 'LOW',    bg: 'bg-slate-700', text: 'text-slate-300', dot: 'bg-slate-400' },
  medium: { label: 'MEDIUM', bg: 'bg-yellow-900/60', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  high:   { label: 'HIGH',   bg: 'bg-orange-900/60', text: 'text-orange-400', dot: 'bg-orange-400' },
  urgent: { label: 'URGENT', bg: 'bg-red-900/60',    text: 'text-red-400',    dot: 'bg-red-400' },
};

const PriorityBadge = ({ priority, size = 'sm' }) => {
  const c = configs[priority] || configs.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default PriorityBadge;