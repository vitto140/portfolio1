import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
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

export const collections = { socials };
