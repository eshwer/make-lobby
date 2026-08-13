"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, LabCard } from "./components/ui";

type WalkthroughTarget =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "left"
  | "right"
  | "cta"
  | "card";

type WalkthroughStep = {
  id: string;
  mission: number;
  kicker: string;
  title: string;
  body: string;
  instruction: string;
  target: WalkthroughTarget;
  targetLabel?: string;
  image?: string;
  imageAlt?: string;
  nextLabel: string;
  validator?: "large-button";
};

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    mission: 0,
    kicker: "Interactive product tour",
    title: "Learn Make Local in the real interface",
    body: "Keep this page open in the preview. Each step points to the actual Make Local control around it, then waits while you try the action yourself.",
    instruction: "The tour never clicks product controls for you. Follow the arrow, perform the action, then return here to continue.",
    target: "center",
    nextLabel: "Start the walkthrough",
  },
  {
    id: "branch-picker",
    mission: 1,
    kicker: "Git foundations · 1 of 2",
    title: "Open the branch picker",
    body: "Look below the chat composer in Make Local’s left panel. The current branch name lives in that bottom bar.",
    instruction: "Click main to open the branch menu.",
    target: "bottom-left",
    targetLabel: "Branch control below the chat box",
    image: "/tour/branch-picker.webp",
    imageAlt: "Make Local branch picker showing main and Create branch.",
    nextLabel: "The branch menu is open",
  },
  {
    id: "create-branch",
    mission: 1,
    kicker: "Git foundations · 2 of 2",
    title: "Create your safe workspace",
    body: "Choose Create branch… and start from main. A personal branch keeps the shared starting point stable.",
    instruction: "Name it workshop/<your-name>, then choose Create and check out.",
    target: "bottom-left",
    targetLabel: "Create branch…",
    image: "/tour/branch-picker.webp",
    imageAlt: "Make Local branch menu with Create branch highlighted at the bottom.",
    nextLabel: "I’m on my branch",
  },
  {
    id: "edit-mode",
    mission: 2,
    kicker: "Point & Edit · 1 of 3",
    title: "Turn on Edit",
    body: "The preview toolbar sits immediately above this page. Edit is the cursor-with-spark control near its right edge.",
    instruction: "Click Edit. The page becomes selectable and a properties panel opens when you choose an element.",
    target: "top-right",
    targetLabel: "Edit in the preview toolbar",
    image: "/tour/design-mode.webp",
    imageAlt: "Make Local Design mode with its right-hand properties panel open.",
    nextLabel: "Edit is on",
  },
  {
    id: "select-cta",
    mission: 2,
    kicker: "Point & Edit · 2 of 3",
    title: "Select the real CTA",
    body: "Point & Edit works on the rendered interface, not a separate mock. The highlighted button below is backed by the Button component in this repository.",
    instruction: "Click the highlighted Try editing me button and look for a blue selection outline plus component properties on the right.",
    target: "cta",
    nextLabel: "The button is selected",
  },
  {
    id: "change-size",
    mission: 2,
    kicker: "Point & Edit · 3 of 3",
    title: "Change a code property",
    body: "The selected Button exposes design-facing props from the repository’s code-property definition.",
    instruction: "In the right panel, change Size from Medium to Large and apply the pending edit. This step checks the rendered result.",
    target: "right",
    targetLabel: "Properties panel",
    image: "/tour/design-mode.webp",
    imageAlt: "Make Local properties panel beside a selected rendered element.",
    nextLabel: "Check the button",
    validator: "large-button",
  },
  {
    id: "open-commits",
    mission: 3,
    kicker: "Review & recover · 1 of 2",
    title: "Open commit history",
    body: "Agent edits become named checkpoints. The Commits control is above the chat panel, to the left of this preview.",
    instruction: "Click Commits, then hover the newest version to reveal its ••• menu.",
    target: "top-left",
    targetLabel: "Commits above the chat panel",
    image: "/tour/commit-actions.webp",
    imageAlt: "Make Local commit history with its action menu open.",
    nextLabel: "Commit history is open",
  },
  {
    id: "review-restore",
    mission: 3,
    kicker: "Review & recover · 2 of 2",
    title: "Review, preview, and restore",
    body: "One menu contains the complete recovery loop: inspect the diff, preview an earlier running state, or restore its tree.",
    instruction: "Choose View changes. Then preview an earlier commit and Restore commit. Restore adds a new checkpoint; it does not erase intervening history.",
    target: "top-left",
    targetLabel: "••• on a commit row",
    image: "/tour/commit-actions.webp",
    imageAlt: "Commit menu showing Preview commit, View changes, and Restore commit.",
    nextLabel: "I reviewed the history",
  },
  {
    id: "annotate-mode",
    mission: 4,
    kicker: "Annotate · 1 of 3",
    title: "Turn on Annotate for agent",
    body: "Annotate lives beside Edit in the preview toolbar. It lets you pin intent to a rendered element without directly changing its properties.",
    instruction: "Click Annotate for agent—the note icon near the toolbar’s right edge.",
    target: "top-right",
    targetLabel: "Annotate for agent",
    image: "/tour/annotate-for-agent.webp",
    imageAlt: "Make Local annotation mode with a numbered pin and note composer.",
    nextLabel: "Annotation mode is on",
  },
  {
    id: "pin-card",
    mission: 4,
    kicker: "Annotate · 2 of 3",
    title: "Pin the element you mean",
    body: "A visual pin carries the selected element and its source context into the request.",
    instruction: "Click the highlighted orange card. A numbered pin and Ask for changes composer should appear beside it.",
    target: "card",
    nextLabel: "The card is pinned",
  },
  {
    id: "mention-card",
    mission: 4,
    kicker: "Annotate · 3 of 3",
    title: "Name the component to use",
    body: "An @-mention removes ambiguity by attaching a real component or token candidate to the note.",
    instruction: "Type “Use @Card with brand emphasis,” choose Card under Components, submit the note, then click Apply in the chat panel.",
    target: "left",
    targetLabel: "Apply the staged request in chat",
    image: "/tour/annotate-for-agent.webp",
    imageAlt: "Annotation composer attached to a selected element in Make Local.",
    nextLabel: "The annotation is applied",
  },
  {
    id: "copy-designs",
    mission: 5,
    kicker: "Code to canvas · 1 of 2",
    title: "Open Copy designs",
    body: "Copy designs captures the rendered page as editable Figma layers and can replace mapped output with Code Connect instances.",
    instruction: "Click the outlined-layers Copy designs control in the preview toolbar.",
    target: "top-right",
    targetLabel: "Copy designs in the toolbar",
    image: "/tour/copy-designs.webp",
    imageAlt: "Make Local Copy designs toolbar showing Ready to send.",
    nextLabel: "Ready to send is visible",
  },
  {
    id: "send-design",
    mission: 5,
    kicker: "Code to canvas · 2 of 2",
    title: "Send the page to Design",
    body: "A dark Ready to send bar appears along the bottom of the preview after capture finishes.",
    instruction: "Choose Copy to clipboard, or open the arrow for a recent Design file or New file. In Desktop, edited attached frames can return through Update Make.",
    target: "bottom-center",
    targetLabel: "Ready to send",
    image: "/tour/copy-designs.webp",
    imageAlt: "Ready to send bar with Copy to clipboard and Design file destinations.",
    nextLabel: "Finish the walkthrough",
  },
  {
    id: "complete",
    mission: 6,
    kicker: "Walkthrough complete",
    title: "You used the full Make Local loop",
    body: "You created a safe branch, edited real code visually, reviewed and restored history, directed the agent with context, and carried the result into Figma Design.",
    instruction: "Keep experimenting below, or restart the walkthrough whenever you want to teach the flow again.",
    target: "center",
    nextLabel: "Explore the optional labs",
  },
];

