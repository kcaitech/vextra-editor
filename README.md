# Vextra Editor

![Vextra Editor Example](example.png)

## Project Introduction
A visual editor for design file parsing and editing, supporting multiple design file formats (such as Figma, Sketch, etc.). It can be used for secondary development, design preview, property editing, batch export, and other scenarios. Suitable for design tool development, online collaboration, automated design file processing, and other requirements.

## Key Features
- Support for parsing and rendering multiple design file formats
- Rich property panels and layer operations
- Componentized, extensible frontend architecture
- Support for advanced features like batch image cutting, export, auto-layout, etc.
- Excellent local development and secondary development support

## Installation

```bash
npm i @kcaitech/vextra-editor
```

## Quick Start

```ts
import { openDocument } from '@kcaitech/vextra-editor';

const result = await openDocument({
  // Pass your document parameters
  ...props
});
```

> You can also refer to `client/Client.vue` as a usage example.

## Local Development

#### Start the client interface

```bash
npm i
npm run client

# Open files in the samples directory
```

### Library Development

```bash
npm i
npm run dev
```

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE.txt) file for details.

## Author

- [KCai Technology](https://kcaitech.com)
- [Vextra Official Website](https://vextra.cn)
