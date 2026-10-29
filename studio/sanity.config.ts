import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'Matthew Bloomfield Portfolio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '6zrc4vv3',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