const LABS = [
  { number: "01", title: "Implement a Design", text: "Paste a focused Figma frame or file link into chat and ask the agent to implement it through Figma MCP. Watch the preview and diff update." },
  { number: "02", title: "Scope with intent", text: "One component or section is faster to generate and review. Whole pages and system-wide changes take longer, so state the outcome and constraints up front." },
  { number: "03", title: "Create the library", text: "If the Design library does not exist yet, use Figma MCP to establish its component and variable foundations before implementing the page." },
  { number: "04", title: "Connect code to Design", text: "Use Figma MCP to inspect the library, then generate or verify Code Connect mappings so the right code components survive the handoff." },
  { number: "05", title: "Try another branch", text: "Switch to tour/alternate-theme, compare the token changes, then return to your workshop branch." },
  { number: "06", title: "Share for review", text: "Fork the repo, push your workshop branch, and open a pull request from Make Local." },
];

const WALKTHROUGH_STORAGE_KEY = "make-local-lobby-traditional-walkthrough-v1";

const TARGET_ARROWS: Partial<Record<WalkthroughTarget, string>> = {
  "top-left": "↖",
  "top-right": "↗",
  "bottom-left": "↙",
  "bottom-center": "↓",
  left: "←",
  right: "→",
};

function FigmaMark() {
  return (
    <span className="figma-mark" aria-label="Figma">
      <i className="mark-red" /><i className="mark-orange" /><i className="mark-purple" />
      <i className="mark-blue" /><i className="mark-green" />
    </span>
  );
}

