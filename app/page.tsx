import type { Metadata } from "next";
import { Lobby } from "./lobby";

export const metadata: Metadata = {
  title: "Make Local Lobby",
  description: "A hands-on introduction to designing directly in your local codebase.",
};

export default function Home() {
  return <Lobby />;
}
