import { useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { manuallyAddApprovedBetaUser, type ManualApplicationPayload } from "../../api/betaApplicationsApi";
import { getApiErrorMessage } from "../../utils/apiError";

const schema = z.object({
  email: z.string().email("Valid email required"),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  notes: z.string().optional(),
  send_invitation: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ManualApplicationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManualApplicationModal({ onClose, onSuccess }: ManualApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { send_invitation: true },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await manuallyAddApprovedBetaUser(data as ManualApplicationPayload);
      setSuccessMsg(response.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add beta user."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-2xl w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Add Beta User Manually</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">First Name</label>
              <input
                {...register("first_name")}
                type="text"
                placeholder="James"
                className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {errors.first_name && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Last Name</label>
              <input
                {...register("last_name")}
                type="text"
                placeholder="Doe"
                className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {errors.last_name && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="user@example.com"
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            {errors.email && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
              Notes <span className="text-[hsl(var(--muted-foreground))]">(optional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Internal notes…"
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("send_invitation")}
              type="checkbox"
              className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
            />
            <span className="text-sm text-[hsl(var(--foreground))]">Send invitation email immediately</span>
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-[hsl(var(--status-declined-bg))] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-declined))] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[hsl(var(--status-declined))]">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-[hsl(var(--status-approved-bg))] rounded-lg">
              <CheckCircle className="w-4 h-4 text-[hsl(var(--status-approved))] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[hsl(var(--status-approved))]">{successMsg}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="flex-1 px-4 py-2 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Adding…" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
