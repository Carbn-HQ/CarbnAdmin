import { useState } from "react";
import { X, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateBetaApplicationStatus } from "../../api/betaApplicationsApi";
import { getApiErrorMessage } from "../../utils/apiError";
import type { BetaStatus } from "../../types/application";

const statusOptions: { value: BetaStatus; label: string }[] = [
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "invited", label: "Invited" },
  { value: "active", label: "Active" },
  { value: "declined", label: "Declined" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
];

const schema = z.object({
  betaStatus: z.enum(["pending_review", "approved", "invited", "active", "declined", "suspended", "completed"]),
  reviewNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UpdateStatusModalProps {
  applicationId: string;
  currentStatus: BetaStatus;
  applicantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateStatusModal({
  applicationId,
  currentStatus,
  applicantName,
  onClose,
  onSuccess,
}: UpdateStatusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { betaStatus: currentStatus },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateBetaApplicationStatus({
        applicationId,
        betaStatus: data.betaStatus,
        reviewNotes: data.reviewNotes,
      });

      setSuccessMsg(response.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update status."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-2xl w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Update Status</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Update beta status for <span className="font-medium text-[hsl(var(--foreground))]">{applicantName}</span>.
          </p>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">New Status</label>
            <div className="relative">
              <select
                {...register("betaStatus")}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
              Review Notes <span className="text-[hsl(var(--muted-foreground))]">(optional)</span>
            </label>
            <textarea
              {...register("reviewNotes")}
              rows={3}
              placeholder="Reason for this status change…"
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

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
              {isLoading ? "Saving…" : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
