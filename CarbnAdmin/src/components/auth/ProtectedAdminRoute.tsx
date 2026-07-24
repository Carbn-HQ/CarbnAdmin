import { Navigate, Outlet } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
