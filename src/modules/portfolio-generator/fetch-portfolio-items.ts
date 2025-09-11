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

// Cache control: Set to true to use existing screenshots/colors, false to replace them
const USE_CACHE = false;

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
async function createContentEntry(item: any, screenshotPath: string, isNewScreenshot: boolean) {
  const slug = item.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
    
  const contentPath = path.join(PORTFOLIO_CONTENT_DIR, `${slug}.json`);
  
  // Check if content file already exists
  let existingContent: any = {};
  let contentExists = false;
  try {
    await fs.access(contentPath);
    existingContent = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    contentExists = true;
  } catch {
    // Content file doesn't exist
    contentExists = false;
  }
  
  // Determine if we need to calculate average color
  let shouldCalculateAverageColor = false;
  let averageColorHex = existingContent.averageColor || '#6366f1'; // Use existing or default
  
  if (isNewScreenshot) {
    // Always recalculate average color when a new screenshot is taken
    shouldCalculateAverageColor = true;
    console.log(`🔄 New screenshot taken, will recalculate average color...`);
  } else if (!contentExists || !existingContent.averageColor) {
    // Calculate average color if content doesn't exist or doesn't have average color
    shouldCalculateAverageColor = true;
    console.log(`🎨 Content entry missing average color, calculating...`);
  } else {
    console.log(`⚡ Using existing average color: ${existingContent.averageColor}`);
  }
  
  // Calculate average color if needed
  if (shouldCalculateAverageColor) {
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
      console.warn(`   Using ${existingContent.averageColor ? 'existing' : 'default'} color: ${averageColorHex}`);
    }
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
  
  // Determine if we should update the content file
  let shouldUpdateContent = false;
  
  if (!contentExists) {
    console.log(`✨ Creating new content entry: ${path.basename(contentPath)}`);
    shouldUpdateContent = true;
  } else if (isNewScreenshot || shouldCalculateAverageColor) {
    console.log(`🔄 Updating content entry with new data: ${path.basename(contentPath)}`);
    shouldUpdateContent = true;
  } else if (USE_CACHE) {
    console.log(`⚡ Using cached content entry: ${path.basename(contentPath)}`);
    shouldUpdateContent = false;
  } else {
    console.log(`🔄 Updating content entry (cache disabled): ${path.basename(contentPath)}`);
    shouldUpdateContent = true;
  }
  
  if (shouldUpdateContent) {
    // Write the content file
    await fs.writeFile(contentPath, JSON.stringify(content, null, 2));
    console.log(`✅ Content entry saved: ${path.basename(contentPath)}`);
  }
  
  return { contentPath, slug };
}

/**
 * Takes a screenshot of a URL and saves it
 */
async function captureAndSaveScreenshot(url: string, outputPath: string) {
  try {
    // Check if file already exists
    let fileExists = false;
    try {
      await fs.access(outputPath);
      fileExists = true;
      console.log(`📁 Screenshot already exists: ${path.basename(outputPath)}`);
    } catch {
      console.log(`📁 Screenshot does not exist: ${path.basename(outputPath)}`);
      fileExists = false;
    }
    
    // If file exists and we're using cache, skip capture
    if (fileExists && USE_CACHE) {
      console.log(`⚡ Using cached screenshot: ${path.basename(outputPath)}`);
      return { success: true, isNewScreenshot: false };
    }
    
    // Capture new screenshot (either file doesn't exist or we're not using cache)
    if (fileExists && !USE_CACHE) {
      console.log(`🔄 Replacing existing screenshot: ${path.basename(outputPath)}`);
      // Delete existing file before capturing new screenshot
      await fs.unlink(outputPath);
      console.log(`🗑️ Deleted existing screenshot: ${path.basename(outputPath)}`);
    } else {
      console.log(`📸 Taking new screenshot: ${path.basename(outputPath)}`);
    }
    
    console.log(`📸 Capturing screenshot of ${url}...`);
    await captureWebsite.file(url, outputPath, SCREENSHOT_OPTIONS);
    console.log(`✅ Screenshot saved to: ${outputPath}`);
    return { success: true, isNewScreenshot: true };
  } catch (error) {
    console.error(`❌ Failed to capture screenshot for ${url}:`, error.message);
    return { success: false, isNewScreenshot: false };
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
  console.log(`🔧 USE_CACHE setting: ${USE_CACHE} ${USE_CACHE ? '(will use existing files)' : '(will replace existing files)'}`);
  
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
    const result = await captureAndSaveScreenshot(item.webURL, screenshotPath);
    
    if (result.success) {
      // Create content entry
      await createContentEntry(item, screenshotPath, result.isNewScreenshot);
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
