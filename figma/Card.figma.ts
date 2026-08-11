// url=<FIGMA_LOBBY_CARD>
// source=app/components/ui.tsx
// component=Card

import figma from "figma";

const instance = figma.selectedInstance;
const title = instance.getString("Heading");
const body = instance.getString("Body");
const emphasis = instance.getEnum("Variant", { Stroke: "brand", Default: "default" });

export default {
  id: "make-local-lobby-card",
  imports: ['import { Card } from "./components/ui";'],
  example: figma.code`<Card eyebrow="From Figma" title={${title}} emphasis={${emphasis}} icon="◇">${body}</Card>`,
  metadata: { nestable: true },
};
