import { Icon } from "#/shared/ui";

type SimCanvasPlaceholderProps = {
  moduleColor?: string;
};

export function SimCanvasPlaceholder({
  moduleColor = "rgba(37, 106, 244, 0.15)",
}: SimCanvasPlaceholderProps) {
  return (
    <div
      className="absolute inset-0 z-0 bg-surface-dark-sunken"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 40%, ${moduleColor} 0%, transparent 60%)`,
      }}
      role="img"
      aria-label="3D simulation placeholder"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Icon name="view_in_ar" size="xl" />
          <span className="text-sm font-medium">3D Scene</span>
        </div>
      </div>
    </div>
  );
}
