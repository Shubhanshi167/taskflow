import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  '#6D6AFE',
  '#8B5CF6',
  '#14B8A6',
  '#F59E0B',
  '#22C55E',
  '#3B82F6',
  '#EC4899',
  '#EF4444',
];

/* ── shared input class (matches AddTaskModal) ── */
const field = `
  w-full
  rounded-[14px]
  border border-white/[0.07]
  bg-[#111827]
  px-4 py-[11px]
  text-[14px] text-white
  placeholder:text-white/25
  outline-none
  transition-all
  focus:border-indigo-500/40
  focus:ring-2 focus:ring-indigo-500/10
`;

const CreateTaskModal = ({ onClose, onCreate }) => {
  const [name,          setName]          = useState('');
  const [description,   setDescription]   = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description, color: selectedColor });
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/80 backdrop-blur-[6px]
        p-4
      "
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Modal shell ── */}
      <div
        className="
          w-full max-w-[420px]
          rounded-[22px]
          border border-[#1a2438]
          bg-[#0c1322]
          shadow-[0_24px_72px_rgba(0,0,0,0.6)]
        "
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-1">
          <h2 className="text-white text-[17px] font-bold tracking-[-0.02em]">
            New Workspace
          </h2>

          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-[10px]
              bg-white/[0.04] border border-white/[0.05]
              flex items-center justify-center
              text-white/35 hover:text-white
              hover:bg-white/[0.08]
              transition-all
            "
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-4">

          {/* Workspace name */}
          <input
            type="text"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className={field}
          />

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${field} resize-none min-h-[100px]`}
          />

          {/* Color picker */}
          <div>
            <p className="text-[13px] font-medium text-white/55 mb-3">
              Color
            </p>

            <div className="flex items-center gap-2.5 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="
                    w-8 h-8 rounded-full
                    transition-all duration-150
                    hover:scale-110
                  "
                  style={{
                    background: color,
                    outline: selectedColor === color
                      ? `2.5px solid ${color}`
                      : '2.5px solid transparent',
                    outlineOffset: '2.5px',
                    boxShadow: selectedColor === color
                      ? `0 0 10px ${color}55`
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 h-[46px]
                rounded-[14px]
                border border-white/[0.06]
                bg-white/[0.03]
                text-[14px] text-white/75 font-semibold
                transition-all
                hover:bg-white/[0.07] hover:text-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                flex-1 h-[46px]
                rounded-[14px]
                bg-[#5B5CF0]
                text-[14px] text-white font-semibold
                shadow-[0_8px_28px_rgba(91,92,240,0.32)]
                transition-all
                hover:bg-[#6D6EF5]
                hover:shadow-[0_8px_32px_rgba(91,92,240,0.45)]
              "
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;