// url=<FIGMA_LOBBY_POINTER>
// source=app/components/ui.tsx
// component=Pointer

import figma from "figma";

const instance = figma.selectedInstance;
const label = instance.getString("Label");
const direction = instance.getEnum("Direction", {
  "Up": "up",
  "Up Right": "up-right",
  "Right": "right",
  "Down Right": "down-right",
  "Down": "down",
  "Down Left": "down-left",
  "Left": "left",
  "Up Left": "up-left",
});

export default {
  id: "make-local-lobby-pointer",
  imports: ['import { Pointer } from "./components/ui";'],
  example: figma.code`<Pointer label={${label}} direction={${direction}} />`,
  metadata: { nestable: true },
};
