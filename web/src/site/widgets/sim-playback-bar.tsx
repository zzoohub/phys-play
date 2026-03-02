import { Button, IconButton } from "#/shared/ui";

type SimPlaybackBarProps = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onShowFormula: () => void;
  nextModuleHref: string | null;
};

export function SimPlaybackBar({
  isPlaying,
  onPlayPause,
  onReset,
  onShowFormula,
  nextModuleHref,
}: SimPlaybackBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface-dark/70 backdrop-blur-md border-t border-white/5">
      <div className="flex items-center gap-2">
        <IconButton
          icon="skip_previous"
          label="Reset simulation"
          variant="ghost"
          size="sm"
          onClick={onReset}
        />
        <IconButton
          icon={isPlaying ? "pause" : "play_arrow"}
          label={isPlaying ? "Pause" : "Play"}
          variant="primary"
          size="md"
          onClick={onPlayPause}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon="functions"
          onClick={onShowFormula}
        >
          <span className="hidden sm:inline">Show formula</span>
        </Button>
        {nextModuleHref ? (
          <a href={nextModuleHref}>
            <Button variant="secondary" size="sm" icon="skip_next">
              <span className="hidden sm:inline">Next module</span>
            </Button>
          </a>
        ) : null}
      </div>
    </div>
  );
}
