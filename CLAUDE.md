# CLAUDE.md - Project Guidelines

## Project Overview
Flashcard From Document - A static web app that allows users to upload documents and create flashcards using Anthropic's Claude API.

## Core Features
- Document upload and text extraction
- Flashcard generation via Claude API
- Local storage for API keys and flashcard sets
- Responsive design for all device types

## Development principles

1. Create a clean, functional and minimal app.
2. Always prefer quality. Always improve existing code. Tests make this low-risk.
3. Claude will manage the whole development process.

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Implement the feature in the simplest and cleanest way.
   - Implement a simple and clean test.
   - ALWAYS remove old code if it is no longer required.

2. **Testing Requirements**
   - ALL code changes MUST have corresponding tests
   - Run the full test suite with `npm run test` prior to every commit
   - Tests MUST pass before any commit

3. **Pre-Commit Checklist**
   BEFORE git commit, always do ALL of the following:

   - `npm run typecheck && npm run lint && npm run test`
   - Update version in package.json (increment according to semver)
     - Major: Breaking changes
     - Minor: New features
     - Patch: Bug fixes
   - Display version is shown to users, so this is REQUIRED

   There are no commit message requirements.

5. **Deployment Process**
   The app is deployed via GitHub workflows to GitHub pages. When deploying,
   always do ALL of the following.

   - `git push`
   - `sleep 5 && gh run list | head -5`
   - If any more waiting is required, link the user to https://github.com/maxeonyx/flashcard-from-document/actions/workflows/static.yml
   - If failed check logs for the given run(s): `sleep 5 && gh run view <run-id> --log-failed`
   - Verify https://maxeonyx.github.io/flashcard-from-document/ with WebFetchTool
   - If successful, link the user to the working application.
   
6. **Deployment Configuration**
   - `static.yml` - GitHub's standard Pages workflow (configured for our Vue.js app)
   - GitHub Pages must be enabled in repository Settings > Pages
     - Source should be set to "GitHub Actions"

## Tech stack

- Vue.js
- Anthropic SDK
- TypeScript
- GitHub actions
- GitHub pages

## Commands

### Deployment Monitoring Commands
- `gh run list` - Check GitHub Actions workflow status
- `gh run view <run-id>` - View summary of a specific workflow run
- `gh run view <run-id> --log` - View complete logs of a workflow run
- `gh run view <run-id> --log-failed` - View only the failed steps in a workflow run
- `gh run rerun <run-id>` - Rerun a failed workflow

## API Considerations
- Using Anthropic API directly from browser 
- Secure API key handling in localStorage (never stored on server)
- Implement rate limiting to prevent excessive API usage
- Comprehensive error handling and user feedback

## Key Project Files

- `.github/workflows/static.yml` - GitHub-generated workflow (configured for our Vue.js app)
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component
- `src/features/` - Feature-based UI components
  - `api-key/ApiKeyInput.vue` - API key management component
  - `document-upload/DocumentUploader.vue` - Document upload and processing component
  - `flashcard-display/FlashcardDisplay.vue` - Flashcard display and navigation component
- `src/composables/` - Reusable logic hooks
  - `useApiKey.ts` - API key management logic
  - `useDocumentUpload.ts` - Document processing logic
  - `useFlashcardGeneration.ts` - Claude flashcard generation logic
  - `useFlashcards.ts` - Flashcard management logic
  - `useLocalStorage.ts` - localStorage integration
- `src/services/claude.ts` - Claude API integration
- `src/types/index.ts` - TypeScript type definitions
- `tests/app.spec.ts` - End-to-end tests
- `public/index.html` - HTML template
- `public/favicon.ico` - Site favicon

## Version History

Always update both this file `CLAUDE.md` AND `package.json`.

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