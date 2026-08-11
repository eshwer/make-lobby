import type { ButtonHTMLAttributes, ReactNode } from "react";

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
