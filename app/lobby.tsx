"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, LabCard } from "./components/ui";

type TourTarget = "top-left" | "bottom-left" | "bottom-center" | "left" | "properties" | "toolbar-edit" | "toolbar-annotate" | "toolbar-copy";
type TourVisual = "screenshot" | "edit-task" | "button" | "card";
type CompletionMode = "manual" | "timed" | "button-large" | "button-medium" | "card-default";
type TourScreen = "welcome" | "active" | "paused" | "complete";

type TourStep = {
  id: string;
  mission: string;
  title: string;
  instruction: string;
  target: TourTarget;
  targetLabel: string;
  visual: TourVisual;
  image?: string;
  imageAlt?: string;
  completion: CompletionMode;
  confirmLabel?: string;
  detectionLabel?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "create-branch",
    mission: "Git foundations",
    title: "Create a safe branch",
    instruction: "Open main, choose Create branch…, and name it workshop/<your-name>.",
    target: "bottom-left",
    targetLabel: "Branch picker",
    visual: "screenshot",
    image: "/tour/branch-picker.webp",
    imageAlt: "Make Local branch picker showing main and Create branch.",
    completion: "manual",
    confirmLabel: "I’m on my branch",
  },
  {
    id: "make-button-large",
    mission: "Point & Edit",
    title: "Make the button larger",
    instruction: "Click Edit, select the blue button, then open Size in the upper-right properties panel and choose Large.",
    target: "properties",
    targetLabel: "Size property",
    visual: "edit-task",
    image: "/tour/edit-control-zoom.png",
    imageAlt: "Zoomed Make Local toolbar showing the Edit control selected.",
    completion: "button-large",
    detectionLabel: "Waiting for the rendered Button to become Large",
  },
  {
    id: "turn-off-edit",
    mission: "Point & Edit",
    title: "Turn Edit off",
    instruction: "Click the highlighted Edit control again so the preview returns to normal interaction.",
    target: "toolbar-edit",
    targetLabel: "Edit",
    visual: "screenshot",
    image: "/tour/edit-control-zoom.png",
    imageAlt: "Zoomed Make Local toolbar showing the selected Edit control.",
    completion: "timed",
    detectionLabel: "The next step will open automatically — no page click needed",
  },
  {
    id: "inspect-change",
    mission: "Review & recover",
    title: "Inspect the change",
    instruction: "Open Commits, hover the newest version, and choose View changes.",
    target: "top-left",
    targetLabel: "Commits",
    visual: "screenshot",
    image: "/tour/commit-actions.webp",
    imageAlt: "Make Local commit actions with View changes visible.",
    completion: "manual",
    confirmLabel: "I see the diff",
  },
  {
    id: "restore-version",
    mission: "Review & recover",
    title: "Restore the earlier version",
    instruction: "Choose Restore commit on the earlier checkpoint and watch the button return to Medium.",
    target: "top-left",
    targetLabel: "Commit actions",
    visual: "button",
    completion: "button-medium",
    detectionLabel: "Waiting for the rendered Button to return to Medium",
  },
  {
    id: "pin-card",
    mission: "Annotate",
    title: "Pin the card you mean",
    instruction: "Turn on Annotate, then click the orange Card below to attach your request.",
    target: "toolbar-annotate",
    targetLabel: "Annotate",
    visual: "card",
    completion: "manual",
    confirmLabel: "The card is pinned",
  },
  {
    id: "apply-annotation",
    mission: "Annotate",
    title: "Apply a precise request",
    instruction: "Ask “Use @Card and set Emphasis to Default,” then click Apply in chat.",
    target: "left",
    targetLabel: "Apply in chat",
    visual: "card",
    completion: "card-default",
    detectionLabel: "Waiting for the rendered Card to use Default emphasis",
  },
  {
    id: "capture-page",
    mission: "Code to canvas",
    title: "Capture the page",
    instruction: "Click Copy designs in the preview toolbar and wait for Ready to send.",
    target: "toolbar-copy",
    targetLabel: "Copy designs",
    visual: "screenshot",
    image: "/tour/copy-designs-control-zoom.png",
    imageAlt: "Zoomed Make Local toolbar showing the outlined-layers Copy designs control.",
    completion: "manual",
    confirmLabel: "Ready to send is visible",
  },
  {
    id: "send-design",
    mission: "Code to canvas",
    title: "Send it to Design",
    instruction: "Choose Copy to clipboard, a recent Design file, or New file.",
    target: "bottom-center",
    targetLabel: "Ready to send",
    visual: "screenshot",
    image: "/tour/copy-designs.webp",
    imageAlt: "Ready to send toolbar with Design destinations.",
    completion: "manual",
    confirmLabel: "Sent to Design",
  },
];

