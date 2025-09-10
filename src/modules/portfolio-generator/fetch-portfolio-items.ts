import { promises as fs } from 'node:fs';
import path from 'path';
import captureWebsite from 'capture-website';
import { getAverageColor } from 'fast-average-color-node';
import { pageConfig } from '~/config/page.config';

// Constants - Find project root by looking for package.json
async function findProjectRoot() {
  let currentDir = process.cwd();
  
  while (true) {
    try {
      await fs.access(path.join(currentDir, 'package.json'));
      return currentDir;
    } catch {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error('Could not find project root (package.json not found)');
      }
      currentDir = parentDir;
    }
  }
}

const PROJECT_ROOT = await findProjectRoot();
const PORTFOLIO_IMAGES_DIR = path.join(PROJECT_ROOT, 'src/assets/images/portfolio');
const PORTFOLIO_CONTENT_DIR = path.join(PROJECT_ROOT, 'src/content/portfolio');

// Configuration options for screenshots
const SCREENSHOT_OPTIONS = {
  width: 1280,
  height: 800,
  scaleFactor: 1,
  fullPage: false,
  delay: 2, // Wait 2 seconds for page to fully load
};

/**
 * Ensures a directory exists, creating it if necessary
 */
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Generates a filename from a title
 */
function generateFilename(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '')       // Remove leading and trailing hyphens
    + '.png';
}

/**
 * Creates a content entry JSON file for a portfolio item
 */
async function createContentEntry(item: any, screenshotPath: string) {
  const slug = item.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
    
  const contentPath = path.join(PORTFOLIO_CONTENT_DIR, `${slug}.json`);
  
  // Calculate average color from the screenshot
  let averageColorHex = '#6366f1'; // Default fallback
  try {
    console.log(`🎨 Calculating average color for ${path.basename(screenshotPath)}...`);
    const averageColor = await getAverageColor(screenshotPath, {
      mode: 'precision',
      algorithm: 'simple',
      ignoredColor: [ 255, 255, 255, 255 ],
    });
    averageColorHex = averageColor.hex;
    console.log(`✨ Average color calculated: ${averageColorHex}`);
  } catch (error) {
    console.warn(`⚠️  Failed to calculate average color for ${path.basename(screenshotPath)}: ${error.message}`);
    console.warn(`   Using default color: ${averageColorHex}`);
  }
  
  // Build the content object (exclude null/undefined values for optional fields)
  const content: any = {
    title: item.title,
    description: item.description || '',
    imgSrc: `~/assets/images/portfolio/${path.basename(screenshotPath)}`,
    skills: item.skills || [],
    anim: "fade-up",
    averageColor: averageColorHex
  };
  
  // Only add optional fields if they have values
  if (item.webURL) {
    content.demoURL = item.webURL;
  }
  if (item.githubURL) {
    content.repoURL = item.githubURL;
  }
  
  // Check if content file already exists and if it has averageColor
  let shouldUpdate = true;
  try {
    await fs.access(contentPath);
    const existingContent = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    if (existingContent.averageColor) {
      console.log(`📄 Content entry already has average color: ${path.basename(contentPath)}`);
      shouldUpdate = false;
    } else {
      console.log(`🔄 Updating content entry with average color: ${path.basename(contentPath)}`);
    }
  } catch {
    // File doesn't exist, create it
    console.log(`✨ Creating new content entry: ${path.basename(contentPath)}`);
  }
  
  if (!shouldUpdate) {
    return { contentPath, slug };
  }
  
  // Write the content file
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2));
  console.log(`✨ Created content entry: ${path.basename(contentPath)}`);
  
  return { contentPath, slug };
}

/**
 * Takes a screenshot of a URL and saves it
 */
async function captureAndSaveScreenshot(url: string, outputPath: string) {
  try {
    // Check if file already exists
    try {
      await fs.access(outputPath);
      console.log(`📁 Screenshot already exists: ${path.basename(outputPath)}`);
      return true; // Skip capture, but consider it successful
    } catch {
      // File doesn't exist, proceed with capture
    }
    
    console.log(`📸 Capturing screenshot of ${url}...`);
    await captureWebsite.file(url, outputPath, SCREENSHOT_OPTIONS);
    console.log(`✅ Screenshot saved to: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to capture screenshot for ${url}:`, error.message);
    return false;
  }
}

/**
 * Main process function
 */
async function processPortfolioItems() {
  // Ensure directories exist
  await ensureDirectoryExists(PORTFOLIO_IMAGES_DIR);
  await ensureDirectoryExists(PORTFOLIO_CONTENT_DIR);
  
  console.log('📊 Starting portfolio screenshot generation...');
  console.log(`Found ${pageConfig.portfolio?.length || 0} portfolio items in page config`);
  
  // Exit if no portfolio items
  if (!pageConfig.portfolio || pageConfig.portfolio.length === 0) {
    console.log('No portfolio items found in page config.');
    return;
  }
  
  // Process each portfolio item
  for (const item of pageConfig.portfolio) {
    // Skip if no webURL
    if (!item.webURL) {
      console.log(`⚠️ Skipping ${item.title} - No webURL provided`);
      continue;
    }
    
    // Generate filename and paths
    const filename = generateFilename(item.title);
    const screenshotPath = path.join(PORTFOLIO_IMAGES_DIR, filename);
    
    // Capture screenshot
    const success = await captureAndSaveScreenshot(item.webURL, screenshotPath);
    
    if (success) {
      // Create content entry
      await createContentEntry(item, screenshotPath);
    }
  }
  
  console.log('🎉 Portfolio generation completed!');
}

// Execute main function
try {
  await processPortfolioItems();
} catch (error) {
  console.error('Error processing portfolio items:', error);
  process.exit(1);
}
