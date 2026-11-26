import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6zrc4vv3'; // public id, safe to commit
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/** Build-time CMS client. Each section falls back to the seed content in seed.ts when the CMS has no entries. */
export const client = projectId ? createClient({ projectId, dataset, apiVersion: '2024-10-01', useCdn: true }) : null;

const builder = client ? createImageUrlBuilder(client) : null;
export const urlFor = (src: unknown): string | undefined =>
  builder && src ? builder.image(src as never).width(1400).auto('format').url() : undefined;
