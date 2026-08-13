import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Make Local Lobby", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Make Local Lobby<\/title>/i);
  assert.match(html, /Learn Make Local one action at a time/);
  assert.match(html, /Nine short tasks/);
  assert.match(html, /Start the quick tour/);
  assert.doesNotMatch(html, /mission-rail|mission-checklist|Do this in Make Local/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("defines nine atomic guided actions with hybrid completion", async () => {
  const source = await readFile(new URL("../app/lobby.tsx", import.meta.url), "utf8");
  const orderedSteps = [
    "Create a safe branch",
    "Turn on Edit",
    "Make the button larger",
    "Inspect the change",
    "Restore the earlier version",
    "Pin the card you mean",
    "Apply a precise request",
    "Capture the page",
    "Send it to Design",
  ];
  let previousIndex = -1;
  for (const title of orderedSteps) {
    const index = source.indexOf(`title: "${title}"`);
    assert.ok(index > previousIndex, `${title} should follow the previous action`);
    previousIndex = index;
  }
  assert.equal((source.match(/completion: "manual"/g) ?? []).length, 6);
  assert.match(source, /completion: "button-large"/);
  assert.match(source, /completion: "button-medium"/);
  assert.match(source, /completion: "card-default"/);
  assert.match(source, /MutationObserver/);
  assert.doesNotMatch(source, /toggleStep|checkedSteps|mission-checklist/);
});

test("ships the complete Make Local bootstrap contract", async () => {
  for (const name of ["setup", "install", "dev", "verify", "env", "dev.json"]) {
    await access(new URL(`../.figma/make/${name}`, import.meta.url));
  }
  const config = JSON.parse(await readFile(new URL("../.figma/make/dev.json", import.meta.url), "utf8"));
  assert.deepEqual(config.installOn, ["package.json", "package-lock.json"]);
  assert.ok(config.pointAndEdit.paths.prefer.includes("app/lobby.tsx"));
  assert.ok(config.pointAndEdit.paths.deprioritize.includes("app/components/ui.tsx"));
  assert.ok(config.pointAndEdit.paths.exclude.includes("figma/**"));
});

test("defines current JSON code properties separately from Code Connect templates", async () => {
  const propertyDirectory = new URL("../.figma/code-properties/", import.meta.url);
  const propertyFiles = await readdir(propertyDirectory);
  for (const component of ["Button", "Card", "Badge", "LabCard"]) {
    const filename = propertyFiles.find((name) => name.startsWith(`${component}-`) && name.endsWith(".json"));
    assert.ok(filename, `missing hashed code-property definition for ${component}`);
    const json = JSON.parse(await readFile(new URL(filename, propertyDirectory), "utf8"));
    assert.equal(json.schemaVersion, 1);
    assert.equal(json.source.componentName, component);
    await access(new URL(`../figma/${component}.figma.ts`, import.meta.url));
  }
});

test("ships real-product visual references for the guided missions", async () => {
  for (const image of ["branch-picker", "design-mode", "commit-actions", "annotate-for-agent", "copy-designs"]) {
    await access(new URL(`../public/tour/${image}.webp`, import.meta.url));
  }
});
