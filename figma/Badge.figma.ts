// url=<FIGMA_LOBBY_BADGE>
// source=app/components/ui.tsx
// component=Badge

import figma from "figma";

const instance = figma.selectedInstance;
const text = instance.getString("Label");
const tone = instance.getEnum("Scheme", { Neutral: "neutral", Positive: "success", Warning: "brand", Danger: "brand" });

export default {
  id: "make-local-lobby-badge",
  imports: ['import { Badge } from "./components/ui";'],
  example: figma.code`<Badge text={${text}} tone={${tone}} />`,
  metadata: { nestable: true },
};
