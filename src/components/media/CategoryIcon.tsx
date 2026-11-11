"use client";

import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  Briefcase,
  Car,
  CircuitBoard,
  Dumbbell,
  Gem,
  HardHat,
  HeartPulse,
  Home,
  Laptop,
  Package,
  Puzzle,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Tractor,
  Watch,
} from "lucide-react";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";

const ICONS: Record<string, LucideIcon> = {
  computers: Laptop,
  fashion: Shirt,
  shoes: ShoppingBag,
  home: Home,
  grocery: Package,
  beauty: Sparkles,
  health: HeartPulse,
  baby: Baby,
  sports: Dumbbell,
  auto: Car,
  agri: Tractor,
  industrial: CircuitBoard,
  construction: HardHat,
  books: BookOpen,
  furniture: Sofa,
  toys: Puzzle,
  jewellery: Gem,
  services: Briefcase,
};

const ACCENTS: Record<string, string> = {
  computers: "#1f6b5c",
  fashion: "#8b5a3c",
  shoes: "#6b4f3a",
  home: "#3d6b5a",
  grocery: "#4a7c3f",
  beauty: "#9a5b6e",
  health: "#2f6f7a",
  baby: "#6a7db5",
  sports: "#3d6a3a",
  auto: "#4a5560",
  agri: "#5a7a3a",
  industrial: "#4a5a6a",
  construction: "#8a6a3a",
  books: "#5a4a6a",
  furniture: "#6a553a",
  toys: "#b07a3a",
  jewellery: "#b8923e",
  services: "#1a3a35",
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return ICONS[categoryId] ?? Watch;
}

export function getCategoryAccent(categoryId: string): string {
  return ACCENTS[categoryId] ?? "#1f6b5c";
}

type MediaProps = {
  categoryId: string;
  productId?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Skip admin photo override (used inside admin pickers). */
  ignoreAdmin?: boolean;
};

/** Icon fallback, or admin-uploaded photo when available. */
export function CategoryMedia({
  categoryId,
  productId,
  label,
  size = "md",
  className = "",
  ignoreAdmin = false,
}: MediaProps) {
  const { media } = useAdminMedia();
  const adminSrc = ignoreAdmin
    ? undefined
    : (productId && media.productImages[productId]) || media.categoryImages[categoryId];

  if (adminSrc) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        role={label ? "img" : undefined}
        aria-label={label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={adminSrc} alt={label ?? ""} className="h-full w-full object-cover" />
      </div>
    );
  }

  const Icon = getCategoryIcon(categoryId);
  const accent = getCategoryAccent(categoryId);
  const iconSize = size === "sm" ? 28 : size === "lg" ? 72 : 44;

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${accent}33, transparent 55%), linear-gradient(160deg, #e8f0ed, #f3efe6 70%)`,
      }}
      aria-hidden={!label}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(12,36,33,0.03) 8px, rgba(12,36,33,0.03) 9px)",
        }}
      />
      <div
        className="relative grid place-items-center rounded-full shadow-[0_10px_30px_rgba(12,36,33,0.12)]"
        style={{
          width: iconSize * 1.9,
          height: iconSize * 1.9,
          background: `linear-gradient(145deg, ${accent}, #0c2421)`,
          color: "#f7f4ee",
        }}
      >
        <Icon size={iconSize} strokeWidth={1.6} />
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
