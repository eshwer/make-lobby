// url=<FIGMA_LOBBY_LABCARD>
// source=app/components/ui.tsx
// component=LabCard

import figma from "figma";

const instance = figma.selectedInstance;
const number = instance.getString("Number");
const title = instance.getString("Title");
const body = instance.getString("Body");
const showArrow = instance.getBoolean("Show Arrow");

export default {
  id: "make-local-lobby-lab-card",
  imports: ['import { LabCard } from "./components/ui";'],
  example: figma.code`<LabCard number={${number}} title={${title}} ${showArrow ? "" : "showArrow={false}"}>${body}</LabCard>`,
  metadata: { nestable: true },
};
