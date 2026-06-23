# Simply Blocks

> An open-source, modular, expandable alternative to Scratch with Python, JavaScript, TypeScript, and HTML integrations and side-by-side coding. Built for improving learning.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)


## What is Simply Blocks?

Simply Blocks is a visual programming environment designed to bridge the gap between block-based coding and real-world programming languages. Unlike Scratch, Simply Blocks is built from the ground up to grow with the learner — from dragging puzzle-piece blocks to writing full Python, JavaScript, TypeScript, or HTML code, all in the same editor.



## Mission

Most block-based coding tools are dead ends. They teach the idea of programming but lock learners inside a toy environment with no path forward. Simply Blocks is built on the belief that **the transition from visual to textual coding should be gradual, not a cliff**.

Our goals:
- **Lower the barrier** to programming for beginners and younger learners
- **Eliminate the wall** between visual and text-based coding with live bidirectional sync
- **Stay open** — free to use, free to extend, free to self-host
- **Be modular** — teachers, developers, and communities can add their own block libraries and language targets

## Features

- **Scratch-style puzzle-piece blocks** with tabs, notches, C-shaped containers, and E-shaped if/else blocks
- **Block palette** with categorised, draggable block templates
- **Drag-and-drop workspace** with snap-to-stack, insert-in-middle, and nested container support
- **Stack-aware dragging** — move an entire connected stack as one unit
- **C/E block containers** — if, loop, and if/else blocks that expand dynamically with nested content
- **Side-by-side code view** — generated code visible alongside the block workspace
- **Multiple language targets** — Python, JavaScript, TypeScript, HTML (planned/in progress)
- **Bidirectional sync** — blocks ↔ code kept in sync as you edit either side



## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Laravel (PHP)
- **Build:** Vite + Rolldown
- **Runtime (planned):** Skulpt (Python in-browser)


## Getting Started

```bash
# Install PHP dependencies
composer install

# Install JS dependencies
bun install

# Copy environment file
cp .env.example .env
php artisan key:generate

# Run database migrations
sail artisan migrate

# Start development server
sail up -d &
bun run dev
```


## Contributing

Simply Blocks is open source under the [GNU GPL v3](LICENSE). Contributions are welcome — whether that's new block definitions, language targets, bug fixes, or documentation.

1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description


## License

[GNU General Public License v3.0](LICENSE) — free to use, modify, and distribute.
