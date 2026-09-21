"use client";

import { useEffect, useState } from "react";
import GrowthAnalyzer from "@/components/GrowthAnalyzer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type GrowthAction = {
  id: string;
  actionType: string;
  title: string;
  description: string;
  targetProduct?: string;
  suggestedProduct?: string | null;
  status: "PROPOSED" | "APPROVED" | "EXECUTED" | "REJECTED";
  requiresApproval: boolean;

  payments?: {
  id: string;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentLinkId?: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}[];

  createdAt: string;
  updatedAt: string;

  executionResult?: {
    success: boolean;
    executionType: string;
    message: string;
    recommendation?: {
      targetProduct: string;
      suggestedProduct: string;
      placement: string;
    };
    paymentLink?: {
     id: string;
    shortUrl: string;
    status: string;
   };
  } | null;
};

export default function Home() {
  const [actions, setActions] = useState<GrowthAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [updatingAction, setUpdatingAction] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/growth/actions`
      );

      const data = await response.json();

      if (data.success) {
        setActions(data.actions);
      }
    } catch (error) {
      console.error("Failed to fetch actions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const updateActionStatus = async (
    id: string,
    action: "approve" | "reject" | "execute"
  ) => {
    try {
      setUpdatingAction(id);

      const response = await fetch(
        `${API_URL}/api/growth/action/${id}/${action}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Action failed");
      }

      setActions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data.action,

                // Store execution result returned by backend
                executionResult:
                  action === "execute"
                    ? data.result ?? null
                    : item.executionResult ?? null,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update action:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update growth action"
      );
    } finally {
      setUpdatingAction(null);
    }
  };

  const proposed = actions.filter(
    (action) => action.status === "PROPOSED"
  ).length;

  const approved = actions.filter(
    (action) => action.status === "APPROVED"
  ).length;

  const executed = actions.filter(
    (action) => action.status === "EXECUTED"
  ).length;

  const rejected = actions.filter(
    (action) => action.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            GrowthPilot AI
          </h1>

          <p className="mt-2 text-gray-600">
            AI-powered growth recommendations for your business.
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Proposed"
            value={loading ? "-" : proposed}
          />

          <StatCard
            title="Approved"
            value={loading ? "-" : approved}
          />

          <StatCard
            title="Executed"
            value={loading ? "-" : executed}
          />

          <StatCard
            title="Rejected"
            value={loading ? "-" : rejected}
          />
        </div>

        {/* Action History */}
        <div className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Growth Action History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              AI-generated growth actions and their current status.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {loading ? (
              <div className="p-6 text-gray-500">
                Loading actions...
              </div>
            ) : actions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-medium text-gray-700">
                  No growth actions yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Analyze a business to generate your first AI growth action.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">

                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="p-6 transition hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      {/* Action Information */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {action.title}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {action.actionType}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {action.description}
                        </p>

                        {/* Product information */}
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">

                          {action.targetProduct && (
                            <span className="rounded-md bg-gray-50 px-3 py-1 text-gray-600">
                              Target: {action.targetProduct}
                            </span>
                          )}

                          {action.suggestedProduct && (
                            <span className="rounded-md bg-gray-50 px-3 py-1 text-gray-600">
                              Suggested: {action.suggestedProduct}
                            </span>
                          )}

                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                          Created{" "}
                          {new Date(
                            action.createdAt
                          ).toLocaleString()}
                        </p>

                        {/* Execution Result */}
                        {action.status === "EXECUTED" &&
  action.executionResult && (
    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-white">
          ✓
        </span>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Action Executed
          </p>

          <p className="text-xs text-gray-500">
            {action.executionResult.executionType}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700">
        {action.executionResult.message}
      </p>

      {/* Payment Status */}
      {action.payments && action.payments.length > 0 && (
  <div className="mt-4 rounded-lg bg-white p-3">
    <p className="text-xs text-gray-400">
      Payment Status
    </p>

    <p className="mt-1 text-sm font-semibold text-gray-800">
      {action.payments[0].status}
    </p>
  </div>
)}
      {action.executionResult.recommendation && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">

          <div className="rounded-lg bg-white p-3">
            <p className="text-xs text-gray-400">
              Target Product
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {
                action.executionResult
                  .recommendation
                  .targetProduct
              }
            </p>
          </div>

          <div className="rounded-lg bg-white p-3">
            <p className="text-xs text-gray-400">
              Suggested Product
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {
                action.executionResult
                  .recommendation
                  .suggestedProduct
              }
            </p>
          </div>

          <div className="rounded-lg bg-white p-3">
            <p className="text-xs text-gray-400">
              Placement
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {
                action.executionResult
                  .recommendation
                  .placement
              }
            </p>
          </div>

        </div>
      )}

    </div>
  )}

                      </div>

                      {/* Status + Actions */}
                      <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">

                        <StatusBadge status={action.status} />

                        {/* Proposed */}
                        {action.status === "PROPOSED" && (
                          <div className="flex gap-2">

                            <button
                              type="button"
                              disabled={
                                updatingAction === action.id
                              }
                              onClick={() =>
                                updateActionStatus(
                                  action.id,
                                  "approve"
                                )
                              }
                              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingAction === action.id
                                ? "Updating..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingAction === action.id
                              }
                              onClick={() =>
                                updateActionStatus(
                                  action.id,
                                  "reject"
                                )
                              }
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>

                          </div>
                        )}

                        {/* Approved */}
                        {action.status === "APPROVED" && (
                          <button
                            type="button"
                            disabled={
                              updatingAction === action.id
                            }
                            onClick={() =>
                              updateActionStatus(
                                action.id,
                                "execute"
                              )
                            }
                            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingAction === action.id
                              ? "Executing..."
                              : "Execute Action"}
                          </button>
                        )}

                        {/* Executed */}
                        {action.status === "EXECUTED" && (
  <div className="flex flex-col items-start gap-2 md:items-end">
    <span className="text-xs font-medium text-gray-500">
      Action completed
    </span>

    {action.executionResult?.paymentLink?.shortUrl && (
      <a
        href={action.executionResult.paymentLink.shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Open Razorpay Payment Link
      </a>
    )}
  </div>
)}

                        {/* Rejected */}
                        {action.status === "REJECTED" && (
                          <span className="text-xs font-medium text-gray-500">
                            Action rejected
                          </span>
                        )}

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>

        {/* Analyze Business */}
        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAnalyzer(true)}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            + Analyze New Business
          </button>
        </div>

      </div>

      {/* Analyzer Modal */}
      {showAnalyzer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAnalyzer(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => setShowAnalyzer(false)}
              className="absolute right-5 top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-700 transition hover:bg-gray-200"
            >
              ×
            </button>

            <GrowthAnalyzer
              onCreated={fetchActions}
              onClose={() => setShowAnalyzer(false)}
            />

          </div>
        </div>
      )}

    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: GrowthAction["status"];
}) {
  const styles = {
    PROPOSED: "bg-gray-100 text-gray-700",
    APPROVED: "bg-gray-200 text-gray-800",
    EXECUTED: "bg-black text-white",
    REJECTED: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}