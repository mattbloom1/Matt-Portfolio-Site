import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6zrc4vv3'; // public id, safe to commit
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/** Null until a Sanity project exists; the site then uses clearly marked placeholders. */
export const client = projectId ? createClient({ projectId, dataset, apiVersion: '2024-10-01', useCdn: true }) : null;

const builder = client ? imageUrlBuilder(client) : null;
export const urlFor = (src: unknown): string | undefined =>
  builder && src ? builder.image(src as never).width(1400).auto('format').url() : undefined;
