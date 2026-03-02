import { createFileRoute } from "@tanstack/react-router";
import { TrackOverviewPage } from "#/site/views";

export const Route = createFileRoute("/tracks")({
  component: TrackOverviewPage,
});
