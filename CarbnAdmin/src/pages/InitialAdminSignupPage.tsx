import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Eye, EyeOff, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { signupInitialAdmin, type InitialAdminSignupPayload } from "../api/adminAuthApi";
import { getApiErrorMessage } from "../utils/apiError";

const schema = z.object({
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Minimum 8 characters"),
  bootstrap_secret: z.string().min(1, "Bootstrap secret required"),
});

type FormValues = z.infer<typeof schema>;

export default function InitialAdminSignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await signupInitialAdmin(data as InitialAdminSignupPayload);
      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create admin account."));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--primary))]">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Initial Admin Setup</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Create the first super admin account</p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-[hsl(var(--status-suspended-bg))] border border-[hsl(var(--status-suspended))]/30 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-[hsl(var(--status-suspended))] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[hsl(var(--status-suspended))] leading-relaxed">
            This route should be disabled after the first admin is created. Only use this once to bootstrap your admin account.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 p-6 bg-[hsl(var(--status-approved-bg))] border border-[hsl(var(--status-approved))]/30 rounded-xl text-center">
            <CheckCircle className="w-8 h-8 text-[hsl(var(--status-approved))]" />
            <p className="text-sm font-medium text-[hsl(var(--status-approved))]">
              Admin account created successfully! Redirecting to login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">First Name</label>
                <input {...register("first_name")} type="text" placeholder="James" className={inputClass} />
                {errors.first_name && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Last Name</label>
                <input {...register("last_name")} type="text" placeholder="Ewoenam" className={inputClass} />
                {errors.last_name && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Email</label>
              <input {...register("email")} type="email" placeholder="admin@carbn.com" className={inputClass} />
              {errors.email && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" className={inputClass + " pr-10"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Bootstrap Secret</label>
              <div className="relative">
                <input {...register("bootstrap_secret")} type={showSecret ? "text" : "password"} placeholder="Your bootstrap secret key" className={inputClass + " pr-10 font-mono"} />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.bootstrap_secret && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.bootstrap_secret.message}</p>}
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
              {isLoading ? "Creating account…" : "Create Admin Account"}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-[hsl(var(--primary))] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
