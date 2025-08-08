# Dream Drive Monorepo

This is a monorepo containing the Dream Drive applications and shared libraries.

## Structure

```
dream-drive/
├── apps/
│   └── drive-dream/          # Main Dream Drive Next.js application
├── libs/                     # Shared libraries (future)
├── tools/                    # Build tools and scripts (future)
└── package.json              # Root package.json with all dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

To start the Drive Dream app in development mode:

```bash
pnpm dev
# or
nx serve drive-dream
```

### Building

To build the Drive Dream app:

```bash
pnpm build
# or
nx build drive-dream
```

### Other Commands

- `pnpm lint` - Lint the Drive Dream app
- `pnpm build:all` - Build all apps
- `pnpm lint:all` - Lint all apps

## Apps

### Drive Dream (`apps/drive-dream`)

The main Dream Drive application - a Next.js app for generating AI-powered driving videos.

See [apps/drive-dream/README.md](./apps/drive-dream/README.md) for more details.

## Technology Stack

- **Framework**: Next.js 15
- **Build System**: Nx
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI
- **Database**: Supabase
- **AI/ML**: Replicate
- **Payments**: Stripe
