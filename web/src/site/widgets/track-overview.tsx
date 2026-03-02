import { Icon } from "#/shared/ui";

const TRACKS = [
  {
    id: 1,
    name: "Classical Physics",
    icon: "category",
    ready: "3/6",
    active: true,
  },
  {
    id: 2,
    name: "Chemistry",
    icon: "science",
    ready: null,
    active: false,
  },
  {
    id: 3,
    name: "Space Science",
    icon: "rocket_launch",
    ready: null,
    active: false,
  },
  {
    id: 4,
    name: "Quantum Mechanics",
    icon: "all_inclusive",
    ready: null,
    active: false,
  },
] as const;

export function TrackOverview() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            More science experiences
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Expanding the universe of learning soon.
          </p>
        </div>
        <a
          href="/tracks"
          className="hidden text-sm font-bold text-primary hover:underline md:block"
        >
          View Roadmap
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {TRACKS.map((track) =>
          track.active ? (
            <ActiveTrackCard key={track.id} track={track} />
          ) : (
            <LockedTrackCard key={track.id} track={track} />
          ),
        )}
      </div>
    </section>
  );
}

function ActiveTrackCard({
  track,
}: {
  track: (typeof TRACKS)[number];
}) {
  return (
    <a
      href="/tracks"
      className="relative flex flex-col justify-between rounded-xl bg-slate-200 dark:bg-slate-800 p-5 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700"
    >
      {track.ready && (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
            {track.ready} Ready
          </span>
        </div>
      )}
      <div className="mb-3 h-10 w-10 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
        <Icon
          name={track.icon}
          size="md"
          className="text-slate-600 dark:text-slate-300"
        />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white">
          {track.name}
        </h4>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-900 overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full" />
        </div>
      </div>
    </a>
  );
}

function LockedTrackCard({
  track,
}: {
  track: (typeof TRACKS)[number];
}) {
  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent p-5 opacity-70">
      <div className="absolute right-4 top-4">
        <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-500">
          Coming Soon
        </span>
      </div>
      <div className="mb-3 h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        <Icon name={track.icon} size="md" className="text-slate-500" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-slate-300">
          {track.name}
        </h4>
      </div>
    </div>
  );
}
