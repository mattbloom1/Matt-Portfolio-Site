import { defineField, defineType } from 'sanity';

export const DISCIPLINES = ['Web design', 'Graphic design', 'Creative technology', 'Direction', 'Motion', 'Photography', 'Other'];

const project = defineType({
  name: 'project', title: 'Project', type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'summary', type: 'text', rows: 3 }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'year', type: 'number' }),
    defineField({ name: 'disciplines', type: 'array', of: [{ type: 'string' }], options: { list: DISCIPLINES } }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'clientOrContext', type: 'string', description: 'Only if publishable.' }),
    defineField({ name: 'collaborators', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'accent', title: 'Project colour', type: 'string', description: 'Hex, e.g. #c4b268. Colour is project-led.' }),
    defineField({ name: 'heroMedia', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'caseStudyBlocks', type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'caption', type: 'string' }] },
        { type: 'object', name: 'videoEmbed', fields: [{ name: 'url', type: 'url' }, { name: 'caption', type: 'string' }] },
        { type: 'object', name: 'pullQuote', fields: [{ name: 'text', type: 'text' }, { name: 'attribution', type: 'string' }] },
      ],
    }),
    defineField({ name: 'credits', type: 'array', of: [{ type: 'object', name: 'credit', fields: [{ name: 'name', type: 'string' }, { name: 'role', type: 'string' }] }] }),
    defineField({ name: 'relatedProjects', type: 'array', of: [{ type: 'reference', to: [{ type: 'project' }] }] }),
    defineField({ name: 'seoTitle', type: 'string' }),
    defineField({ name: 'seoDescription', type: 'text', rows: 2 }),
  ],
});

const craft = defineType({
  name: 'craft', title: 'Craft / experiment', type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'summary', type: 'text', rows: 2 }),
    defineField({ name: 'year', type: 'number' }),
    defineField({ name: 'media', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: 'notes', title: 'Notes / caption', type: 'text', rows: 2 }),
    defineField({ name: 'relatedProject', type: 'reference', to: [{ type: 'project' }] }),
  ],
});

const experience = defineType({
  name: 'experience', title: 'Experience entry', type: 'document',
  fields: [
    defineField({ name: 'organization', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'startDate', type: 'string', description: 'Year or month/year' }),
    defineField({ name: 'endDate', type: 'string', description: 'Leave empty for current' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'relatedProjects', type: 'array', of: [{ type: 'reference', to: [{ type: 'project' }] }] }),
    defineField({ name: 'sortOrder', type: 'number', description: 'Lower numbers appear first.' }),
  ],
});

export const schemaTypes = [project, craft, experience];