const LABS = [
  { number: "01", title: "Implement a Design", text: "Paste a focused Figma frame into chat and implement it with Figma MCP." },
  { number: "02", title: "Scope with intent", text: "Start with one component or section. Smaller requests are faster to review." },
  { number: "03", title: "Create the library", text: "Use Figma MCP to establish components and variables when a library is missing." },
  { number: "04", title: "Connect code to Design", text: "Verify Code Connect mappings so the right components survive the handoff." },
  { number: "05", title: "Try another branch", text: "Switch branches, compare token changes, then return to your work." },
  { number: "06", title: "Share for review", text: "Push your workshop branch and open a pull request for review." },
];

const STORAGE_KEY = "make-local-lobby-guided-tour-v2";

const TARGET_ARROWS: Record<TourTarget, string> = {
  "top-left": "↖",
  "bottom-left": "↙",
  "bottom-center": "↓",
  left: "←",
  properties: "↗",
  "toolbar-edit": "↑",
  "toolbar-annotate": "↑",
  "toolbar-copy": "↑",
};

function FigmaMark() {
  return (
    <span className="figma-mark" aria-label="Figma">
      <i className="mark-red" /><i className="mark-orange" /><i className="mark-purple" />
      <i className="mark-blue" /><i className="mark-green" />
    </span>
  );
}

function isExpectedChange(step: TourStep) {
  if (step.completion === "button-large" || step.completion === "button-medium") {
    const button = document.querySelector<HTMLElement>("[data-tour-target='hero-cta']");
    const expectedSize = step.completion === "button-large" ? "large" : "medium";
    return button?.dataset.size === expectedSize;
  }

  if (step.completion === "card-default") {
    const card = document.querySelector<HTMLElement>("[data-tour-target='editable-card'] .feature-card");
    return card?.dataset.emphasis === "default";
  }

  return false;
}

