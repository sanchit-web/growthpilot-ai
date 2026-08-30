"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  sales: number;
};

type Opportunity = {
  title: string;
  problem: string;
  recommendation: string;
  actionType: string;
  targetProduct?: string;
  suggestedProduct?: string;
  reasoning: string;
  expectedImpact: string;
  confidence: number;
};

type GrowthAnalyzerProps = {
  onCreated?: () => void;
  onClose?: () => void;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function GrowthAnalyzer({
  onCreated,
  onClose,
}: GrowthAnalyzerProps) {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyOrders, setMonthlyOrders] = useState("");
  const [averageOrderValue, setAverageOrderValue] = useState("");

  const [products, setProducts] = useState<Product[]>([
    {
      id: "p1",
      name: "",
      price: 0,
      sales: 0,
    },
    {
      id: "p2",
      name: "",
      price: 0,
      sales: 0,
    },
    {
      id: "p3",
      name: "",
      price: 0,
      sales: 0,
    },
  ]);

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(false);
  const [creatingAction, setCreatingAction] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string
  ) => {
    setProducts((current) =>
      current.map((product, i) => {
        if (i !== index) return product;

        if (field === "price" || field === "sales") {
          return {
            ...product,
            [field]: Number(value),
          };
        }

        return {
          ...product,
          [field]: value,
        };
      })
    );
  };

  const analyzeBusiness = async () => {
    setError("");
    setOpportunity(null);

    if (!businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!category.trim()) {
      setError("Please enter your business category.");
      return;
    }

    if (!monthlyOrders || Number(monthlyOrders) <= 0) {
      setError("Please enter valid monthly orders.");
      return;
    }

    if (!averageOrderValue || Number(averageOrderValue) <= 0) {
      setError("Please enter a valid average order value.");
      return;
    }

    const validProducts = products.filter(
      (product) =>
        product.id.trim() &&
        product.name.trim() &&
        product.price > 0 &&
        product.sales >= 0
    );

    if (validProducts.length === 0) {
      setError("Please enter at least one valid product.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/growth/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName,
            category,
            monthlyOrders: Number(monthlyOrders),
            averageOrderValue: Number(averageOrderValue),
            products: validProducts,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Analysis failed"
        );
      }

      setOpportunity(data.opportunity);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to analyze business."
      );
    } finally {
      setLoading(false);
    }
  };

  const createAction = async () => {
    if (!opportunity) return;

    setError("");

    try {
      setCreatingAction(true);

      const response = await fetch(
        `${API_URL}/api/growth/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName,
            category,
            monthlyOrders: Number(monthlyOrders),
            averageOrderValue: Number(averageOrderValue),
            products,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create growth action"
        );
      }

      setSuccess(true);

      if (onCreated) {
        onCreated();
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1200);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create growth action."
      );
    } finally {
      setCreatingAction(false);
    }
  };

  if (success) {
    return (
      <section className="flex min-h-[520px] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Growth Action Created
          </h2>

          <p className="mt-2 text-gray-500">
            Your AI recommendation has been saved as a
            proposed growth action.
          </p>

          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Status: <strong>PROPOSED</strong>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                AI
              </span>

              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Analyze Your Business
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Discover AI-powered opportunities to grow your
                  business.
                </p>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {/* Business Information */}
        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold">
              Business Information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Tell us about the business you want AI to analyze.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Business Name
              </label>

              <input
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="e.g. Urban Threads"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="e.g. Fashion"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Monthly Orders
              </label>

              <input
                type="number"
                min="0"
                value={monthlyOrders}
                onChange={(e) =>
                  setMonthlyOrders(e.target.value)
                }
                placeholder="e.g. 150"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Average Order Value
              </label>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={averageOrderValue}
                  onChange={(e) =>
                    setAverageOrderValue(e.target.value)
                  }
                  placeholder="e.g. 1350"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-8 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold">
              Products
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add product sales data so AI can identify
              cross-sell and upsell opportunities.
            </p>
          </div>

          <div className="hidden grid-cols-4 gap-3 px-1 text-xs font-medium uppercase tracking-wide text-gray-400 md:grid">
            <span>Product ID</span>
            <span>Product Name</span>
            <span>Price</span>
            <span>Units Sold</span>
          </div>

          <div className="mt-2 space-y-3">
            {products.map((product, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-3 md:grid md:grid-cols-4 md:gap-3 md:border-0 md:bg-transparent md:p-0"
              >
                <div>
                  <label className="text-xs text-gray-500 md:hidden">
                    Product ID
                  </label>

                  <input
                    value={product.id}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "id",
                        e.target.value
                      )
                    }
                    placeholder="p1"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black md:mt-0"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 md:hidden">
                    Product Name
                  </label>

                  <input
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Black Oversized T-Shirt"
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black md:mt-0"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 md:hidden">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={product.price || ""}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "price",
                        e.target.value
                      )
                    }
                    placeholder="999"
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black md:mt-0"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 md:hidden">
                    Units Sold
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={product.sales || ""}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "sales",
                        e.target.value
                      )
                    }
                    placeholder="120"
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black md:mt-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 text-red-500">!</div>

              <div>
                <p className="font-medium text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={analyzeBusiness}
            disabled={loading}
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}

            {loading ? "Analyzing..." : "Analyze Growth"}
          </button>
        </div>

        {/* Opportunity */}
        {opportunity && (
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  AI Growth Opportunity
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  {opportunity.title}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
                {opportunity.actionType}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <OpportunityCard
                title="Problem"
                text={opportunity.problem}
              />

              <OpportunityCard
                title="Recommendation"
                text={opportunity.recommendation}
              />

              <OpportunityCard
                title="Reasoning"
                text={opportunity.reasoning}
              />

              <OpportunityCard
                title="Expected Impact"
                text={opportunity.expectedImpact}
              />
            </div>

            {/* Confidence */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  AI Confidence
                </span>

                <span className="text-sm font-bold">
                  {Math.round(
                    opportunity.confidence * 100
                  )}
                  %
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{
                    width: `${Math.round(
                      opportunity.confidence * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Create Action */}
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Ready to turn this into an action?
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This will save the recommendation as a
                  proposed growth action.
                </p>
              </div>

              <button
                type="button"
                onClick={createAction}
                disabled={creatingAction}
                className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingAction && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}

                {creatingAction
                  ? "Creating..."
                  : "Create Growth Action"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function OpportunityCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {text}
      </p>
    </div>
  );
}