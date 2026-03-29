import { Inbox, Search, ClipboardList, Users } from "lucide-react";

const ICONS = {
  inbox: Inbox,
  search: Search,
  clipboard: ClipboardList,
  users: Users,
};

export default function EmptyState({
  icon = "inbox",
  title = "No data yet",
  description = "",
}) {
  const Icon = ICONS[icon] || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-300" />
      </div>
      <p className="text-[14px] font-medium text-gray-500">{title}</p>
      {description && (
        <p className="text-[12px] text-gray-400 mt-1 text-center max-w-xs">{description}</p>
      )}
    </div>
  );
}
