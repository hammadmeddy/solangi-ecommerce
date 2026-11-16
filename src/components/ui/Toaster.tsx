"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { AlertTriangle, Check, Info, X, XCircle } from "lucide-react";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
  leaving?: boolean;
};

type ToastApi = {
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
};

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = {
  success: Check,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const CHROME = {
  en: { dismiss: "Dismiss", notifications: "Notifications" },
  ur: { dismiss: "بند کریں", notifications: "اطلاعات" },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const chrome = locale === "ur" ? CHROME.ur : CHROME.en;
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 240);
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${++seq.current}`;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
      duration: input.duration ?? 4400,
    };
    setToasts((prev) => [...prev, item].slice(-4));
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: "success" }),
      error: (title, description) => push({ title, description, tone: "error", duration: 5800 }),
      info: (title, description) => push({ title, description, tone: "info" }),
      warning: (title, description) => push({ title, description, tone: "warning", duration: 5200 }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-label={chrome.notifications}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} dismissLabel={chrome.dismiss} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  dismissLabel,
  onDismiss,
}: {
  toast: ToastItem;
  dismissLabel: string;
  onDismiss: (id: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const started = useRef(0);
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    if (paused || toast.leaving) return;
    started.current = Date.now();
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(280, remaining.current - (Date.now() - started.current));
    };
  }, [paused, toast.id, toast.leaving, onDismiss]);

  return (
    <article
      className={`toast-card toast-card--${toast.tone}${toast.leaving ? " is-leaving" : ""}`}
      role={toast.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="toast-card__icon" aria-hidden="true">
        <Icon size={16} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="toast-card__title">{toast.title}</p>
        {toast.description ? <p className="toast-card__body">{toast.description}</p> : null}
      </div>
      <button type="button" className="toast-card__close" onClick={() => onDismiss(toast.id)} aria-label={dismissLabel}>
        <X size={14} />
      </button>
      <span
        className="toast-life"
        style={{
          animationDuration: `${toast.duration}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </article>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
