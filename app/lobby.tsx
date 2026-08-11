"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card } from "./components/ui";

type Mission = {
  id: string;
  kicker: string;
  title: string;
  duration: string;
  summary: string;
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
    steps: [
      "Open the branch picker in Make Local.",
      "Choose Create branch…",
      "Create and check out workshop/<your-name> from main.",
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
    steps: [
      "Enter Design mode and select the blue Start designing button.",
      "In Properties, change Size from Medium to Large.",
      "Try swapping its horizontal padding to --space-6, then apply the staged edit.",
    ],
    outcome: "The visual change becomes a focused code edit, and the preview hot-reloads in place.",
    action: "Check my button",
    validator: "large-button",
  },
  {
    id: "review",
    kicker: "Review the work",
    title: "Inspect the version",
    duration: "2 min",
    summary: "See exactly what changed before the work moves anywhere else.",
    steps: [
      "Open Commits in the Make Local toolbar.",
      "Choose View changes on the latest version.",
      "Preview the prior commit, then choose Close preview.",
    ],
    outcome: "A commit is a named checkpoint; a branch is the safe lane that contains a series of checkpoints.",
    action: "I reviewed the diff",
  },
  {
    id: "roundtrip",
    kicker: "Code to canvas",
    title: "Send it to Design",
    duration: "2 min",
    summary: "Turn the running page into editable Figma layers without rebuilding it by hand.",
    steps: [
      "Choose Copy designs in the Make Local toolbar.",
      "Select New file, or copy and paste into an open Design file.",
      "Edit the frame in Figma Desktop and choose Update Make.",
    ],
    outcome: "Code Connect can replace matching DOM output with real library instances and carry supported props across the handoff.",
    action: "My update is back",
  },
  {
    id: "restore",
    kicker: "Recover with confidence",
    title: "Restore a checkpoint",
    duration: "1 min",
    summary: "Return to a known-good state without deleting the story of how you got there.",
    steps: [
      "Open Commits and find the version before your Design update.",
      "Choose Preview commit to confirm the state.",
      "Choose Restore commit, then return to the latest preview.",
    ],
    outcome: "Restore creates a new commit with the older snapshot. Intervening history remains available.",
    action: "I restored safely",
  },
];

const LABS = [
  { number: "01", title: "Direct the agent", text: "Select one card and ask the agent to make only that card more prominent." },
  { number: "02", title: "Insert an asset", text: "Open Assets and drag a code-connected component into the playground." },
  { number: "03", title: "Try another branch", text: "Switch to tour/alternate-theme, compare the token changes, then return." },
  { number: "04", title: "Share for review", text: "Fork the repo, push your workshop branch, and open a pull request from Make Local." },
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
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Choose the first mission when you’re ready.");

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setCompleted(JSON.parse(stored).completed ?? []);
      } catch {
        // Progress is helpful, never required.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed }));
  }, [completed, ready]);

  const active = useMemo(() => MISSIONS.find((mission) => mission.id === activeId) ?? MISSIONS[0], [activeId]);
  const progress = Math.round((completed.length / MISSIONS.length) * 100);

  function completeMission(mission: Mission) {
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
    setActiveId(MISSIONS[0].id);
    setNotice("Progress reset. Your Git history and code are unchanged.");
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
          <h1>Design in the real thing.</h1>
          <p>Make visual changes directly in your local codebase, save them safely with Git, and carry the result back into Figma Design.</p>
        </div>
        <div className="intro-progress" aria-label={`${progress}% of tour complete`}>
          <div className="progress-copy"><span>Your progress</span><strong>{completed.length}/{MISSIONS.length}</strong></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <p aria-live="polite">{notice}</p>
        </div>
      </section>

      <div className="workspace">
        <nav className="mission-rail" aria-label="Quick tour missions">
          <div className="rail-heading"><span>Quick tour</span><small>about 8 min</small></div>
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

        <section className="canvas" aria-label="Editable playground">
          <div className="canvas-toolbar">
            <div><span className="canvas-dot canvas-dot--red" /><span className="canvas-dot canvas-dot--yellow" /><span className="canvas-dot canvas-dot--green" /></div>
            <span>localhost · editable playground</span>
            <Badge text="Live" tone="success" />
          </div>

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
        </section>

        <aside className="coach-card" aria-labelledby="active-mission-title">
          <div className="coach-topline"><span>{String(MISSIONS.indexOf(active) + 1).padStart(2, "0")}</span><Badge text={active.duration} tone="neutral" /></div>
          <p className="coach-kicker">{active.kicker}</p>
          <h2 id="active-mission-title">{active.title}</h2>
          <p className="coach-summary">{active.summary}</p>
          <ol>{active.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <div className="outcome"><span aria-hidden="true">◇</span><p><strong>What you’ll learn</strong>{active.outcome}</p></div>
          <Button label={completed.includes(active.id) ? "Completed" : active.action} variant={completed.includes(active.id) ? "secondary" : "primary"} onClick={() => completeMission(active)} disabled={completed.includes(active.id)} />
        </aside>
      </div>

      <section className="labs-section" aria-labelledby="labs-title">
        <div className="labs-heading"><div><Badge text="Explore more" tone="neutral" /><h2 id="labs-title">Keep going when curiosity wins.</h2></div><p>The core loop is complete. These optional challenges show how Make Local scales from a quick edit to team collaboration.</p></div>
        <div className="labs-grid">{LABS.map((lab) => <article key={lab.number}><span>{lab.number}</span><h3>{lab.title}</h3><p>{lab.text}</p><span className="lab-arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>

      <footer><FigmaMark /><p>Make Local Lobby · A safe place to learn by making.</p><span>Everything stays on your machine until you choose to share it.</span></footer>
    </main>
  );
}
