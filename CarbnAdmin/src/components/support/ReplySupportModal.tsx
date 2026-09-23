import { useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { replyAdminSupportRequest, type AdminSupportRequest } from "../../api/supportApi";
import { getApiErrorMessage } from "../../utils/apiError";

interface ReplySupportModalProps {
  enquiry: AdminSupportRequest;
  onClose: () => void;
  onSuccess: (unread: number, request: AdminSupportRequest) => void;
}

export default function ReplySupportModal({
  enquiry,
  onClose,
  onSuccess,
}: ReplySupportModalProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 2) {
      setError("Please enter a reply.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await replyAdminSupportRequest(enquiry.id, message.trim());
      setSuccessMsg(response.message || "Reply sent.");
      setTimeout(() => {
        onSuccess(response.data.unread, response.data.request);
        onClose();
      }, 800);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the reply."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-2xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Reply to enquiry</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm">
            <p className="font-medium text-[hsl(var(--foreground))]">
              {enquiry.email || "Unknown email"}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {enquiry.category_label}
            </p>
            <p className="mt-2 text-[hsl(var(--foreground))] whitespace-pre-wrap">{enquiry.message}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
              Your reply
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              placeholder="Write a reply. This is emailed to the member and shown in their dashboard."
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
              {isLoading ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
