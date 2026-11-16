import { createFileRoute } from "@tanstack/react-router";
import { CalibreApp } from "@/components/calibre/CalibreApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CalibreApp />;
}
