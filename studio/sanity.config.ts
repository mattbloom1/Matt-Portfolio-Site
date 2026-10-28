import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

// Set SANITY_STUDIO_PROJECT_ID after running `npx sanity init` (free plan is enough).
export default defineConfig({
  name: 'default',
  title: 'Matthew Bloomfield Portfolio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