export function Lobby() {
  const [screen, setScreen] = useState<TourScreen>("welcome");
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [detected, setDetected] = useState(false);
  const [ready, setReady] = useState(false);
  const stepTitleRef = useRef<HTMLHeadingElement>(null);

  const activeStep = TOUR_STEPS[activeIndex];
  const completedCount = completedIds.length;
  const progress = Math.round((completedCount / TOUR_STEPS.length) * 100);
  const isCompletedStep = completedIds.includes(activeStep.id);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const saved = JSON.parse(stored);
          const index = Number(saved.activeIndex);
          const validIds = new Set(TOUR_STEPS.map((step) => step.id));
          if (Number.isInteger(index) && index >= 0 && index < TOUR_STEPS.length) setActiveIndex(index);
          if (["welcome", "active", "paused", "complete"].includes(saved.screen)) setScreen(saved.screen);
          if (Array.isArray(saved.completedIds)) setCompletedIds(saved.completedIds.filter((id: string) => validIds.has(id)));
        }
      } catch {
        // Local progress is helpful, never required.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, screen, activeIndex, completedIds }));
  }, [activeIndex, completedIds, ready, screen]);

  useEffect(() => {
    if (screen !== "active") return;
    stepTitleRef.current?.focus();
  }, [activeIndex, screen]);

  useEffect(() => {
    if (screen !== "active" || activeStep.completion === "manual" || isCompletedStep) return;

    let advanceTimer: number | undefined;
    let hasDetected = false;

    if (activeStep.completion === "timed") {
      advanceTimer = window.setTimeout(() => {
        setCompletedIds((current) => current.includes(activeStep.id) ? current : [...current, activeStep.id]);
        setActiveIndex((index) => Math.min(index + 1, TOUR_STEPS.length - 1));
      }, 4200);
      return () => window.clearTimeout(advanceTimer);
    }

    function checkForChange() {
      if (hasDetected || !isExpectedChange(activeStep)) return;
      hasDetected = true;
      setDetected(true);
      setCompletedIds((current) => current.includes(activeStep.id) ? current : [...current, activeStep.id]);
      advanceTimer = window.setTimeout(() => {
        setDetected(false);
        setActiveIndex((index) => Math.min(index + 1, TOUR_STEPS.length - 1));
      }, 850);
    }

    const animationFrame = window.requestAnimationFrame(checkForChange);
    const interval = window.setInterval(checkForChange, 500);
    const observer = new MutationObserver(checkForChange);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(interval);
      if (advanceTimer) window.clearTimeout(advanceTimer);
      observer.disconnect();
    };
  }, [activeStep, isCompletedStep, screen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && screen === "active") setScreen("paused");
      if (event.key === "ArrowLeft" && screen === "active" && activeIndex > 0) {
        setDetected(false);
        setActiveIndex((index) => index - 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, screen]);

  const statusCopy = useMemo(() => {
    if (detected) return "Change detected — advancing";
    if (isCompletedStep) return "Completed";
    if (activeStep.completion === "manual") return "Complete this in Make Local, then confirm below.";
    return activeStep.detectionLabel;
  }, [activeStep, detected, isCompletedStep]);

  function completeCurrentStep() {
    setCompletedIds((current) => current.includes(activeStep.id) ? current : [...current, activeStep.id]);
    setDetected(false);
    if (activeIndex === TOUR_STEPS.length - 1) {
      setScreen("complete");
      return;
    }
    setActiveIndex((index) => index + 1);
  }

  function goBack() {
    setDetected(false);
    if (activeIndex === 0) setScreen("welcome");
    else setActiveIndex((index) => index - 1);
  }

  function restartTour() {
    setActiveIndex(0);
    setCompletedIds([]);
    setDetected(false);
    setScreen("welcome");
  }

  const showButtonTarget = screen !== "complete";
  const showCardTarget = screen !== "complete";

  return (
    <main className="lobby-shell">
      <section className={`tour-stage tour-stage--${screen}`} aria-label="Make Local guided lobby">
        {screen === "active" && (
          <div className={`edge-pointer edge-pointer--${activeStep.target}`} aria-hidden="true">
            <span>{TARGET_ARROWS[activeStep.target]}</span>
            <strong>{activeStep.targetLabel}</strong>
          </div>
        )}

        {screen === "welcome" && (
          <section className="welcome-card" aria-labelledby="welcome-title">
            <FigmaMark />
            <Badge text="5–10 minute quick tour" tone="brand" />
            <h1 id="welcome-title">Design directly on your local code.</h1>
            <p>Make Local opens a cloned Git repository as a live, editable preview in Figma. Point at rendered UI, guide an agent with context, and keep every change reviewable through branches, commits, and diffs.</p>
            <Button label="Start the quick tour" size="large" onClick={() => setScreen("active")} />
          </section>
        )}

        {screen === "active" && (
          <section className="tour-card" aria-labelledby="active-step-title">
            <div className="tour-card__topline">
              <span>Quick tour · Step {activeIndex + 1} of {TOUR_STEPS.length}</span>
              <div className="tour-card__controls">
                <button type="button" onClick={restartTour}>Reset tour</button>
                <button type="button" onClick={() => setScreen("paused")}>Exit ×</button>
              </div>
            </div>
            <div className="tour-progress" aria-label={`${progress}% of tour complete`}><span style={{ width: `${progress}%` }} /></div>
            <p className="tour-mission">{activeStep.mission}</p>
            <h1 id="active-step-title" ref={stepTitleRef} tabIndex={-1}>{activeStep.title}</h1>
            <p className="tour-instruction">{activeStep.instruction}</p>

            <div className={`tour-visual tour-visual--${activeStep.visual}`}>
              {activeStep.visual === "screenshot" && activeStep.image && (
                // Native images preserve the exact pixels of the product-reference crops.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeStep.image} alt={activeStep.imageAlt ?? "Make Local product reference"} />
              )}

              {activeStep.visual === "edit-task" && activeStep.image && (
                <div className="edit-control-zoom">
                  <span>1 · Click Edit in the toolbar</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeStep.image} alt={activeStep.imageAlt ?? "Zoomed Edit control"} />
                </div>
              )}

              {showButtonTarget && (
                <div className={activeStep.visual === "button" || activeStep.visual === "edit-task" ? "live-target live-target--button is-visible" : "live-target live-target--button"}>
                  {activeStep.visual === "edit-task" && <span className="live-target__label">2 · Select this in the preview</span>}
                  <Button label="Try editing me" size="medium" data-tour-target="hero-cta" />
                </div>
              )}

              {activeStep.visual === "edit-task" && (
                <div className="property-change" aria-label="Change the Size property from Medium to Large">
                  <span>3 · In Button properties</span>
                  <div><strong>Size</strong><b>Medium</b><i aria-hidden="true">→</i><b className="is-target">Large</b></div>
                </div>
              )}

              {showCardTarget && (
                <div data-tour-target="editable-card" className={activeStep.visual === "card" ? "live-target live-target--card is-visible" : "live-target live-target--card"}>
                  <Card eyebrow="Editable Card" title="Point at what you mean" icon="⌖" emphasis="brand">Use this real component for the annotation task.</Card>
                </div>
              )}
            </div>

            <p className={detected ? "tour-status is-detected" : "tour-status"} aria-live="polite">
              <span aria-hidden="true">{detected || isCompletedStep ? "✓" : activeStep.completion === "manual" ? "→" : "⌁"}</span>
              {statusCopy}
            </p>

            <div className="tour-actions">
              <button type="button" className="tour-back" onClick={goBack}>Back</button>
              {(activeStep.completion === "manual" || isCompletedStep) && (
                <button type="button" className="tour-next" onClick={completeCurrentStep}>
                  {isCompletedStep ? "Continue" : activeStep.confirmLabel}<span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </section>
        )}

        {screen === "paused" && (
          <section className="paused-card" aria-labelledby="paused-title">
            <p>Quick tour paused</p>
            <h1 id="paused-title">Pick up at step {activeIndex + 1}.</h1>
            <div>
              <button type="button" className="tour-back" onClick={restartTour}>Restart</button>
              <button type="button" className="tour-next" onClick={() => setScreen("active")}>Resume tour<span aria-hidden="true">→</span></button>
            </div>
          </section>
        )}

        {screen === "complete" && (
          <section className="complete-card" aria-labelledby="complete-title">
            <Badge text="Tour complete" tone="success" />
            <h1 id="complete-title">You completed the local ↔ Design loop.</h1>
            <p>You branched safely, edited real components, reviewed and restored history, annotated with context, and sent the result to Design.</p>
            <div className="update-make-note">
              <div><span>Design → Make</span><strong>Changed the attached frame?</strong></div>
              <p>In Figma Design, choose <b>Update Make</b> in the frame toolbelt to send those changes back to Make.</p>
            </div>
            <button type="button" className="tour-back" onClick={restartTour}>Restart tour</button>

            <details className="more-to-try">
              <summary>More to try <span aria-hidden="true">＋</span></summary>
              <div className="labs-grid">
                {LABS.map((lab) => <LabCard key={lab.number} number={lab.number} title={lab.title} showArrow={false}>{lab.text}</LabCard>)}
              </div>
            </details>
          </section>
        )}
      </section>
    </main>
  );
}
