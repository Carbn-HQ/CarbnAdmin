import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Leaf,
  LifeBuoy,
} from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { getSupportUnreadCount, notifySupportUnread } from "../../api/supportApi";
import { connectRealtime } from "../../lib/realtime";
import { getAdminAccessToken } from "../../utils/tokenStorage";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/applications", icon: Users, label: "Applications" },
  { to: "/admin/support", icon: LifeBuoy, label: "Support" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadSupport, setUnreadSupport] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await getSupportUnreadCount();
        setUnreadSupport(response.data?.unread || 0);
      } catch {
        setUnreadSupport(0);
      }
    };

    void loadCount();
    const timer = window.setInterval(() => {
      void loadCount();
    }, 60000);

    const onUnread = (event: Event) => {
      const unread = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(unread)) {
        setUnreadSupport(unread);
      }
    };

    window.addEventListener("carbn-support-unread", onUnread);

    const token = getAdminAccessToken();
    const disconnect = token
      ? connectRealtime({
          role: "admin",
          token,
          onEvent: (event, payload) => {
            if (typeof payload.unread === "number") {
              setUnreadSupport(payload.unread);
              notifySupportUnread(payload.unread);
            }
            window.dispatchEvent(
              new CustomEvent("carbn-support-event", { detail: { event, payload } })
            );
          },
        })
      : undefined;

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("carbn-support-unread", onUnread);
      disconnect?.();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = admin
    ? `${admin.first_name?.[0] ?? ""}${admin.last_name?.[0] ?? ""}`.toUpperCase()
    : "A";

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">CARBN</span>
            <p className="text-[hsl(var(--sidebar-foreground))] text-xs opacity-70">Admin Portal</p>
          </div>
          <button
            className="ml-auto lg:hidden text-[hsl(var(--sidebar-foreground))] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-[hsl(var(--sidebar-primary))] text-white"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {label === "Support" && unreadSupport > 0 ? (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                      {unreadSupport}
                    </span>
                  ) : null}
                  {isActive && <ChevronRight className="w-3 h-3" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {admin ? `${admin.first_name} ${admin.last_name}` : "Admin"}
              </p>
              <p className="text-[hsl(var(--sidebar-foreground))] text-xs opacity-70 truncate">
                {admin?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-shrink-0">
          <button
            className="lg:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono bg-[hsl(var(--muted))] px-2 py-1 rounded">
            Founding Beta
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
