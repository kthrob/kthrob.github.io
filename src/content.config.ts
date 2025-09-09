// https://docs.astro.build/en/guides/content-collections/#defining-collections

import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

import colors from 'tailwindcss/colors';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();


// const navLinks = defineCollection({
//   loader: file('./src/content/navigation/navigation.json', { parser: (text) => JSON.parse(text).navBarLinks }),
//   schema: z.array(
//     z.object({
//       isEnabled: z.boolean().default(false),
//       name: z.string(),
//       displayLabel: z.string(),
//       translation: z.enum(['es', 'fr', 'none']).default('none'),
//       href: z.string(),
//       target: z.enum(['_self', '_blank']).default('_self'),
//       subLinks: z
//         .array(
//           z.object({
//             isEnabled: z.boolean().default(false),
//             name: z.string(),
//             displayLabel: z.string(),
//             translation: z.enum(['es', 'fr', 'none']).default('none'),
//             slug: z.string(),
//             type: z.enum(['blog', 'asset', 'category', 'tag', 'post', 'home', 'page']).default('page'),
//             target: z.enum(['_self', '_blank']).default('_self'),
//           })
//         )
//         .optional(),
//     })
//   ),
// });

// const footerLinks = defineCollection({
//   loader: file('./src/content/navigation/navigation.json', { parser: (text) => JSON.parse(text).footerLinks }),
//   schema: z.array(
//     z.object({
//       sectionLabel: z.string(),
//       isGroup: z.boolean().default(true),
//       links: z.array(
//         z.object({
//           isEnabled: z.boolean().default(false),
//           name: z.string(),
//           displayLabel: z.string(),
//           translation: z.enum(['es', 'fr', 'none']).default('none'),
//           slug: z.string(),
//           type: z.enum(['blog', 'asset', 'category', 'tag', 'post', 'home', 'page']).default('page'),
//           target: z.enum(['_self', '_blank']).default('_self'),
//         })
//       ),
//     })
//   ),
// });





// from sf
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      contents: z.array(z.string()),
      author: z.string(),
      role: z.string().optional(),
      authorImage: image(),
      authorImageAlt: z.string(),
      pubDate: z.date(),
      cardImage: image(),
      cardImageAlt: z.string(),
      readTime: z.number(),
      tags: z.array(z.string()).optional(),
    }),
});

// from resume-theme
const blogsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    datetime: z.string(),
    image: z.string().optional(),
  }),

});

// from aw
const postCollection = defineCollection({
  loader: glob({ pattern: [ '*.md', '*.mdx' ], base: 'src/content/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

// from sf
const insightsCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/insights',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // contents: z.array(z.string()),
      cardImage: image(),
      cardImageAlt: z.string(),
    }),
});

const siteConfiguration = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx,yaml,json}',
    base: './src/content/config/site',
  }),
  // schema: z.object({
  //   name: z.string(),
  // }),
});

const portfolioCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx,json}',
    base: './src/content/portfolio',
  }),
  schema: z.object({
    imgSrc: z.string().url(),
    title: z.string(),
    skills: z.array(z.string()),
    descripcion: z.string(),
    demoURL: z.string().url().optional(),
    repoURL: z.string().url().optional(),
  }),
});

export const collections = {
  post: postCollection,
  site: siteConfiguration,
  blog: blogCollection,
  blogs: blogsCollection,
  insights: insightsCollection,
  portfolio: portfolioCollection,
};