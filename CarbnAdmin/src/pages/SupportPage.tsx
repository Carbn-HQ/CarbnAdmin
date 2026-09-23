import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import ReplySupportModal from "../components/support/ReplySupportModal";
import {
  getAdminSupportRequests,
  notifySupportUnread,
  openAdminSupportRequest,
  type AdminSupportRequest,
} from "../api/supportApi";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatDate";

type ReplyFilter = "all" | "unreplied" | "replied";

const isReplied = (request: AdminSupportRequest) =>
  request.status === "replied" || Boolean(request.replies?.length);

export default function SupportPage() {
  const [requests, setRequests] = useState<AdminSupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminSupportRequest | null>(null);
  const [replying, setReplying] = useState<AdminSupportRequest | null>(null);
  const [filter, setFilter] = useState<ReplyFilter>("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminSupportRequests();
      setRequests(response.data.requests || []);
      notifySupportUnread(response.data.unread || 0);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load support enquiries."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const replaceRequest = (next: AdminSupportRequest) => {
    setRequests((current) => {
      const exists = current.some((item) => item.id === next.id);
      return exists
        ? current.map((item) => (item.id === next.id ? next : item))
        : [next, ...current];
    });
    setSelected((current) => (current?.id === next.id ? next : current));
  };

  useEffect(() => {
    void load();

    const onRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string; payload?: Record<string, unknown> }>)
        .detail;
      const next = detail?.payload?.request as AdminSupportRequest | undefined;
      if (!next?.id) {
        return;
      }
      if (detail?.event === "support:new" || detail?.event === "support:updated") {
        replaceRequest(next);
      }
    };

    window.addEventListener("carbn-support-event", onRealtime);
    return () => window.removeEventListener("carbn-support-event", onRealtime);
  }, [load]);

  const openEnquiry = async (enquiry: AdminSupportRequest) => {
    setSelected(enquiry);
    if (enquiry.opened) {
      return;
    }
    try {
      const response = await openAdminSupportRequest(enquiry.id);
      replaceRequest(response.data.request);
      notifySupportUnread(response.data.unread);
    } catch {
      setSelected(enquiry);
    }
  };

  const openReply = async (enquiry: AdminSupportRequest) => {
    await openEnquiry(enquiry);
    setReplying(enquiry);
  };

  const repliedCount = requests.filter(isReplied).length;
  const unrepliedCount = requests.length - repliedCount;
  const visibleRequests = requests.filter((enquiry) => {
    if (filter === "replied") {
      return isReplied(enquiry);
    }
    if (filter === "unreplied") {
      return !isReplied(enquiry);
    }
    return true;
  });
  const filters: { id: ReplyFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: requests.length },
    { id: "unreplied", label: "Unreplied", count: unrepliedCount },
    { id: "replied", label: "Replied", count: repliedCount },
  ];

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Support</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Read member enquiries, open them to clear the sidebar count, and reply by email.
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Unreplied</p>
            <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{unrepliedCount}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Replied</p>
            <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{repliedCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filter === item.id
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              {item.label} {item.count}
            </button>
          ))}
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          {error ? (
            <p className="px-6 py-8 text-sm text-[hsl(var(--status-declined))]">{error}</p>
          ) : isLoading ? (
            <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">Loading enquiries…</p>
          ) : requests.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
              No support enquiries yet.
            </p>
          ) : visibleRequests.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
              {filter === "replied" ? "No replied enquiries." : "No unreplied enquiries."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      onClick={() => void openEnquiry(enquiry)}
                      className={`border-b border-[hsl(var(--border))] last:border-0 cursor-pointer ${
                        selected?.id === enquiry.id
                          ? "bg-[hsl(var(--muted))]"
                          : "hover:bg-[hsl(var(--muted))]/60"
                      } ${enquiry.opened ? "" : "font-medium"}`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {!enquiry.opened ? (
                            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-transparent flex-shrink-0" />
                          )}
                          <span className="text-[hsl(var(--foreground))]">
                            {enquiry.email || "Unknown email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--foreground))]">{enquiry.category_label}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {formatDate(enquiry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {enquiry.status_label}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void openReply(enquiry);
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
                        >
                          {isReplied(enquiry) ? "Reply again" : "Reply"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected ? (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Enquiry
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[hsl(var(--foreground))]">
                  {selected.email || "Unknown email"}
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {selected.full_name || selected.first_name || "Member"} · {selected.category_label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void openReply(selected)}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              >
                {isReplied(selected) ? "Reply again" : "Reply"}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">{selected.message}</p>
            {selected.replies?.length ? (
              <div className="space-y-3 pt-2 border-t border-[hsl(var(--border))]">
                <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Replies
                </p>
                {selected.replies.map((reply) => (
                  <div key={reply.id} className="rounded-lg bg-[hsl(var(--muted))] px-4 py-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {reply.sender === "admin" ? "CARBN team" : "Member"} · {formatDate(reply.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {replying ? (
        <ReplySupportModal
          enquiry={replying}
          onClose={() => setReplying(null)}
          onSuccess={(unread, request) => {
            replaceRequest(request);
            notifySupportUnread(unread);
          }}
        />
      ) : null}
    </AdminLayout>
  );
}
