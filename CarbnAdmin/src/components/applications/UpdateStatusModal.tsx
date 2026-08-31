import { useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { declineBetaApplication } from "../../api/betaApplicationsApi";
import { getApiErrorMessage } from "../../utils/apiError";

const schema = z.object({
  reviewNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UpdateStatusModalProps {
  applicationId: string;
  applicantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateStatusModal({
  applicationId,
  applicantName,
  onClose,
  onSuccess,
}: UpdateStatusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await declineBetaApplication({
        applicationId,
        reviewNotes: data.reviewNotes,
      });

      setSuccessMsg(response.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not decline the application."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-2xl w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Decline Application</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Decline <span className="font-medium text-[hsl(var(--foreground))]">{applicantName}</span>. They will receive an update email.
          </p>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
              Review Notes <span className="text-[hsl(var(--muted-foreground))]">(optional)</span>
            </label>
            <textarea
              {...register("reviewNotes")}
              rows={3}
              placeholder="Internal reason for declining…"
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
              className="flex-1 px-4 py-2 text-sm font-medium bg-[hsl(var(--status-declined))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Declining…" : "Decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
