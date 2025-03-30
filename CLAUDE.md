# CLAUDE.md - Project Guidelines

## Project Overview
Flashcard From Document - A static web app that allows users to upload documents and create flashcards using Anthropic's Claude API.

## Core Features
- Document upload and text extraction
- Flashcard generation via Claude API
- Local storage for API keys and flashcard sets
- Responsive design for all device types

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Create a feature branch from main
   - Implement the new feature or fix
   - Write corresponding tests for the new functionality

2. **Testing Requirements**
   - ALL code changes MUST have corresponding tests
   - Run the full test suite: `npm run test`
   - Tests MUST pass before any commit
   - Visual inspection in browser is also required: `npm run dev`

3. **Pre-Commit Checklist**
   - Run type checking: `npm run typecheck`
   - Run linting: `npm run lint`
   - Run tests: `npm run test`
   - Update version in package.json (increment according to semver)
     - Major: Breaking changes
     - Minor: New features
     - Patch: Bug fixes
   - Display version is shown to users, so this is REQUIRED

4. **Committing Code**
   - Use descriptive, present-tense commit messages
   - Reference related issue numbers when applicable
   - Include scope of changes (e.g., "feat(upload): add drag-and-drop support")

5. **Deployment Process**
   - Push to GitHub to trigger the deployment workflow
   - ALWAYS monitor deployment status: `gh run list`
   - Verify the deployed application works in production
   - If issues are found, fix and re-deploy immediately

## Commands
- `npm run dev` - Start development server
- `npm run test` - Run headless browser tests
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `gh run list` - Check GitHub Actions workflow status

## API Considerations
- Using Anthropic API directly from browser
- Secure API key handling in localStorage (never stored on server)
- Implement rate limiting to prevent excessive API usage
- Comprehensive error handling and user feedback

## Key Project Files

### Configuration Files
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - Testing configuration
- `vue.config.js` - Vue.js configuration
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow

### Source Code
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component
- `src/components/` - UI components
  - `HelloWorld.vue` - Example component
- `src/services/claude.ts` - Claude API integration
- `src/stores/flashcards.ts` - State management for flashcards
- `src/types/index.ts` - TypeScript type definitions

### Testing
- `tests/app.spec.ts` - Application tests

### Public Assets
- `public/index.html` - HTML template
- `public/favicon.ico` - Site favicon

## Complete File Structure
```
/
├── .github/                # GitHub configuration
│   └── workflows/          # GitHub Actions workflows
│       └── deploy.yml      # Deployment workflow
├── public/                 # Static assets
│   ├── favicon.ico         # Site favicon
│   └── index.html          # HTML template
├── src/
│   ├── assets/             # Image assets
│   │   └── logo.png        # Vue logo
│   ├── components/         # UI components
│   │   └── HelloWorld.vue  # Example component
│   ├── services/           # API and service layer
│   │   └── claude.ts       # Claude API integration
│   ├── stores/             # State management
│   │   └── flashcards.ts   # Flashcard state store
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point
├── tests/                  # Playwright tests
│   └── app.spec.ts         # Application tests
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore patterns
├── CLAUDE.md               # Project guidelines (this file)
├── README.md               # Project overview
├── babel.config.js         # Babel configuration
├── jsconfig.json           # JavaScript config
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Testing configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # Node-specific TS config
└── vue.config.js           # Vue configuration
```

## Version History
- 0.1.1 - Updated CLAUDE.md with detailed development process and file structure
- 0.1.0 - Initial project setup with Vue.js, TypeScript, and testing