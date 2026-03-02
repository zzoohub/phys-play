import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "#/site/views";

export const Route = createFileRoute("/")({ component: LandingPage });