export function Lobby() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [walkthroughActive, setWalkthroughActive] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(WALKTHROUGH_STORAGE_KEY);
        if (stored) {
          const progress = JSON.parse(stored);
          const index = Number(progress.activeIndex);
          if (Number.isInteger(index) && index >= 0 && index < WALKTHROUGH_STEPS.length) {
            setActiveIndex(index);
          }
          if (typeof progress.active === "boolean") setWalkthroughActive(progress.active);
        }
      } catch {
        // The walkthrough still works when browser storage is unavailable.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      WALKTHROUGH_STORAGE_KEY,
      JSON.stringify({ version: 1, activeIndex, active: walkthroughActive }),
    );
  }, [activeIndex, ready, walkthroughActive]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!walkthroughActive) return;
      if (event.key === "Escape") setWalkthroughActive(false);
      if (event.key === "ArrowLeft" && activeIndex > 0) {
        setValidationMessage("");
        setActiveIndex((index) => index - 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, walkthroughActive]);

  useEffect(() => {
    const target = WALKTHROUGH_STEPS[activeIndex]?.target;
    const selector = target === "cta"
      ? "[data-tour-target='hero-cta']"
      : target === "card"
        ? "[data-tour-target='editable-card']"
        : null;

    if (!walkthroughActive || !selector) return;

    function measureTarget() {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return setSpotlightRect(null);
      const rect = element.getBoundingClientRect();
      setSpotlightRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }

    const animationFrame = window.requestAnimationFrame(measureTarget);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [activeIndex, walkthroughActive]);

  const activeStep = WALKTHROUGH_STEPS[activeIndex];
  const actionableStepCount = WALKTHROUGH_STEPS.length - 2;
  const currentActionNumber = Math.min(Math.max(activeIndex, 0), actionableStepCount);
  const isInPageTarget = activeStep.target === "cta" || activeStep.target === "card";
  const targetArrow = TARGET_ARROWS[activeStep.target];

  function restartWalkthrough() {
    setValidationMessage("");
    setActiveIndex(0);
    setWalkthroughActive(true);
  }

  function advanceWalkthrough() {
    if (activeStep.validator === "large-button") {
      const target = document.querySelector<HTMLElement>("[data-tour-target='hero-cta']");
      if (target?.dataset.size !== "large") {
        setValidationMessage("The CTA is still Medium. Use the right-hand Properties panel to set Size to Large, then apply the edit.");
        return;
      }
    }

    setValidationMessage("");
    if (activeIndex === WALKTHROUGH_STEPS.length - 1) {
      setWalkthroughActive(false);
      window.requestAnimationFrame(() => document.getElementById("labs")?.scrollIntoView({ behavior: "smooth" }));
      return;
    }
    setActiveIndex((index) => Math.min(index + 1, WALKTHROUGH_STEPS.length - 1));
  }

  function goBack() {
    setValidationMessage("");
    setActiveIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <main className="lobby-shell">
      <section className="guided-workspace" aria-label="Editable playground">
        <div className="guided-playground">
          <section className="hero-card" data-tour-target="hero-card">
            <div className="hero-copy">
              <Badge text="Local-first design" tone="neutral" />
              <h2>From intent to interface,<br /><span>without the handoff gap.</span></h2>
              <p>Explore freely in a safe branch. Every meaningful change becomes reviewable code, ready for your team.</p>
              <div className="hero-actions">
                <Button
                  label="Try editing me"
                  size="medium"
                  className={walkthroughActive && activeStep.target === "cta" ? "tour-focus" : ""}
                  data-tour-target="hero-cta"
                />
                <span className="hero-hint">← Select this with Point & Edit</span>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-frame"><div className="art-toolbar" /><div className="art-sidebar" /><div className="art-object art-object--a" /><div className="art-object art-object--b" /></div>
              <div className="cursor cursor--blue">M</div><div className="cursor cursor--pink">A</div>
            </div>
          </section>

          <div className="feature-grid" data-tour-target="feature-grid">
            <Card eyebrow="01 · Select" title="Point at what you mean" icon="⌖" subtext="Select rendered UI and trace it back to the source that produced it." showSubtext />
            <div data-tour-target="editable-card" className={walkthroughActive && activeStep.target === "card" ? "tour-card-target tour-focus" : "tour-card-target"}>
              <Card eyebrow="02 · Change" title="Edit with design controls" icon="◫" emphasis="brand" subtext="Adjust spacing, type, colors, and component props in the live page." showSubtext />
            </div>
            <Card eyebrow="03 · Review" title="Keep every move legible" icon="⌘" subtext="Inspect the diff, preview checkpoints, and restore without rewriting history." showSubtext />
          </div>
        </div>
      </section>

      {walkthroughActive && (
        <div className={`walkthrough-layer walkthrough-layer--${activeStep.target} ${isInPageTarget ? "is-in-page" : ""}`} aria-live="polite">
          {spotlightRect && isInPageTarget && (
            <div
              className="walkthrough-spotlight"
              aria-hidden="true"
              style={{
                top: spotlightRect.top - 8,
                left: spotlightRect.left - 8,
                width: spotlightRect.width + 16,
                height: spotlightRect.height + 16,
              }}
            />
          )}
          {targetArrow && activeStep.targetLabel && (
            <div className={`edge-pointer edge-pointer--${activeStep.target}`}>
              <span className="edge-pointer__arrow" aria-hidden="true">{targetArrow}</span>
              <strong>{activeStep.targetLabel}</strong>
            </div>
          )}

          <section className={`walkthrough-card walkthrough-card--for-${activeStep.target}`} aria-labelledby="walkthrough-title">
            <div className="walkthrough-card__topline">
              <span>{activeStep.kicker} · {currentActionNumber}/{actionableStepCount}</span>
              <button type="button" onClick={() => setWalkthroughActive(false)} aria-label="Exit walkthrough">Exit ×</button>
            </div>
            <h2 id="walkthrough-title">{activeStep.title}</h2>
            <p>{activeStep.body}</p>
            <div className="walkthrough-instruction"><span aria-hidden="true">→</span><strong>{activeStep.instruction}</strong></div>
            {activeStep.image && (
              <div className="walkthrough-reference">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeStep.image} alt={activeStep.imageAlt ?? "Make Local product reference"} />
                <span>What you should see</span>
              </div>
            )}
            {validationMessage && <p className="walkthrough-error" role="alert">{validationMessage}</p>}
            <div className="walkthrough-actions">
              <button type="button" className="walkthrough-back" onClick={goBack} disabled={activeIndex === 0}>Back</button>
              <button type="button" className="walkthrough-next" onClick={advanceWalkthrough}>{activeStep.nextLabel}<span aria-hidden="true">→</span></button>
            </div>
          </section>
        </div>
      )}

      {!walkthroughActive && (
        <button
          className="resume-walkthrough"
          type="button"
          onClick={activeIndex === WALKTHROUGH_STEPS.length - 1 ? restartWalkthrough : () => setWalkthroughActive(true)}
        >
          <span aria-hidden="true">▶</span> {activeIndex === WALKTHROUGH_STEPS.length - 1 ? "Restart walkthrough" : "Resume walkthrough"}
        </button>
      )}

      <section className="labs-section" id="labs" aria-labelledby="labs-title">
        <div className="labs-heading"><div><Badge text="Figma MCP + team workflows" tone="neutral" /><h2 id="labs-title">There&apos;s more to try!</h2></div><p>Paste a focused Design reference, watch it become local code, then grow into libraries and Code Connect. Smaller requests move faster; larger changes reward clear intent and patient review.</p></div>
        <div className="labs-grid">{LABS.map((lab) => <LabCard key={lab.number} number={lab.number} title={lab.title} showArrow={false}>{lab.text}</LabCard>)}</div>
      </section>

      <footer><FigmaMark /><p>Make Local Lobby · Learn by making.</p><span>Everything stays on your machine until you choose to share it.</span></footer>
    </main>
  );
}
