import { TracksHeader } from "#/site/widgets/tracks-header";
import { TrackSection } from "#/site/widgets/track-section";

const TRACK_1_MODULES = [
  {
    num: 1,
    name: "Motion & Force",
    desc: "Understanding Newton's laws through interactive simulations.",
    color: "primary" as const,
    active: true as const,
    href: "/module/1/1",
  },
  {
    num: 2,
    name: "Energy & Work",
    desc: "Explore kinetic and potential energy transformations.",
    color: "purple" as const,
    active: true as const,
    href: "/module/1/2",
  },
  {
    num: 3,
    name: "Waves",
    desc: "Sound, light, and electromagnetic spectrum basics.",
    color: "teal" as const,
    active: true as const,
    href: "/module/1/3",
  },
  {
    num: 4,
    name: "Thermodynamics",
    desc: null,
    color: null,
    active: false as const,
    href: null,
  },
  {
    num: 5,
    name: "Electromagnetism",
    desc: null,
    color: null,
    active: false as const,
    href: null,
  },
  {
    num: 6,
    name: "Relativity",
    desc: null,
    color: null,
    active: false as const,
    href: null,
  },
];

export function TrackOverviewPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <TracksHeader />

      <main className="flex h-full grow flex-col px-6 md:px-12 py-10 max-w-[1440px] mx-auto w-full gap-16">
        <TrackSection
          title="Classical Physics — Force & Energy"
          status="active"
          activeCount={3}
          modules={TRACK_1_MODULES}
        />

        <TrackSection
          title="Chemistry — World of Molecules"
          status="coming-soon"
          placeholderCount={6}
        />

        <TrackSection
          title="Space Science"
          status="locked"
          collapsedIcon="rocket_launch"
        />

        <TrackSection
          title="Quantum Mechanics"
          status="locked"
          collapsedIcon="science"
          className="pb-20"
        />
      </main>
    </div>
  );
}
