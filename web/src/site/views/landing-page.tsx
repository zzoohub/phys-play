import {
  SiteHeader,
  HeroSection,
  ModuleCards,
  TrackOverview,
  SiteFooter,
} from "#/site/widgets";

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <ModuleCards />
        <TrackOverview />
      </main>
      <SiteFooter />
    </div>
  );
}
