# Make Local Lobby

A small, public-safe playground for learning Figma Make Local by using the real product: create a branch, point at rendered UI, edit source-backed properties, review the Git diff, round-trip the result into Figma Design, and restore a checkpoint.

## Open the lobby

### Prerequisites

- Figma Desktop with Make Local access
- Git
- Node.js 22.13 or newer

### Start

1. Clone this repository to your computer.
2. In Figma Desktop, open Make Local and choose the cloned folder.
3. Watch Make Local check the project, install dependencies, start the dev server, and verify the preview.
4. Follow the five missions shown beside the playground. You should not need a terminal after cloning.

Your changes affect only the clone on your computer until you explicitly push them. The first mission creates a personal `workshop/<name>` branch so `main` remains reusable.

Each mission includes a cropped reference from the real Make Local interface, an exact control path, and a checkable sequence. The screenshots contain no account data and are included only to help learners recognize the surrounding product controls.

## What is configured

- `.figma/make/` contains the complete Make Local bootstrap contract: `setup`, `install`, `dev`, `verify`, `env`, and source-classification settings in `dev.json`.
- `.figma/code-properties/` defines editable properties for `Button`, `Card`, and `Badge` using Make Local's schema-v1 JSON format.
- `figma/*.figma.ts` contains current Code Connect template files for those components.
- `figma.config.json` currently targets public Figma-owned Simple Design System components as development stand-ins. Before a production launch, replace the substitutions with stable node URLs from the dedicated Make Local Lobby library and publish the mappings under the canonical repository.

Code Connect publishing requires a Figma personal access token with Code Connect write access and file read access. Never commit that token.

```bash
FIGMA_ACCESS_TOKEN=... npm run code-connect:parse
FIGMA_ACCESS_TOKEN=... npm run code-connect:publish
```

## Optional collaboration lab

Most users cannot push to the canonical repository. To try the Share and Create PR flows:

1. Fork the repository on GitHub.
2. Clone your fork rather than the canonical repository.
3. Complete the lobby on a workshop branch.
4. Use Make Local to push and create or update the pull request.

Avoid force-pushing shared branches. Review the diff before sharing, keep each version focused, and restore through Make Local so the history remains legible.

## Development

```bash
npm ci
npm run dev
npm test
```

This repository intentionally contains no private Figma packages, credentials, hosted backend, or code copied from the Figma monorepo. The monorepo was used only to verify current product behavior and terminology.
