// url=<FIGMA_LOBBY_BUTTON>
// source=app/components/ui.tsx
// component=Button

import figma from "figma";

const instance = figma.selectedInstance;
const label = instance.getString("Label");
const size = instance.getEnum("Size", { Small: "small", Medium: "medium", Large: "large" });
const variant = instance.getEnum("Variant", { Primary: "primary", Secondary: "secondary", Neutral: "secondary" });
const disabled = instance.getBoolean("Disabled");

export default {
  id: "make-local-lobby-button",
  imports: ['import { Button } from "./components/ui";'],
  example: figma.code`<Button label={${label}} size={${size}} variant={${variant}} disabled={${disabled}} />`,
  metadata: { nestable: true },
};
