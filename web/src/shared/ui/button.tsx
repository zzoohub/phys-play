import { Icon } from "./icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary text-white",
    "hover:bg-primary-hover hover:shadow-glow",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  secondary: [
    "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
    "hover:bg-slate-300 dark:hover:bg-slate-700",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  ghost: [
    "bg-transparent text-slate-600 dark:text-slate-400",
    "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  danger: [
    "bg-accent-rose text-white",
    "hover:bg-accent-rose/90",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const iconEl = icon ? (
    <Icon name={icon} size={size === "lg" ? "md" : "sm"} />
  ) : null;

  return (
    <button
      className={[
        "inline-flex items-center justify-center font-semibold",
        "transition-all duration-200 ease-smooth",
        "focus-ring cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </button>
  );
}

/* Icon-only button */
type IconButtonProps = {
  icon: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  label: string;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
>;

const iconBtnSize: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
};

export function IconButton({
  icon,
  size = "md",
  variant = "secondary",
  label,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={[
        "inline-flex items-center justify-center",
        "transition-all duration-200 ease-smooth",
        "focus-ring cursor-pointer",
        variantStyles[variant],
        iconBtnSize[size],
        className,
      ].join(" ")}
      {...rest}
    >
      <Icon name={icon} size={size === "lg" ? "md" : "sm"} />
    </button>
  );
}
