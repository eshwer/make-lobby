// url=<FIGMA_LOBBY_BADGE>
// source=app/components/ui.tsx
// component=Badge

import figma from "figma";

const instance = figma.selectedInstance;
const text = instance.getString("Text");
const tone = instance.getEnum("Tone", { Neutral: "neutral", Brand: "brand", Success: "success" });

export default {
  id: "make-local-lobby-badge",
  imports: ['import { Badge } from "./components/ui";'],
  example: figma.code`<Badge text={${text}} tone={${tone}} />`,
  metadata: { nestable: true },
};
