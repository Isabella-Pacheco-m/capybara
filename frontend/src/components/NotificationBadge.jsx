export default function NotificationBadge({ count, brandColors }) {
  if (!count || count === 0) return null;

  return (
    <span 
      className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full"
      style={{ backgroundColor: brandColors.accent }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}