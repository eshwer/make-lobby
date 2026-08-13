// url=<FIGMA_LOBBY_CARD>
// source=app/components/ui.tsx
// component=Card

import figma from "figma";

const instance = figma.selectedInstance;
const eyebrow = instance.getString("Eyebrow");
const title = instance.getString("Title");
const subtext = instance.getString("Subtext");
const showSubtext = instance.getBoolean("Show subtext");
const icon = instance.getString("Icon");
const emphasis = instance.getEnum("Emphasis", { Default: "default", Brand: "brand" });

export default {
  id: "make-local-lobby-card",
  imports: ['import { Card } from "./components/ui";'],
  example: figma.code`<Card eyebrow={${eyebrow}} title={${title}} subtext={${subtext}} showSubtext={${showSubtext}} emphasis={${emphasis}} icon={${icon}} />`,
  metadata: { nestable: true },
};
