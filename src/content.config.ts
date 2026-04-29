import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blogSchema = ({ image }: { image: any }) =>
	z.object({
		title: z.string(),
		description: z.string(),
		titleEn: z.string().optional(),
		descriptionEn: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.optional(image()),
		tags: z.array(z.string()).optional(),
	});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			titleEn: z.string().optional(),
			descriptionEn: z.string().optional(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			tags: z.array(z.string()).optional(),
		}),
});

const blogEn = defineCollection({
	loader: glob({ base: './src/content/blog-en', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => blogSchema({ image }),
});

const blogZh = defineCollection({
	loader: glob({ base: './src/content/blog-zh', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => blogSchema({ image }),
});

export const collections = { blog, 'blog-en': blogEn, 'blog-zh': blogZh };
