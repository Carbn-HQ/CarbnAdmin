import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Mail,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import ApplicationStatusBadge from "../components/applications/ApplicationStatusBadge";
import ApproveApplicationModal from "../components/applications/ApproveApplicationModal";
import UpdateStatusModal from "../components/applications/UpdateStatusModal";
import { useBetaApplication } from "../hooks/useBetaApplication";
import { resendBetaInvitation } from "../api/betaApplicationsApi";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatDate";
import {
  APPLICATION_FORM_FIELDS,
  LONG_APPLICATION_FIELDS,
  type ApplicationAnswer,
} from "../types/application";

const displayValue = (value: string | number | string[] | null | undefined) => {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "–";
  }
  if (value === null || value === undefined || String(value).trim() === "") {
    return "–";
  }
  return String(value);
};

const buildApplicationAnswers = (application: {
  email: string;
  first_name: string | null;
  last_name: string | null;
  application_answers?: ApplicationAnswer[];
  application_details?: Record<string, string | number | string[] | null>;
}): ApplicationAnswer[] => {
  const details = application.application_details || {};
  const fromApi = application.application_answers || [];
  const byId = new Map(fromApi.map((item) => [item.id, item]));

  const known = APPLICATION_FORM_FIELDS.map((field) => {
    const existing = byId.get(field.id);
    const fallback =
      field.id === "full_name"
        ? `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim()
        : details[field.id];
    return {
      id: field.id,
      label: existing?.label || field.label,
      value: existing?.value ?? fallback ?? null,
    };
  });

  const extras = [
    ...fromApi.filter((item) => !APPLICATION_FORM_FIELDS.some((field) => field.id === item.id)),
    ...Object.entries(details)
      .filter(
        ([key]) =>
          !APPLICATION_FORM_FIELDS.some((field) => field.id === key) &&
          !fromApi.some((item) => item.id === key)
      )
      .map(([id, value]) => ({
        id,
        label: id.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        value,
      })),
  ];

  return [
    { id: "email", label: "Email", value: application.email },
    ...known,
    ...extras,
  ];
};

export default function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { application, isLoading, error, refetch } = useBetaApplication(id);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!id) return;
    setIsResending(true);
    setResendMsg(null);
    setResendError(null);

    try {
      const response = await resendBetaInvitation(id);
      setResendMsg(response.message);
      await refetch();
    } catch (err) {
      setResendError(getApiErrorMessage(err, "Could not resend invitation."));
    } finally {
      setIsResending(false);
    }
  };

  const applicantName = application
    ? `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim() || application.email
    : "Applicant";
  const applicationAnswers = application ? buildApplicationAnswers(application) : [];
  const hasApplicationAnswers = applicationAnswers.some(
    (item) => item.id !== "email" && item.value !== null && item.value !== undefined && String(item.value).trim() !== ""
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-24 bg-[hsl(var(--muted))] rounded-xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/admin/applications")}
            className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-10 h-10 text-[hsl(var(--status-declined))] mb-3" />
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Application not found</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Link to="/admin/applications" className="hover:text-[hsl(var(--foreground))] flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Applications
          </Link>
          <span>/</span>
          <span className="text-[hsl(var(--foreground))]">{applicantName}</span>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {application.first_name?.[0] ?? application.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{applicantName}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{application.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <ApplicationStatusBadge status={application.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void refetch()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>

              {application.status === "approved" && (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {isResending ? "Sending…" : "Resend Invite"}
                </button>
              )}

              {application.status === "pending" && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>

          {resendMsg && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-[hsl(var(--status-approved-bg))] rounded-lg">
              <CheckCircle className="w-4 h-4 text-[hsl(var(--status-approved))] flex-shrink-0" />
              <p className="text-xs text-[hsl(var(--status-approved))]">{resendMsg}</p>
            </div>
          )}
          {resendError && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-[hsl(var(--status-declined-bg))] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-declined))] flex-shrink-0" />
              <p className="text-xs text-[hsl(var(--status-declined))]">{resendError}</p>
            </div>
          )}
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            Founding Fifty application
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            {application.application_submitted_at
              ? `Submitted ${formatDate(application.application_submitted_at)}`
              : hasApplicationAnswers
                ? "Answers received"
                : "The applicant has not completed the application form yet."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {applicationAnswers.map((item) => (
              <div
                key={item.id}
                className={LONG_APPLICATION_FIELDS.includes(item.id) ? "sm:col-span-2" : ""}
              >
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">{item.label}</p>
                <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">
                  {displayValue(item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              Registration details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Application ID", value: application.id, mono: true },
                { label: "Auth User ID", value: application.auth_user_id ?? "–", mono: true },
                { label: "Applied", value: formatDate(application.created_at) },
                { label: "Last Updated", value: formatDate(application.updated_at) },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">{label}</p>
                  <p className={`text-sm text-[hsl(var(--foreground))] ${mono ? "font-mono text-xs break-all" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              Status Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Approved", value: formatDate(application.approved_at) },
                { label: "Activated", value: formatDate(application.activated_at) },
                { label: "Declined", value: formatDate(application.declined_at) },
                { label: "Last login", value: formatDate(application.last_login_at) },
              ].map(({ label, value }) => (
                <div key={label} className={value === "–" ? "opacity-40" : ""}>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">{label}</p>
                  <p className="text-sm text-[hsl(var(--foreground))]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {application.review_notes && (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              Review Notes
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed italic">
              "{application.review_notes}"
            </p>
          </div>
        )}
      </div>

      {showApproveModal && (
        <ApproveApplicationModal
          applicationId={application.id}
          applicantName={applicantName}
          onClose={() => setShowApproveModal(false)}
          onSuccess={() => void refetch()}
        />
      )}

      {showDeclineModal && (
        <UpdateStatusModal
          applicationId={application.id}
          applicantName={applicantName}
          onClose={() => setShowDeclineModal(false)}
          onSuccess={() => void refetch()}
        />
      )}
    </AdminLayout>
  );
}
