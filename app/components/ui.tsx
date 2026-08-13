import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  label,
  children,
  size = "medium",
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`lobby-button lobby-button--${size} lobby-button--${variant} ${className}`.trim()}
      data-size={size}
      data-variant={variant}
      {...props}
    >
      <span>{label ?? children}</span>
      <span aria-hidden="true" className="button-arrow">↗</span>
    </button>
  );
}

export type BadgeTone = "neutral" | "brand" | "success";

export function Badge({ text, tone = "neutral" }: { text: string; tone?: BadgeTone }) {
  return <span className={`badge badge--${tone}`} data-tone={tone}>{text}</span>;
}

export function Card({
  eyebrow,
  title,
  children,
  emphasis = "default",
  icon,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  emphasis?: "default" | "brand";
  icon: string;
}) {
  return (
    <article className={`feature-card feature-card--${emphasis}`} data-emphasis={emphasis}>
      <div className="feature-card__top">
        <span className="feature-card__icon" aria-hidden="true">{icon}</span>
        <span className="feature-card__eyebrow">{eyebrow}</span>
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function LabCard({
  number,
  title,
  children,
  showArrow = true,
}: {
  number: string;
  title: string;
  children: ReactNode;
  showArrow?: boolean;
}) {
  return (
    <article>
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {showArrow && <span className="lab-arrow" aria-hidden="true">↗</span>}
    </article>
  );
}

export type PointerDirection = "up" | "up-right" | "right" | "down-right" | "down" | "down-left" | "left" | "up-left";

export interface PointerProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  direction?: PointerDirection;
}

export function Pointer({ label, direction = "up", className = "", ...props }: PointerProps) {
  return (
    <div
      className={`tour-pointer tour-pointer--${direction} ${className}`.trim()}
      data-direction={direction}
      {...props}
    >
      <span className="tour-pointer__line" aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}
