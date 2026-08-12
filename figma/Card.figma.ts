// url=<FIGMA_LOBBY_CARD>
// source=app/components/ui.tsx
// component=Card

import figma from "figma";

const instance = figma.selectedInstance;
const eyebrow = instance.getString("Eyebrow");
const title = instance.getString("Title");
const body = instance.getString("Body");
const icon = instance.getString("Icon");
const emphasis = instance.getEnum("Emphasis", { Default: "default", Brand: "brand" });

export default {
  id: "make-local-lobby-card",
  imports: ['import { Card } from "./components/ui";'],
  example: figma.code`<Card eyebrow={${eyebrow}} title={${title}} emphasis={${emphasis}} icon={${icon}}>${body}</Card>`,
  metadata: { nestable: true },
};
