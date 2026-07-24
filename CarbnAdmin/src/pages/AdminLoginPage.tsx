import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { getApiErrorMessage } from "../utils/apiError";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) {
    navigate("/admin/dashboard");
    return null;
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data as FormValues & { email: string; password: string });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--sidebar-background))] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--sidebar-primary))] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">CARBN</span>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--sidebar-accent))] border border-[hsl(var(--sidebar-border))]">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sidebar-primary))] animate-pulse" />
            <span className="text-xs font-medium text-[hsl(var(--sidebar-foreground))]">Founding Beta Program</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Manage your<br />beta community.
          </h1>
          <p className="text-[hsl(var(--sidebar-foreground))] text-base leading-relaxed">
            Review applications, track onboarding progress, and grow your founding beta cohort from one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Review applications", desc: "Approve or decline in one click" },
            { label: "Track metrics", desc: "Real-time funnel analytics" },
            { label: "Send invitations", desc: "Automated email delivery" },
            { label: "Manage status", desc: "Full lifecycle control" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-[hsl(var(--sidebar-accent))] border border-[hsl(var(--sidebar-border))]">
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[hsl(var(--sidebar-foreground))] text-xs mt-0.5 opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-[hsl(var(--foreground))] text-lg font-bold">CARBN</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Welcome back</h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Sign in to the admin portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@carbn.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition"
              />
              {errors.email && (
                <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[hsl(var(--status-declined-bg))] border border-[hsl(var(--status-declined))]/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-declined))] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[hsl(var(--status-declined))]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
            First time?{" "}
            <Link to="/admin/setup" className="text-[hsl(var(--primary))] hover:underline font-medium">
              Set up admin account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
