# CLAUDE.md - Project Guidelines

## Project Overview
Flashcard From Document - A static web app that allows users to upload documents and create flashcards using Anthropic's Claude API. The application is designed to be simple, efficient, and user-friendly, with all processing happening client-side for maximum privacy.

## Current Features
- Document upload and text extraction (plaintext only)
- Intelligent flashcard generation via Claude API
- Automatic titling of flashcard sets based on content
- Local storage for API keys and flashcard sets (no server-side storage)
- Multiple flashcard set management
- Interactive flashcard interface with flip animation
- Responsive design for all device types
- Dark/light mode support through system preferences

## Planned Features

### Functionality Enhancements
- Support for more document formats esp. PDF (but also docx, epub, etc.)
- Customizable flashcard templates
- Spaced repetition learning system
- Exportable flashcards (Anki, CSV)
- Categorization and tagging of flashcard sets
- Share / import flashcard sets via URL or QR code (no server storage)

### Technical Improvements
- Performance optimizations for larger flashcard sets

## Development Philosophy

1. **Simplicity First**: Create a clean, functional, and minimal app that does one thing exceptionally well.
2. **Quality Over Features**: Prioritize code quality and user experience over feature quantity.
3. **Iterative Improvement**: Continuously improve existing code with small, well-tested changes.
4. **Privacy by Design**: Keep user data local and respect privacy by avoiding server-side processing.
5. **Accessibility**: Ensure the application is usable by people with diverse abilities and preferences.
6. **AI-Assisted Development**: Leverage Claude for code development, testing, and improvement.

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Implement the feature in the simplest and cleanest way.
   - Implement a simple and clean test.
   - ALWAYS remove old code if it is no longer required.

2. **Testing Requirements**
   - ALL code changes MUST have corresponding tests
   - Run the full test suite with `npm run test` prior to every commit
   - Tests MUST pass before any commit
   - NEVER increase test timeouts to make tests pass. The app should respond immediately to state changes.
   - Use SHORT_TIMEOUT (16ms - one frame) to verify immediate reactivity
   - Use NORMAL_TIMEOUT (100ms) for normal UI operations
   - NEVER use arbitrary timeouts like page.waitForTimeout() - this hides performance issues

