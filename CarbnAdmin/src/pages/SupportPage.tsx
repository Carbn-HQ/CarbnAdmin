import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import ReplySupportModal from "../components/support/ReplySupportModal";
import {
  approveAdminEmailChangeRequest,
  getAdminEmailChangeRequests,
  getAdminSupportRequests,
  notifySupportUnread,
  openAdminEmailChangeRequest,
  openAdminSupportRequest,
  type AdminEmailChangeRequest,
  type AdminSupportRequest,
} from "../api/supportApi";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatDate";

type ReplyFilter = "all" | "unreplied" | "replied";
type SupportTab = "enquiries" | "email_changes";

const SUPPORT_CATEGORIES = [
  { id: "account_access", label: "Account/access" },
  { id: "technical_issue", label: "Technical issue" },
  { id: "coaching_issue", label: "Daniel/coaching issue" },
  { id: "data_privacy", label: "Data/privacy" },
  { id: "feedback", label: "Feedback/suggestion" },
  { id: "other", label: "Something else" },
];

const isReplied = (request: AdminSupportRequest) =>
  request.status === "replied" || Boolean(request.replies?.length);

export default function SupportPage() {
  const [tab, setTab] = useState<SupportTab>("enquiries");
  const [requests, setRequests] = useState<AdminSupportRequest[]>([]);
  const [emailChanges, setEmailChanges] = useState<AdminEmailChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminSupportRequest | null>(null);
  const [selectedChange, setSelectedChange] = useState<AdminEmailChangeRequest | null>(null);
  const [replying, setReplying] = useState<AdminSupportRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReplyFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [support, changes] = await Promise.all([
        getAdminSupportRequests(),
        getAdminEmailChangeRequests(),
      ]);
      setRequests(support.data.requests || []);
      setEmailChanges(changes.data.requests || []);
      notifySupportUnread(support.data.unread || changes.data.unread || 0);
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

  const replaceEmailChange = (next: AdminEmailChangeRequest) => {
    setEmailChanges((current) => {
      const exists = current.some((item) => item.id === next.id);
      return exists
        ? current.map((item) => (item.id === next.id ? next : item))
        : [next, ...current];
    });
    setSelectedChange((current) => (current?.id === next.id ? next : current));
  };

  useEffect(() => {
    void load();

    const onRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string; payload?: Record<string, unknown> }>)
        .detail;
      if (detail?.event === "support:new" || detail?.event === "support:updated") {
        const next = detail.payload?.request as AdminSupportRequest | undefined;
        if (next?.id) {
          replaceRequest(next);
        }
        return;
      }
      if (detail?.event === "email_change:new" || detail?.event === "email_change:updated") {
        const next = detail.payload?.request as AdminEmailChangeRequest | undefined;
        if (next?.id) {
          replaceEmailChange(next);
        }
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

  const openEmailChange = async (request: AdminEmailChangeRequest) => {
    setSelectedChange(request);
    if (request.opened) {
      return;
    }
    try {
      const response = await openAdminEmailChangeRequest(request.id);
      replaceEmailChange(response.data.request);
      notifySupportUnread(response.data.unread);
    } catch {
      setSelectedChange(request);
    }
  };

  const approveEmailChange = async (request: AdminEmailChangeRequest) => {
    setApprovingId(request.id);
    try {
      const response = await approveAdminEmailChangeRequest(request.id);
      replaceEmailChange(response.data.request);
      notifySupportUnread(response.data.unread);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not approve this email change."));
    } finally {
      setApprovingId(null);
    }
  };

  const byCategory = requests.filter(
    (enquiry) => categoryFilter === "all" || enquiry.category === categoryFilter
  );
  const repliedCount = byCategory.filter(isReplied).length;
  const unrepliedCount = byCategory.length - repliedCount;
  const byReply = requests.filter((enquiry) => {
    if (filter === "replied") {
      return isReplied(enquiry);
    }
    if (filter === "unreplied") {
      return !isReplied(enquiry);
    }
    return true;
  });
  const visibleRequests = byReply.filter(
    (enquiry) => categoryFilter === "all" || enquiry.category === categoryFilter
  );
  const filters: { id: ReplyFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: byCategory.length },
    { id: "unreplied", label: "Unreplied", count: unrepliedCount },
    { id: "replied", label: "Replied", count: repliedCount },
  ];
  const categoryFilters = [
    { id: "all", label: "All categories", count: byReply.length },
    ...SUPPORT_CATEGORIES.map((item) => ({
      id: item.id,
      label: item.label,
      count: byReply.filter((enquiry) => enquiry.category === item.id).length,
    })),
  ];
  const pendingEmailChanges = emailChanges.filter((item) => item.status === "pending").length;

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Support</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Read member enquiries, open them to clear the sidebar count, and review email changes.
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

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("enquiries")}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              tab === "enquiries"
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent"
                : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            Enquiries {requests.length}
          </button>
          <button
            type="button"
            onClick={() => setTab("email_changes")}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              tab === "email_changes"
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent"
                : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            Email change requests {pendingEmailChanges}
          </button>
        </div>

        {tab === "enquiries" ? (
          <>
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

            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategoryFilter(item.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    categoryFilter === item.id
                      ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-transparent"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {item.label} {item.count}
                </button>
              ))}
            </div>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
              {error && tab === "enquiries" ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--status-declined))]">{error}</p>
              ) : isLoading ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">Loading enquiries…</p>
              ) : requests.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
                  No support enquiries yet.
                </p>
              ) : visibleRequests.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
                  No enquiries match these filters.
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
          </>
        ) : (
          <>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 w-fit">
              <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{pendingEmailChanges}</p>
            </div>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
              {error && tab === "email_changes" ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--status-declined))]">{error}</p>
              ) : isLoading ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
                  Loading email change requests…
                </p>
              ) : emailChanges.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">
                  No email change requests yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))] text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        <th className="px-6 py-3 font-semibold">Current email</th>
                        <th className="px-4 py-3 font-semibold">New email</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailChanges.map((request) => (
                        <tr
                          key={request.id}
                          onClick={() => void openEmailChange(request)}
                          className={`border-b border-[hsl(var(--border))] last:border-0 cursor-pointer ${
                            selectedChange?.id === request.id
                              ? "bg-[hsl(var(--muted))]"
                              : "hover:bg-[hsl(var(--muted))]/60"
                          } ${request.opened ? "" : "font-medium"}`}
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              {!request.opened && request.status === "pending" ? (
                                <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-transparent flex-shrink-0" />
                              )}
                              <span className="text-[hsl(var(--foreground))]">{request.current_email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[hsl(var(--foreground))]">{request.new_email}</td>
                          <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                            {request.status_label}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {request.status === "pending" ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void approveEmailChange(request);
                                }}
                                disabled={approvingId === request.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
                              >
                                {approvingId === request.id ? "Approving…" : "Approve"}
                              </button>
                            ) : (
                              <span className="text-xs text-[hsl(var(--muted-foreground))]">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedChange ? (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Email change request
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[hsl(var(--foreground))]">
                      {selectedChange.full_name || selectedChange.first_name || selectedChange.current_email}
                    </h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {selectedChange.current_email} → {selectedChange.new_email}
                    </p>
                  </div>
                  {selectedChange.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => void approveEmailChange(selectedChange)}
                      disabled={approvingId === selectedChange.id}
                      className="px-3 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-50"
                    >
                      {approvingId === selectedChange.id ? "Approving…" : "Approve"}
                    </button>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Reason</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">
                    {selectedChange.reason}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
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
