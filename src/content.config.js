import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const socials = defineCollection({
	loader: file('src/data/socials.json'),
	schema: z.object({
		id: z.string(),
		name: z.string(),
		url: z.url(),
		order: z.number(),
	}),
});

const works = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/data/works' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			year: z.number(),
			role: z.string(),
			stack: z.array(z.string()),
			tags: z.array(z.string()),
			cover: image(),
			coverAlt: z.string(),
			repo: z.url().optional(),
			live: z.url().optional(),
		}),
});

export const collections = { socials, works };
