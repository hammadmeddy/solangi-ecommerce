"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { apiGet, apiPost, apiSend } from "@/lib/api-client";

type ReviewRow = {
  id: string;
  quote: string;
  author: string;
  meta: string;
  rating: number;
  status: string;
  sortOrder: number;
};

export function AdminReviews() {
  const t = useTranslations("Admin");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [meta, setMeta] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ reviews: ReviewRow[] }>("/api/reviews?all=1");
      setReviews(data.reviews || []);
      setError("");
    } catch {
      setError(t("reviewsLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/reviews", {
        quote,
        author,
        meta,
        rating: 5,
      });
      setQuote("");
      setAuthor("");
      setMeta("");
      await load();
    } catch {
      setError(t("reviewsSaveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    try {
      await apiSend("PATCH", `/api/admin/reviews/${id}`, { status });
      await load();
    } catch {
      setError(t("reviewsSaveFailed"));
    }
  }

  async function remove(id: string) {
    try {
      await apiSend("DELETE", `/api/admin/reviews/${id}`);
      await load();
    } catch {
      setError(t("reviewsSaveFailed"));
    }
  }

  return (
    <AdminShell title={t("reviewsTitle")} subtitle={t("reviewsSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}

      <form
        onSubmit={onCreate}
        className="mb-8 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-4"
      >
        <h2 className="text-sm font-semibold">{t("reviewsAdd")}</h2>
        <textarea
          className="min-h-[88px] rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          placeholder={t("reviewsQuotePh")}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            placeholder={t("reviewsAuthorPh")}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            placeholder={t("reviewsMetaPh")}
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="justify-self-start rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)] disabled:opacity-50"
        >
          {busy ? t("saving") : t("reviewsPublish")}
        </button>
      </form>

      <div className="grid gap-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-[var(--line)] bg-white/80 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{review.author}</p>
              <span className="rounded-full bg-[var(--mist)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide">
                {review.status}
              </span>
            </div>
            <p className="text-sm italic text-[var(--ink-soft)]">“{review.quote}”</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{review.meta}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                onClick={() => void setStatus(review.id, "approved")}
              >
                {t("reviewsApprove")}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                onClick={() => void setStatus(review.id, "pending")}
              >
                {t("reviewsPending")}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                onClick={() => void setStatus(review.id, "rejected")}
              >
                {t("reviewsReject")}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--sale)] px-3 py-1.5 text-xs font-semibold text-[var(--sale)]"
                onClick={() => void remove(review.id)}
              >
                {t("clear")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
