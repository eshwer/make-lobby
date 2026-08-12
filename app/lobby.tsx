"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, LabCard } from "./components/ui";

type Mission = {
  id: string;
  kicker: string;
  title: string;
  duration: string;
  summary: string;
  location: string;
  image: string;
  imageAlt: string;
  lookFor: string;
  steps: string[];
  outcome: string;
  action: string;
  validator?: "large-button";
};

const MISSIONS: Mission[] = [
  {
    id: "branch",
    kicker: "Git foundations",
    title: "Make a safe branch",
    duration: "1 min",
    summary: "Keep main stable while you experiment in your own workspace.",
    location: "Bottom bar → main → Create branch…",
    image: "/tour/branch-picker.webp",
    imageAlt: "Make Local branch picker showing main and the Create branch action.",
    lookFor: "The current branch sits below the prompt box—not in the top toolbar.",
    steps: [
      "At the bottom of the agent panel, click the current branch name: main.",
      "Choose Create branch… in the dark branch menu.",
      "Name it workshop/<your-name>, then choose Create and check out.",
    ],
    outcome: "You are now working on an isolated branch. Make Local can save agent edits as versioned commits here.",
    action: "I’m on my branch",
  },
  {
    id: "edit",
    kicker: "Point and edit",
    title: "Make the CTA bigger",
    duration: "2 min",
    summary: "Select the real rendered button and change its source-backed properties.",
    location: "Preview toolbar → Edit → select the blue CTA",
    image: "/tour/design-mode.webp",
    imageAlt: "Make Local Design mode with a rendered heading selected and the properties panel open on the right.",
    lookFor: "A blue outline appears on the page and the right panel changes from Page styles to the selected element.",
    steps: [
      "In the preview toolbar, choose Edit—the cursor-with-spark icon.",
      "Click the blue Start designing button. Confirm its blue outline and right-hand panel.",
      "Under Properties, change Size from Medium to Large, then apply the pending edit.",
    ],
    outcome: "The visual change becomes a focused code edit, and the preview hot-reloads in place.",
    action: "Check my button",
    validator: "large-button",
  },
  {
    id: "review",
    kicker: "Review and recover",
    title: "Inspect and restore",
    duration: "3 min",
    summary: "Inspect the code diff, preview a checkpoint, and recover without deleting history.",
    location: "Top bar → Commits → hover a version → •••",
    image: "/tour/commit-actions.webp",
    imageAlt: "Make Local commit history with Preview commit, View changes, and Restore commit actions open.",
    lookFor: "The action menu only appears after you hover a commit row and choose its three dots.",
    steps: [
      "Open Commits in the top bar and hover the latest version.",
      "Choose •••, then View changes to inspect the code diff.",
      "On an earlier version, choose ••• → Preview commit, then Restore commit. Confirm a new latest version appears.",
    ],
    outcome: "Restore creates a new commit with the older snapshot, so the branch keeps a legible record of every checkpoint.",
    action: "I reviewed and restored",
  },
  {
    id: "annotate",
    kicker: "Direct the agent",
    title: "Annotate with context",
    duration: "2 min",
    summary: "Pin a request to the exact rendered element and name the component the agent should use.",
    location: "Preview toolbar → Annotate for agent → select a card",
    image: "/tour/annotate-for-agent.webp",
    imageAlt: "Make Local annotation mode showing a selected heading, numbered pin, and Ask for changes composer.",
    lookFor: "The element gets a blue outline and numbered pin, with an Ask for changes composer anchored beside it.",
    steps: [
      "Choose Annotate for agent—the note icon beside Edit in the preview toolbar.",
      "Click the orange Edit with design controls card to place a numbered annotation pin.",
      "Type “Use @Card with brand emphasis,” choose Card under Components, submit the note, then Apply it in chat.",
    ],
    outcome: "The pin carries element context, while the @Card mention tells the agent which reusable code component should satisfy the request.",
    action: "I applied the annotation",
  },
  {
    id: "roundtrip",
    kicker: "Code to canvas",
    title: "Send it to Design",
    duration: "2 min",
    summary: "Turn the running page into editable Figma layers without rebuilding it by hand.",
    location: "Preview toolbar → Copy designs → Ready to send",
    image: "/tour/copy-designs.webp",
    imageAlt: "Make Local Ready to send toolbar with Copy to clipboard, a recent file, and New file options.",
    lookFor: "Copy designs opens a dark Ready to send toolbar at the bottom of the preview.",
    steps: [
      "Choose Copy designs—the outlined-layers icon in the preview toolbar.",
      "Choose Copy to clipboard, or open its arrow to send to a recent Design file or New file.",
      "Edit the attached frame in Figma Desktop; after a change, choose Update Make in its toolbelt.",
    ],
    outcome: "Code Connect can replace matching DOM output with real library instances and carry supported props across the handoff.",
    action: "My update is back",
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

const STORAGE_KEY = "make-local-lobby-progress-v1";

function FigmaMark() {
  return (
    <span className="figma-mark" aria-label="Figma">
      <i className="mark-red" /><i className="mark-orange" /><i className="mark-purple" />
      <i className="mark-blue" /><i className="mark-green" />
    </span>
  );
}

export function Lobby() {
  const [activeId, setActiveId] = useState(MISSIONS[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, number[]>>({});
  const [expandedShot, setExpandedShot] = useState<Mission | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Start with the branch control below the agent panel.");

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const progress = JSON.parse(stored);
          const validMissionIds = new Set(MISSIONS.map((mission) => mission.id));
          setCompleted((progress.completed ?? []).filter((id: string) => validMissionIds.has(id)));
          setCheckedSteps(progress.checkedSteps ?? {});
        }
      } catch {
        // Progress is helpful, never required.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, completed, checkedSteps }));
  }, [checkedSteps, completed, ready]);

  useEffect(() => {
    if (!expandedShot) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExpandedShot(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expandedShot]);

  const active = useMemo(() => MISSIONS.find((mission) => mission.id === activeId) ?? MISSIONS[0], [activeId]);
  const progress = Math.round((completed.length / MISSIONS.length) * 100);
  const activeCheckedSteps = checkedSteps[active.id] ?? [];

  function toggleStep(missionId: string, stepIndex: number) {
    setCheckedSteps((current) => {
      const missionSteps = current[missionId] ?? [];
      const next = missionSteps.includes(stepIndex)
        ? missionSteps.filter((index) => index !== stepIndex)
        : [...missionSteps, stepIndex];
      return { ...current, [missionId]: next };
    });
  }

  function completeMission(mission: Mission) {
    const missionSteps = checkedSteps[mission.id] ?? [];
    if (missionSteps.length < mission.steps.length) {
      setNotice(`Check off all ${mission.steps.length} steps in “${mission.title}” first.`);
      return;
    }

    if (mission.validator === "large-button") {
      const target = document.querySelector<HTMLElement>("[data-tour-target='hero-cta']");
      if (target?.dataset.size !== "large") {
        setNotice("Not quite yet — select the blue CTA in Design mode and set Size to Large.");
        return;
      }
    }

    setCompleted((current) => current.includes(mission.id) ? current : [...current, mission.id]);
    const index = MISSIONS.findIndex((item) => item.id === mission.id);
    const next = MISSIONS[index + 1];
    setNotice(next ? `Nice. Next up: ${next.title}.` : "Tour complete — you made the full local-to-Design loop.");
    if (next) setActiveId(next.id);
  }

  function resetTour() {
    setCompleted([]);
    setCheckedSteps({});
    setActiveId(MISSIONS[0].id);
    setNotice("Tour progress reset. Your Git history and code are unchanged.");
  }

  return (
    <main className="lobby-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Make Local Lobby home">
          <FigmaMark />
          <span className="brand-name">Make Local</span>
          <span className="brand-divider" />
          <span className="brand-section">Lobby</span>
        </a>
        <div className="topbar-actions">
          <span className="local-status"><i /> Running locally</span>
          <button className="text-button" type="button" onClick={resetTour}>Reset tour</button>
        </div>
      </header>

      <section className="intro" id="top">
        <div>
          <Badge text="5–10 minute quick tour" tone="brand" />
          <h1>Design on code</h1>
          <p>Take a tour to understand the features available in Make. </p>
        </div>
        <div className="intro-progress" aria-label={`${progress}% of tour complete`}>
          <div className="progress-copy"><span>Your progress</span><strong>{completed.length}/{MISSIONS.length}</strong></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <p aria-live="polite">{notice}</p>
        </div>
      </section>

      <div className="workspace">
        <nav className="mission-rail" aria-label="Quick tour missions">
          <div className="rail-heading"><span>Quick tour</span><small>about 10 min</small></div>
          <ol>
            {MISSIONS.map((mission, index) => {
              const isDone = completed.includes(mission.id);
              const isActive = mission.id === active.id;
              return (
                <li key={mission.id}>
                  <button className={isActive ? "mission-link is-active" : "mission-link"} onClick={() => setActiveId(mission.id)} type="button">
                    <span className={isDone ? "mission-number is-done" : "mission-number"}>{isDone ? "✓" : index + 1}</span>
                    <span><small>{mission.kicker}</small><strong>{mission.title}</strong></span>
                    <em>{mission.duration}</em>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="rail-note"><span aria-hidden="true">⌘</span><p><strong>No terminal required</strong><br />After cloning, every step happens in Make Local.</p></div>
        </nav>

        <aside className="coach-card" id="mission-guide" aria-labelledby="active-mission-title">
          <div className="coach-topline"><span>{String(MISSIONS.indexOf(active) + 1).padStart(2, "0")}</span><Badge text={active.duration} tone="neutral" /></div>
          <p className="coach-kicker">{active.kicker}</p>
          <h2 id="active-mission-title">{active.title}</h2>
          <p className="coach-summary">{active.summary}</p>
          <div className="control-location"><span>Find it</span><strong>{active.location}</strong></div>
          <button className={`reference-shot reference-shot--${active.id}`} type="button" onClick={() => setExpandedShot(active)} aria-label={`Open larger product reference for ${active.title}`}>
            {/* Native images preserve the exact pixels of these tiny product-reference crops. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.image} alt={active.imageAlt} />
            <span><i /> Observed in Make Local <strong>Open larger ↗</strong></span>
          </button>
          <p className="look-for"><strong>What to look for</strong>{active.lookFor}</p>
          <div className="checklist-heading"><span>Do this in Make Local</span><strong>{activeCheckedSteps.length}/{active.steps.length}</strong></div>
          <ol className="mission-checklist">
            {active.steps.map((step, index) => {
              const isChecked = activeCheckedSteps.includes(index);
              return (
                <li key={step}>
                  <button type="button" aria-pressed={isChecked} className={isChecked ? "is-checked" : ""} onClick={() => toggleStep(active.id, index)}>
                    <span>{isChecked ? "✓" : index + 1}</span><span>{step}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="outcome"><span aria-hidden="true">◇</span><p><strong>What you’ll learn</strong>{active.outcome}</p></div>
          <Button label={completed.includes(active.id) ? "Completed" : active.action} variant={completed.includes(active.id) ? "secondary" : "primary"} onClick={() => completeMission(active)} disabled={completed.includes(active.id)} />
          <p className="coach-feedback" aria-live="polite">{notice}</p>
        </aside>

        <section className="canvas" aria-label="Editable playground">
          <div className="canvas-toolbar">
            <div><span className="canvas-dot canvas-dot--red" /><span className="canvas-dot canvas-dot--yellow" /><span className="canvas-dot canvas-dot--green" /></div>
            <span>localhost · editable playground</span>
            <Badge text="Live" tone="success" />
          </div>

          <div className="canvas-body">
            <div className="playground">
            <section className="hero-card" data-tour-target="hero-card">
              <div className="hero-copy">
                <Badge text="Local-first design" tone="neutral" />
                <h2>From intent to interface,<br /><span>without the handoff gap.</span></h2>
                <p>Explore freely in a safe branch. Every meaningful change becomes reviewable code, ready for your team.</p>
                <div className="hero-actions">
                  <Button label="Start designing" size="medium" data-tour-target="hero-cta" />
                  <span className="hero-hint">← Your first edit target</span>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="art-frame"><div className="art-toolbar" /><div className="art-sidebar" /><div className="art-object art-object--a" /><div className="art-object art-object--b" /></div>
                <div className="cursor cursor--blue">M</div><div className="cursor cursor--pink">A</div>
              </div>
            </section>

            <div className="feature-grid" data-tour-target="feature-grid">
              <Card eyebrow="01 · Select" title="Point at what you mean" icon="⌖">Select any rendered element. Make Local traces it back to the component and source that produced it.</Card>
              <Card eyebrow="02 · Change" title="Edit with design controls" icon="◫" emphasis="brand">Adjust spacing, type, colors, and component props while staying in the context of the live page.</Card>
              <Card eyebrow="03 · Review" title="Keep every move legible" icon="⌘">Inspect the diff, preview any checkpoint, and restore without rewriting shared history.</Card>
            </div>
            </div>
          </div>
        </section>
      </div>

      {expandedShot && (
        <div className="shot-modal" role="dialog" aria-modal="true" aria-labelledby="shot-modal-title">
          <button className="shot-modal__backdrop" type="button" aria-label="Close product reference" onClick={() => setExpandedShot(null)} />
          <div className={`shot-modal__card shot-modal__card--${expandedShot.id}`}>
            <div className="shot-modal__header">
              <div><span>Real Make Local reference</span><h2 id="shot-modal-title">{expandedShot.title}</h2></div>
              <button type="button" onClick={() => setExpandedShot(null)} aria-label="Close product reference">Close ×</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={expandedShot.image} alt={expandedShot.imageAlt} />
            <p><strong>{expandedShot.location}</strong>{expandedShot.lookFor}</p>
          </div>
        </div>
      )}

      <section className="labs-section" aria-labelledby="labs-title">
        <div className="labs-heading"><div><Badge text="Figma MCP + team workflows" tone="neutral" /><h2 id="labs-title">There's more to try! </h2></div><p>Paste a focused Design reference, watch it become local code, then grow into libraries and Code Connect. Smaller requests move faster; larger changes reward clear intent and patient review.</p></div>
        <div className="labs-grid">{LABS.map((lab) => <LabCard key={lab.number} number={lab.number} title={lab.title}>{lab.text}</LabCard>)}</div>
      </section>

      <footer><FigmaMark /><p>Make Local Lobby · A safe place to learn by making.</p><span>Everything stays on your machine until you choose to share it.</span></footer>
    </main>
  );
}
