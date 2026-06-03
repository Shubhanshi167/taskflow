const Avatar = ({ user, size = 'md', showTooltip = false, className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' };
  const initial = user?.username?.[0]?.toUpperCase() || '?';
  return (
    <div
      title={showTooltip ? user?.username : undefined}
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: user?.avatarColor || '#6366f1' }}
    >
      {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.username} /> : initial}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <div key={u._id || i} style={{ zIndex: shown.length - i }}>
          <Avatar user={u} size={size} showTooltip />
        </div>
      ))}
      {extra > 0 && (
        <div className={`w-8 h-8 rounded-full bg-white/10 border-2 border-[#0a0d1a] flex items-center justify-center text-xs text-white/70 z-0`}>
          +{extra}
        </div>
      )}
    </div>
  );
};

export default Avatar;