type IconProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const sizeMap = {
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[32px]",
  xl: "text-[48px]",
} as const;

export function Icon({
  name,
  size = "md",
  filled = false,
  className = "",
  style,
  ...rest
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${sizeMap[size]} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}
