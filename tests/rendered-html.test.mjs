import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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
  assert.match(html, /Design in the real thing/);
  assert.match(html, /Make a safe branch/);
  assert.match(html, /Inspect and restore/);
  assert.match(html, /Annotate with context/);
  assert.doesNotMatch(html, /Restore a checkpoint/);
  assert.match(html, /Do this in Make Local/);
  assert.match(html, /tour\/branch-picker\.webp/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships the complete Make Local bootstrap contract", async () => {
  for (const name of ["setup", "install", "dev", "verify", "env", "dev.json"]) {
    await access(new URL(`../.figma/make/${name}`, import.meta.url));
  }
  const config = JSON.parse(await readFile(new URL("../.figma/make/dev.json", import.meta.url), "utf8"));
  assert.deepEqual(config.installOn, ["package.json", "package-lock.json"]);
  assert.ok(config.pointAndEdit.paths["local-library"].includes("app/components/**"));
});

test("defines current JSON code properties separately from Code Connect templates", async () => {
  for (const component of ["Button", "Card", "Badge"]) {
    const json = JSON.parse(await readFile(new URL(`../.figma/code-properties/${component}.json`, import.meta.url), "utf8"));
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
