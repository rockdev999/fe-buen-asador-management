import { NAV_SECTIONS } from "@/config/navigation/navSections";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";
import { useUiStore } from "@/stores/ui.store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user, hasRole } = useAuth();

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || hasRole(...item.roles),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "flex flex-col bg-inkblack transition-all duration-200 flex-shrink-0",
        sidebarOpen ? "w-56" : "w-14",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 h-14 border-b border-white/8">
        <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-medium">BA</span>
        </div>
        {sidebarOpen && (
          <span className="text-white text-sm font-medium whitespace-nowrap">
            Buen Asador
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {sidebarOpen && (
              <p className="px-3.5 pt-3 pb-1 text-[10px] font-medium text-white/30 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                    isActive
                      ? "text-brand-light bg-brand/20 border-r-2 border-brand"
                      : "text-white/60 hover:text-white hover:bg-white/6",
                  )
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="mx-3 mb-2 flex items-center justify-center h-8 rounded-md text-white/40 hover:text-white hover:bg-white/6 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Footer — user info */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-t border-white/8">
        <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-medium">
            {user ? getInitials(user.name) : "U"}
          </span>
        </div>
        {sidebarOpen && user && (
          <div className="overflow-hidden">
            <p className="text-white text-xs font-medium truncate">
              {user.name}
            </p>
            <p className="text-white/40 text-[10px] truncate">{user.rol}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
