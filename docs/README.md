kcdesign-editor / [Exports](modules.md)

# vextra editor

## Project Introduction
vextra editor is a visual editor for design file parsing and editing, supporting multiple design file formats (such as Figma, Sketch, etc.). It can be used for secondary development, design preview, property editing, batch export, and other scenarios. It is suitable for design tool development, online collaboration, automated design file processing, and other requirements.

## Key Features
- Support for parsing and rendering multiple design file formats
- Rich property panels and layer operations
- Componentized, extensible frontend architecture
- Support for advanced features like batch image cutting, export, auto layout, etc.
- Excellent local development and secondary development support

## Installation

```bash
npm i @vextra/editor
```

## Quick Start

```ts
import { openDocument } from '@vextra/editor';

const result = await openDocument({
  // Pass your document parameters
  ...props
});
```

> You can also refer to `client/Client.vue` as a usage example.

## Local Development

### Install Dependencies

```bash
npm install
```

### Start Development Environment

#### Start Core Library

```bash
npm run dev
```

#### Start Client Interface

```bash
cd client
npm install
npm run client

# Open files in the samples directory for use
```

## LICENSE

AGPL-3.0
