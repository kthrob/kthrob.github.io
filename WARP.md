# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies (Bun preferred)
bun install

# Start development server
bun run dev
# Server runs at http://localhost:4321

# Build production site
bun run build

# Preview production build locally
bun run preview

# Generate portfolio screenshots and content
bun run generate
```

### Alternative Package Manager Commands
All commands can use `npm`, `pnpm`, or `yarn` instead of `bun`.

## Architecture Overview

### Core Technologies
- **Astro 5.x**: Static site generator with component islands
- **Tailwind CSS 4.x**: Utility-first styling with custom CSS variables
- **TypeScript**: Type safety across components and configurations

### Key Architecture Patterns

#### 1. Configuration-Driven Content
The site uses a centralized configuration approach:
- `src/config/page.config.ts`: Main resume data (experience, education, portfolio items)
- `src/config.yaml`: Site metadata, SEO, analytics, and app settings
- Content is typed with comprehensive TypeScript interfaces

#### 2. Content Collections System
Astro's content collections handle multiple content types:
- **Portfolio**: Auto-generated from `page.config.ts` + screenshots
- **Blog/Posts**: MDX files with frontmatter validation
- **Insights**: Shorter content pieces with image metadata
- All collections use Zod schemas for runtime validation

#### 3. Custom Astro Integration
The `vendor/integration/` directory contains a custom Astro integration that:
- Processes the YAML configuration into runtime constants
- Manages sitemap generation and robots.txt updates
- Provides virtual modules for config access (`promethic:config`)

#### 4. Component Architecture
- **Layouts**: `Layout.astro` (basic), `Layout_Custom.astro` (enhanced)
- **Sections**: Hero, Portfolio, Resume, Skills (carousel)
- **Widgets**: Reusable UI components with consistent patterns
- **Common**: Shared utilities (ThemeToggle, Metadata, etc.)

#### 5. Asset Pipeline
- **Logo Management**: Centralized logo data in `src/components/data/logos.ts`
- **Portfolio Screenshots**: Automated capture via `capture-website`
- **Color Analysis**: Automatic dominant color extraction for portfolio items
- **Image Optimization**: Sharp integration for responsive images

### Portfolio Generation System

The portfolio system is sophisticated:

1. **Configuration**: Portfolio items defined in `src/config/page.config.ts`
2. **Screenshot Generation**: `bun run generate` captures live website screenshots
3. **Color Analysis**: Extracts dominant colors for theming
4. **Content Creation**: Auto-generates JSON files in `src/content/portfolio/`
5. **Caching**: Configurable cache control to avoid unnecessary regeneration

### Development Workflows

#### Adding Portfolio Items
1. Add item to `pageConfig.portfolio` in `src/config/page.config.ts`
2. Run `bun run generate` to capture screenshot and create content
3. Portfolio automatically appears on homepage

#### Content Management
- Blog posts: Add MDX files to `src/content/blog/`
- Insights: Add MDX files to `src/content/insights/`
- Portfolio: Use the generation system rather than manual creation

#### Theme Customization
- CSS custom properties in global styles
- Tailwind configuration in `_tailwind.config.mjs` 
- Theme toggle system with localStorage persistence

### Build Process

#### Production Builds
1. TypeScript compilation and type checking (`astro check`)
2. Static site generation with optimization
3. Asset compression (CSS, JS, Images)
4. HTML minification with `process-html.mjs`
5. Sitemap and robots.txt generation via custom integration

#### Performance Features
- Static site generation for optimal loading
- Image optimization with Sharp
- CSS/JS minification and compression
- Brotli/Gzip compression support

### Styling System

#### CSS Architecture
- CSS custom properties for theme variables
- Tailwind utility classes for component styling
- Responsive design with mobile-first approach
- Dark/light theme system with automatic preference detection

#### Theme Variables
Colors and spacing use CSS custom properties:
- `--color-primary`, `--color-secondary`
- `--color-text`, `--color-text-offset`
- `--color-background`, `--color-background-offset`

This allows runtime theme switching and easy customization.

### File Structure Patterns

#### Import Aliases
- `~/`: Points to `src/` directory
- `@/`: Alternative alias to `src/` directory

#### Content Organization
- Configuration files in `src/config/`
- Reusable data in `src/components/data/`
- Content collections in `src/content/[collection]/`
- UI components organized by purpose in `src/components/`

This architecture enables maintainable, type-safe development while supporting automated content generation and optimal performance.