3. **Pre-Commit Checklist**
   BEFORE git commit, always do ALL of the following:
   
   - Review added & related code, and make any improvements before committing. A small codebase is a good codebase.
   - `npm run typecheck && npm run lint && npm run test`
   - Before reporting back to the user:
     - Do the tests cover this functionality?
     - Is there any code that can now be cleaned up or refactored?
   - Report back to the user. NEVER just commit - always ask the user first.
     - Summarize the changes, and how the changes are covered by the tests.
     - Ask the user what's next
       - Continue development?
       - Commit and (if the app is changed) push (ie. deploy. You don't have to ask here, just go ahead.)
   - ONLY AFTER the user has confirmed, update the semver version in package.json AND update the version history in CLAUDE.md. The version is shown to users, so this is REQUIRED before committing.

   There are no commit message requirements.

5. **Deployment Process**
   The app is deployed via GitHub workflows to GitHub pages. When deploying,
   always do ALL of the following:

   - `git push`
   - `gh run list --limit 5`
   - `gh run watch <run-id>`
   - Verify the new version is live at https://maxeonyx.github.io/flashcard-from-document/version.json (view it with web fetch)
   - If successful, link the user to the working application.
   
6. **Deployment Configuration**
   - `static.yml` - GitHub's standard Pages workflow (configured for our Vue.js app)
   - GitHub Pages must be enabled in repository Settings > Pages
     - Source should be set to "GitHub Actions"

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript 5.8+
- Pinia for state management
- Modern CSS with flexbox/grid layouts and transitions

### API & Processing
- Anthropic Claude API via @anthropic-ai/sdk
- Browser File API for document handling
- LocalStorage for client-side persistence

### Development & Deployment
- Vite build system
- ESLint for code quality
- Playwright for end-to-end testing
- GitHub Actions for CI/CD
- GitHub Pages for hosting

## Development Commands

### Project Commands
- `npm run build` - Build production-ready assets
- `npm run typecheck` - Check types are valid.
- `npm run lint` - Run ESLint code quality checks
- `npm run test` - Run Playwright end-to-end tests
- Do NOT use `npm run dev` or `npm run preview` - you can't view the output. Use comprehensive tests instead.

### Deployment Monitoring Commands
- `gh run list` - Check GitHub Actions workflow status
- `gh run watch` - View summary of a specific workflow run
- `gh run view <run-id> --log-failed` - View only the failed steps in a workflow run
- `gh run rerun <run-id>` - Rerun a failed workflow

## API Implementation
- Using Anthropic API directly from browser with Claude 3.5 Sonnet model
- Secure API key handling in localStorage (never stored on server)
- Prompt engineering for structured JSON output with title and flashcards
- Comprehensive error handling and user feedback
- Client-side model validation and content preprocessing

## Project Architecture

The project follows a feature-based architecture with composables for reusable logic:

### Core Organization
- `.github/workflows/static.yml` - GitHub workflow for Pages deployment
- `package.json` - Project dependencies and scripts
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component

### Configuration Files
- `eslint.config.js` - ESLint configuration (using the modern flat config format)
- `tsconfig.json` - TypeScript project configuration
- `tsconfig.app.json` - TypeScript configuration for the Vue application
- `tsconfig.node.json` - TypeScript configuration for Node.js environment
- `vite.config.ts` - Vite bundler configuration
- `playwright.config.ts` - End-to-end testing configuration
- `env.d.ts` - TypeScript declarations for Vite environment

> **Note:** The project has been migrated from Vue CLI to Vite.
> ESLint is now using the modern flat configuration format (`eslint.config.js`).

### Feature Components
- `src/features/` - UI components organized by feature
  - `api-key/ApiKeyInput.vue` - API key management component
  - `document-upload/DocumentUploader.vue` - Document upload and processing component
  - `flashcard-display/FlashcardDisplay.vue` - Flashcard display and navigation component

### Logic & State Management
- `src/composables/` - Reusable hooks following the Vue Composition API pattern
  - `useApiKey.ts` - API key management and validation
  - `useDocumentUpload.ts` - Document processing and text extraction
  - `useFlashcardGeneration.ts` - Claude flashcard generation orchestration
  - `useFlashcards.ts` - Flashcard set management and navigation
  - `useLocalStorage.ts` - Reactive localStorage integration

### Services & Types
- `src/services/claude.ts` - Claude API integration and JSON parsing
- `src/types/index.ts` - TypeScript interface definitions
- `src/stores/flashcards.ts` - Pinia store for flashcard state management

### Testing
- `tests/app.spec.ts` - Playwright end-to-end tests
- `playwright.config.ts` - Test configuration

## Version History

Always update both this file `CLAUDE.md` AND `package.json`.

- 0.5.3 - Added PDF support using Anthropic API's native PDF handling capability
- 0.5.2 - Completely refactored state management to use Pinia store as single source of truth, fully fixing reactivity issues
- 0.5.1 - Initial fix for reactivity issue with flashcard sets not appearing until page reload
- 0.5.0 - Implemented key UI improvements: added bin icon for deletion, added flashcard editing, and API key onboarding flow
- 0.4.2 - Added version.json generation at build time and display in UI footer
- 0.4.1 - Migrated ESLint configuration from .eslintrc.cjs to eslint.config.js (flat config)
- 0.4.0 - Migrated build system from Vue CLI to Vite
- 0.3.8 - Enhanced pre-commit process with user interaction and decision points
- 0.3.7 - Updated project documentation with features, architecture, and roadmap
- 0.3.6 - Fixed flashcard display issues with answer formatting and automatic selection
- 0.3.5 - Added automatic title generation for flashcard sets
- 0.3.4 - Fixed JSON parsing of Claude API responses to correctly handle direct JSON output
- 0.3.3 - Updated Claude model to claude-3-5-sonnet-20241022 to fix API compatibility issue
- 0.3.2 - Fixed JSON parsing from Claude responses and improved prompt for better flashcard generation
- 0.3.1 - Fixed Anthropic API browser compatibility by adding dangerouslyAllowBrowser option
- 0.3.0 - Major refactoring: Reorganized project structure with feature-based folders, added composables, improved loading states, and accessibility
- 0.2.2 - Fixed ESLint dependencies for GitHub Pages deployment
- 0.2.1 - Converted application to TypeScript and modernized Vue components
- 0.2.0 - Implemented core flashcard generation functionality
- 0.1.5 - Updated GitHub Pages static workflow with build and test steps
- 0.1.4 - Added GitHub Pages configuration requirements to documentation
- 0.1.3 - Added Playwright browser installation to CI/CD workflow
- 0.1.2 - Fixed GitHub Actions workflow and added detailed deployment monitoring instructions
- 0.1.1 - Updated CLAUDE.md with detailed development process and file structure
- 0.1.0 - Initial project setup with Vue.js, TypeScript, and testing