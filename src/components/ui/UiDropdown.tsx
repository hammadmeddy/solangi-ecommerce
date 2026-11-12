"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type UiDropdownOption = {
  value: string;
  label: string;
};

type Variant = "header" | "field" | "compact";

type Props = {
  value: string;
  options: readonly UiDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  label?: string;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
};

export function UiDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  label,
  variant = "header",
  className = "",
  disabled = false,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  function choose(next: string) {
    onChange(next);
    close();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(selectedIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(selectedIndex);
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (!options.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option.value);
      return;
    }

    if (event.key === "Escape" || event.key === "Tab") {
      close();
    }
  }

  return (
    <div
      ref={rootRef}
      className={`ui-dropdown ui-dropdown--${variant} ${open ? "is-open" : ""} ${className}`}
    >
      {label ? <span className="ui-dropdown__label">{label}</span> : null}
      <button
        type="button"
        className="ui-dropdown__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="ui-dropdown__value">{selected?.label ?? value}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          className="ui-dropdown__menu"
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          onKeyDown={onListKeyDown}
          ref={(node) => node?.focus()}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`ui-dropdown__option${isSelected ? " is-selected" : ""}${isActive ? " is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option.value)}
              >
                <span>{option.label}</span>
                {isSelected ? <CheckIcon /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 8"
      className={`ui-dropdown__chevron${open ? " is-open" : ""}`}
      aria-hidden
    >
      <path
        d="M1 1.5L6 6.5L11 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="ui-dropdown__check" aria-hidden>
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
