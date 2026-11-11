import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthField({
  label,
  hint,
  children,
  ...props
}: {
  label: string;
  hint?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id ?? props.name;
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-[var(--ink)]">{label}</span>
      {children ?? (
        <input
          {...props}
          id={id}
          className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none transition focus:border-[var(--teal)] focus:bg-white"
        />
      )}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function AuthButton({
  children,
  variant = "primary",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles =
    variant === "primary"
      ? "bg-[var(--ink)] text-[var(--cream)] hover:bg-[var(--teal)]"
      : "border border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]";
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
